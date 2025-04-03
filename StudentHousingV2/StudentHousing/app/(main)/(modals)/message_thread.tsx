import { Link, router, Router, useNavigation, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";

import { Input, View, Text, useTheme, Button, ScrollView } from "tamagui";

import { useLocalSearchParams } from "expo-router";
import { User, TextMessageProps, Profile } from "@/typings";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabase";

import { ChevronLeft as ChevronLeftIcon, Ellipsis as EllipsisIcon, Send as SendIcon } from "@tamagui/lucide-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const Header: React.FC<{
  conversationId: string;
}> = ({ conversationId }) => {
  const [profile, setProfile] = useState<Profile>();

  const gotoUserProfile = () => {
    router.push({
      pathname: "/profile",
      params: {
        profile: JSON.stringify(profile),
      },
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase.functions.invoke(
        "get_profile_data",
        {
          body: {
            userId: conversationId,
          },
        }
      );

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data.profile);
      }
    };

    fetchProfile();
  }, [conversationId]);

  const theme = useTheme();

  return (
    <View bg={"$color2"} style={styles.headerContainer}>
      <Button
        circular={true}
        bg={"$color6"}
        minW={"$2"}
        minH={"$2"}
        maxW={"$2"}
        maxH={"$2"}
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <ChevronLeftIcon />
      </Button>
      <View style={styles.userInfoContainer}>
        <TouchableOpacity onPress={gotoUserProfile}>
          <Image
            source={profile?.media?.[0]}
            style={styles.userImage}
            transition={0}
          />
        </TouchableOpacity>
        <View>
          <Text color={"$white5"} style={styles.userName}>
            {profile?.title}
          </Text>
          <Text color={"$white8"}>Added today!</Text>
        </View>
      </View>
      <Button
        circular={true}
        bg={"$color6"}
        minW={"$2"}
        minH={"$2"}
        maxW={"$2"}
        maxH={"$2"}
        style={styles.menuButton}
      >
        <EllipsisIcon />
      </Button>
    </View>
  );
};

const TextMessage: React.FC<TextMessageProps> = ({ sender, content }) => (
  <View
    style={[
      styles.messageContainer,
      sender
        ? { justifyContent: "flex-end" }
        : { justifyContent: "flex-start" },
    ]}
  >
    <Text
      bg={sender ? "$blue7" : "$white10"}
      style={[
        styles.messageText,
        sender ? styles.senderMessage : styles.receiverMessage,
      ]}
    >
      {content}
    </Text>
  </View>
);

const MessageThread = () => {
  const { session } = useAuth();
  const [textInputMessage, setTextInputMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<TextMessageProps[]>([]);


  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  const theme = useTheme();

  const getMessageHistory = async (conversation_id: string) => {
    const userId = session!.user.id;
    try {
      const { data: messageData, error: messageError } = await supabase
        .from("conversation_messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", { ascending: true });

      setMessageHistory(
        messageData?.map((msg) =>
          msg.sender_id === userId
            ? { ...msg, sender: true }
            : { ...msg, sender: false }
        ) || []
      );
    } catch (error) {
      console.error("Error fetching potential matches:", error);
    }
  };

  useEffect(() => {
    setMessageHistory([]);

    getMessageHistory(conversationId);

    const channel = supabase.channel("messages");

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversation_messages" },
        (payload) => {
          const newMessage = payload.new as TextMessageProps;
          const userId = session?.user.id;

          if (newMessage.sender_id !== userId) {
            setMessageHistory((prev) => [
              ...prev,
              { ...newMessage, sender: false },
            ]);
          }
        }
      )
      .subscribe((status) => {});

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!session?.user.id) return;

    const userId = session.user.id;
    let conversation_id = String(conversationId);

    try {
      const { data: existingConversation, error: checkError } = await supabase
        .from("conversation_registry")
        .select("id")
        .eq("id", conversation_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking conversation:", checkError);
        return;
      }

      if (!existingConversation) {
        const { data: newConversation, error: createError } = await supabase
          .from("conversation_registry")
          .insert({ id: conversation_id })
          .select("id")
          .single();

        if (createError) {
          console.error("Error creating conversation:", createError);
          return;
        }

        if (newConversation) conversation_id = newConversation.id;

        const { error: membersError } = await supabase
          .from("conversation_members")
          .upsert([
            { conversation_id: conversation_id, user_id: userId },
            { conversation_id: conversation_id, user_id: conversation_id },
          ]);

        if (membersError) {
          console.error("Error adding members to conversation:", membersError);
          return;
        }
      }

      const message: TextMessageProps = {
        content: textInputMessage,
        sender_id: userId,
        conversation_id: conversation_id,
        status: "sending" as const,
        sender: true,
      };

      setMessageHistory((prev) => [...prev, message]);

      const { error } = await supabase.from("conversation_messages").insert({
        content: textInputMessage,
        sender_id: userId,
        conversation_id: conversation_id,
        status: "delivered",
      });

      if (error) {
        console.error("Error sending message:", error);
        return;
      }

      setMessageHistory((prev) =>
        prev.map((msg) =>
          msg.content === textInputMessage
            ? { ...msg, status: "delivered" }
            : msg
        )
      );

      setTextInputMessage("");
    } catch (error) {
      console.error("Unexpected error sending message:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color2.val,
    }}>
      
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
    >
      <Header conversationId={conversationId} />
      <View flex={1} bg={'$background'}>
             <ScrollView bg={'$background'} flex={1} paddingBlock={'$4'}>
        <View style={{ flex: 1, paddingHorizontal: 8, gap: 4 }}>
          {messageHistory &&
            messageHistory.map((message, index) => (
              <View key={index} style={{ position: "relative", width: "100%" }}>
                <TextMessage
                  key={message.message_id}
                  sender={message.sender}
                  status={message.status}
                  content={message.content}
                  sender_id={message.sender_id}
                  conversation_id={message.conversation_id}
                />
              </View>
            ))}
        </View>
      </ScrollView> 
      
      <View flexDirection="row" background={'$background'} items="center" paddingInline={'$4'} paddingBlock={'$2'} gap={8}>
        <View bg={'$color2'} flex={1} paddingInline={'$4'} paddingBlock={'$2'} rounded={'$9'}>
          <Input
            outline="none"
            borderWidth={0}
            
            placeholder="Write your message here"
            placeholderTextColor={"$placeholderColor"}
            onChangeText={(value) => setTextInputMessage(value)}
            onSubmitEditing={sendMessage}
            value={textInputMessage}
          />
        </View>
        <Button
          circular={true}
          style={{ ...styles.sendButton }}
          onPress={sendMessage}
        >
          <SendIcon />
        </Button>
      </View>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    aspectRatio: 1,
    width: 40,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userImage: {
    aspectRatio: 1,
    width: 48,
    borderRadius: 9999,
    backgroundColor: "#475569",
  },
  userName: {
    fontWeight: "bold",
  },
  menuButton: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  messageContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  messageText: {
    maxWidth: "70%",
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    color: "white",
  },
  senderMessage: {
    borderBottomRightRadius: 0,
  },
  receiverMessage: {
    borderBottomLeftRadius: 0,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  textInputWrapper: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 16,
  },
  sendButton: {
    height: 48,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default MessageThread;

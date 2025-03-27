import { Entypo, Feather } from "@expo/vector-icons";
import { Link, Router, useNavigation, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

import { View, Text, useTheme } from "@tamagui/core";
import { Input } from "@tamagui/input";
import { useLocalSearchParams } from "expo-router";
import { User, TextMessageProps, Conversation } from "@/typings";
// import Animated from "react-native-reanimated";
import { Conversations } from "@/constants/Users";
import { Button } from "@tamagui/button";
// // import { supabase } from "@/lib/supabase";
// import UUID from "react-native-uuid";

const Header: React.FC<{
  conversation: Conversation;
  router: Router;
}> = ({ router, conversation }) => {
  const gotoUserProfile = () => {
    router.push({
      pathname: "/profile",
      params: {
        profile: JSON.stringify(conversation.profile),
        // user: JSON.stringify(conversation),
      },
    });
  };

  const theme = useTheme();

  return (
    <View bg={"$color2"} style={styles.headerContainer}>
      <Button
        circular={true}
        bg={"$color6"}
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Entypo name="chevron-left" size={20} color={theme.white9.val} />
      </Button>
      <View style={styles.userInfoContainer}>
        <TouchableOpacity onPress={gotoUserProfile}>
          <Image
            source={{ uri: conversation?.profile.media[0] }}
            style={styles.userImage}
          />
        </TouchableOpacity>
        <View>
          <Text color={"$white5"} style={styles.userName}>
            {conversation.profile.title}
          </Text>
          <Text color={"$white8"}>Added today!</Text>
        </View>
      </View>
      <Button circular={true} bg={"$color6"} style={styles.menuButton}>
        <Entypo
          name="dots-three-horizontal"
          size={20}
          color={theme.white9.val}
        />
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
  const [textInputMessage, setTextInputMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<TextMessageProps[]>([]);

  const router = useRouter();
  const navigation = useNavigation();
  const { target } = useLocalSearchParams();

  const theme = useTheme();

  const conversation: Conversation = JSON.parse(
    Array.isArray(target) ? target[0] : target
  );

  useEffect(() => {
    setMessageHistory(conversation.messages || []);
  }, [target]);

  useEffect(() => {
    navigation.setOptions({
      header: () => <Header router={router} conversation={conversation} />,
    });
  }, [navigation]);

  const sendMessage = () => {
    // Send message
    let convoId = conversation.profile.id + ":conversation";
    const newMessage = {
      message_id: new Date().toISOString() + ":message",
      conversation_id: new Date().toISOString() + ":conversation",
      content: textInputMessage,
      sender: "1",
      sent_at: new Date().toISOString(),
    };

    // if (!Conversations[convoId])
    //   Conversations[convoId] = {
    //     id: convoId,
    //     profile: conversation.profile,
    //     messages: [],
    //   };

    // Conversations[convoId].messages.push({
    //   message_id: new Date().toISOString() + ":message",
    //   conversation_id: new Date().toISOString() + ":conversation",
    //   content: textInputMessage,
    //   sender: "1",
    //   sent_at: new Date().toISOString(),
    // });

    setMessageHistory([...messageHistory, newMessage]);
    setTextInputMessage("");
  };

  return (
    <View bg={"$background"} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 8, gap: 4 }}>
        {messageHistory &&
          messageHistory.map((message, index) => (
            <View key={index} style={{ position: "relative", width: "100%" }}>
              <TextMessage content={message.content} sender={message.sender} />
            </View>
          ))}
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.textInputWrapper}>
          <Input
            style={{ flex: 1, height: "100%" }}
            placeholder="Write your message here"
            borderRadius={"$radius.9"}
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
          <Feather name="send" size={14} color="white" />
        </Button>
      </View>
    </View>
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
    backgroundColor: "#475569", // slate-600
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
    paddingBlock: 8,
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
    // backgroundColor: "#475569", // slate-600
    borderBottomRightRadius: 0,
  },
  receiverMessage: {
    // backgroundColor: "#3B82F6", // blue-500
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
    // backgroundColor: "#64748B", // slate-500
    alignItems: "center",
    justifyContent: "center",
    // borderRadius: 9999,
  },
});

export default MessageThread;

import ConversationMini from "@/components/ConversationMini";
import MatchedProfileMini from "@/components/MatchedProfileMini";
import { Conversation, Relationship, User } from "@/typings";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FlatList, SafeAreaView, ScrollView } from "react-native";
import { StyleSheet } from "react-native";

import { View, Text } from "@tamagui/core";
import supabase from "../lib/supabase";
import { useAuth } from "@/components/AuthProvider";

export default function MessagesScreen() {
  const [matchedUsers, setMatchedUsers] = useState<User[]>([]);
  const [conversationHistory, setConversationHistory] = useState<User[]>([]);
  const [unInteractedMatches, setUnInteractedMatches] = useState<User[]>([]);

  const auth = useAuth();

  if (!auth.session) return <></>;

  useEffect(() => {
    supabase.functions
      .invoke("fetch-connections", {
        body: {
          userId: auth.session.user.id,
        },
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching connections:", error);
          return;
        }

        data as User[];

        const _conversationHistory = data.filter(
          (user) => user.has_conversation
        );
        const _unInteractedMatches = data.filter(
          (user) => !user.has_conversation
        );

        setConversationHistory(_conversationHistory);
        setUnInteractedMatches(_unInteractedMatches);
      });
  }, []);

  // const onMount = async () => {
  //   // // const users = await getPotentialMatches();
  //   // if (!users) return;

  //   // const { data, error } = await supabase.rpc(
  //   //   "get_all_users_with_latest_messages",
  //   //   { target_user_id: auth.session!.user.id }
  //   // );

  //   if (error) {
  //     console.error("Error:", error);
  //   } else {
  //     console.log("Fetched Data:", data);
  //   }
  //   // const userId = auth.session!.user.id;

  //   // const { data: conversationMembers, error: conversationError } =
  //   //   await supabase
  //   //     .from("conversation_members")
  //   //     .select("conversation_id")
  //   //     .eq("user_id", userId);

  //   // if (conversationError) {
  //   //   console.error("Error fetching conversations:", conversationError);
  //   //   return;
  //   // }

  //   // const conversationIds = conversationMembers.map((c) => c.conversation_id);

  //   // const { data: conversationUsers, error: convUserError } = await supabase
  //   //   .from("conversation_members")
  //   //   .select("user_id, conversation_id")
  //   //   .in("conversation_id", conversationIds)
  //   //   .neq("user_id", userId);

  //   // if (convUserError) {
  //   //   console.error("Error fetching users with conversations:", convUserError);
  //   //   return;
  //   // }

  //   // const usersWithConversations = new Map();
  //   // conversationUsers.forEach(({ user_id, conversation_id }) => {
  //   //   if (user_id !== userId) {
  //   //     usersWithConversations.set(user_id, conversation_id);
  //   //   }
  //   // });

  //   // const { data: recentMessages, error: messageError } = await supabase
  //   //   .from("messages")
  //   //   .select("conversation_id, content, created_at")
  //   //   .in("conversation_id", conversationIds)
  //   //   .order("created_at", { ascending: false })
  //   //   .limit(1, { foreignTable: "conversation_id" }); // Get only the latest message per conversation

  //   // if (messageError) {
  //   //   console.error("Error fetching recent messages:", messageError);
  //   //   return;
  //   // }

  //   // console.log("recentMessages", recentMessages);

  //   // // Separate matched users
  //   // const interacted = users
  //   //   .filter((user) => usersWithConversations.has(user.id))
  //   //   .map((user) => {
  //   //     const conversationId = usersWithConversations.get(user.id);
  //   //     const recentMessage = recentMessages.find(
  //   //       (msg) => msg.conversation_id === conversationId
  //   //     );
  //   //     return {
  //   //       ...user,
  //   //       recent_message: recentMessage ? recentMessage.content : null,
  //   //     };
  //   //   });
  //   // const unInteracted = users.filter(
  //   //   (user) => !usersWithConversations.has(user.id)
  //   // );

  //   // console.log("conversationHistory", interacted);

  //   // setConversationHistory(interacted);
  //   // setUnInteractedMatches(unInteracted);
  // };

  // useEffect(() => {
  //   onMount();
  // }, []);

  const realtimeSubscription = () => {
    const connectionsChannel = supabase.channel("connections");
    const conversationsChannel = supabase.channel("conversations");

    connectionsChannel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "connections" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newData = payload.new as { cohert1: string; cohert2: string };
            const userId = auth.session?.user.id;
            const newConnection =
              userId === newData.cohert1 || userId === newData.cohert2;

            if (!newConnection) return;
          }
        }
      )
      .subscribe((status) => {});

    conversationsChannel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_members",
          filter: `user_id=eq.${auth.session?.user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
          }
        }
      )
      .subscribe((status) => {});
    return () => {
      supabase.removeChannel(connectionsChannel);
    };
  };

  useEffect(realtimeSubscription, []);

  const renderRowItem = useCallback(({ item, index }: any) => {
    return (
      <View
        // bg={"$color"}
        style={{
          marginHorizontal: index % 2 != 0 ? 4 : 0,
        }}
      >
        <MatchedProfileMini {...item} />
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.flex}>
      <View
        bg={"$background"}
        paddingBlock={"$2"}
        style={{ ...styles.flex, ...styles.container }}
      >
        <FlatList
          overScrollMode="never"
          ListHeaderComponent={
            <View>
              {unInteractedMatches.length > 0 && (
                <Text color={"$color"} style={styles.text}>
                  Connections
                </Text>
              )}
              <FlatList
                overScrollMode="never"
                renderItem={renderRowItem}
                data={unInteractedMatches}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
              />
              {conversationHistory.length > 0 && (
                <Text color={"$color"} style={{ ...styles.text, ...styles.mt }}>
                  Messages
                </Text>
              )}
            </View>
          }
          data={conversationHistory}
          renderItem={({ item, index }) => <ConversationMini {...item} />}
          ItemSeparatorComponent={() => (
            <View
              bg={"$color02"}
              opacity={0.05}
              marginBlock={10}
              borderWidth={1}
              borderColor={"$color"}
            ></View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  mt: {
    marginTop: 16,
  },
  container: {
    height: "100%",
    paddingHorizontal: 16,
  },
  seperator: {
    width: "100%",
    backgroundColor: "#e5e7eb",
    height: 0.5,
    marginBlock: 8,
  },
});

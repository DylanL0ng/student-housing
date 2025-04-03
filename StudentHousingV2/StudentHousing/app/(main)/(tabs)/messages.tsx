import ConversationMini from "@/components/ConversationMini";
import MatchedProfileMini from "@/components/MatchedProfileMini";
import { Conversation, Relationship, User } from "@/typings";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FlatList, SafeAreaView } from "react-native";
import { StyleSheet } from "react-native";

import supabase from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import Loading from "@/components/Loading";

import { H6, View, Text, ScrollView } from "tamagui";

export default function MessagesScreen() {
  const { session } = useAuth();

  if (!session) return <></>;

  const [conversationHistory, setConversationHistory] = useState<User[]>([]);
  const [unInteractedMatches, setUnInteractedMatches] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    supabase.functions
      .invoke("fetch-connections", {
        body: {
          userId: session.user.id,
        },
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching connections:", error);
          return;
        }

        data as User[];

        const _conversationHistory = data.filter(
          (user: User & { has_conversation: boolean }) => user.has_conversation
        );
        const _unInteractedMatches = data.filter(
          (user: User & { has_conversation: boolean }) => !user.has_conversation
        );

        setConversationHistory(_conversationHistory);
        setUnInteractedMatches(_unInteractedMatches);
        setIsLoading(false);
      });
  }, []);

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
            const userId = session?.user.id;
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
          filter: `user_id=eq.${session?.user.id}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newData = payload.new as {
              conversation_id: string;
              user_id: string;
            };

            const { error, data } = await supabase.functions.invoke(
              "fetch-connection",
              {
                body: {
                  userId: newData.conversation_id,
                },
              }
            );

            if (error) {
              console.error("Error fetching connection:", error);
              return;
            }
            if (!data) return;

            const newConversation = data as User;

            setConversationHistory((prev) => [...prev, newConversation]);

            setUnInteractedMatches((prev) =>
              prev.filter(
                (user) => user.profile?.id !== newConversation.profile.id
              )
            );
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
      <View marginInline={index % 2 != 0 ? 4 : 0}>
        <MatchedProfileMini {...item} />
      </View>
    );
  }, []);

  if (isLoading) {
    return <Loading title="Searching for connections" />;
  }

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
                <H6 fontSize={"$2"} fontWeight={"bold"} color={"$color"}>
                  Connections
                </H6>
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
                <H6 fontSize={"$2"} fontWeight={"bold"} color={"$color"}>
                  Messages
                </H6>
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

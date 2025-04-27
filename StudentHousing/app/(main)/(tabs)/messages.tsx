import ConversationMini from "@/components/ConversationMini";
import MatchedProfileMini from "@/components/MatchedProfileMini";
import { Profile } from "@/typings";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { FlatList, SafeAreaView } from "react-native";

import supabase from "@/lib/supabase";
import Loading from "@/components/Loading";

import { H6, View } from "tamagui";
import { useViewMode } from "@/providers/ViewModeProvider";
import { useProfile } from "@/providers/ProfileProvider";

const SectionHeader = ({ title }) => {
  return (
    <H6 fontSize={"$2"} fontWeight={"bold"} color={"$color"}>
      {title}
    </H6>
  );
};

const MatchedProfilesRow = ({ profiles }) => {
  const renderProfileItem = useCallback(({ item, index }) => {
    return (
      <View marginInline={index % 2 !== 0 ? 4 : 0}>
        <MatchedProfileMini {...item} />
      </View>
    );
  }, []);

  if (profiles.length === 0) return null;

  return (
    <FlatList
      overScrollMode="never"
      renderItem={renderProfileItem}
      data={profiles}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, index) => index.toString()}
    />
  );
};

const ConversationSeparator = () => (
  <View
    bg={"$color02"}
    opacity={0.05}
    marginBlock={10}
    borderWidth={1}
    borderColor={"$color"}
  />
);

export default function MessagesScreen() {
  const { activeProfileId } = useProfile();
  const [conversationHistory, setConversationHistory] = useState<Profile[]>([]);
  const [unInteractedMatches, setUnInteractedMatches] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subscribedConversations, setSubscribedConversations] = useState<
    string[]
  >([]);

  const { viewMode } = useViewMode();

  const conversationMappingRef = useRef<Record<string, Profile>>({});
  const messageChannelRef = useRef<any>(null);

  if (!activeProfileId) return <></>;

  const updateMessageSubscription = useCallback(() => {
    if (messageChannelRef.current) {
      supabase.removeChannel(messageChannelRef.current);
    }

    if (subscribedConversations.length === 0) {
      return;
    }

    const filterString = `conversation_id=in.(${subscribedConversations.join(
      ","
    )})`;

    const newChannel = supabase.channel(`messages-${Date.now()}`);
    newChannel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_messages",
          filter: filterString,
        },
        (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            const newMessage = payload.new;
            const conversationId = newMessage.conversation_id;

            setConversationHistory((prev) => {
              const existingIndex = prev.findIndex(
                (profile) =>
                  profile.conversations[0].conversation_id === conversationId
              );

              if (existingIndex >= 0) {
                const updatedHistory = [...prev];
                const profileToUpdate = { ...updatedHistory[existingIndex] };

                profileToUpdate.conversations = [
                  {
                    ...profileToUpdate.conversations[0],
                    latest_message: newMessage,
                    messages: [
                      ...(profileToUpdate.conversations[0].messages || []),
                      newMessage,
                    ],
                  },
                ];

                updatedHistory.splice(existingIndex, 1);
                return [profileToUpdate, ...updatedHistory];
              }

              const uninteractedMatch = unInteractedMatches.find(
                (profile) =>
                  profile.conversations[0].conversation_id === conversationId
              );

              if (uninteractedMatch) {
                setUnInteractedMatches((current) =>
                  current.filter(
                    (p) => p.conversations[0].conversation_id !== conversationId
                  )
                );

                const updatedProfile = { ...uninteractedMatch };
                updatedProfile.conversations = [
                  {
                    ...updatedProfile.conversations[0],
                    latest_message: newMessage,
                    messages: [
                      ...(updatedProfile.conversations[0].messages || []),
                      newMessage,
                    ],
                  },
                ];

                return [updatedProfile, ...prev];
              }

              return prev;
            });
          }
        }
      )
      .subscribe();

    messageChannelRef.current = newChannel;
  }, [subscribedConversations, unInteractedMatches]);

  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "getConnections",
        {
          body: {
            userId: activeProfileId,
            mode: viewMode,
          },
        }
      );

      if (error) {
        console.error("Error fetching connections:", error);
        return;
      }

      if (!data) {
        console.error("No connections found");
        return;
      }

      const connections = data as Profile[];
      console.log("connections", connections);

      const withConversations: Profile[] = [];
      const withoutConversations: Profile[] = [];

      const convoIds: string[] = [];
      const mapping: Record<string, Profile> = {};

      connections.forEach((profile) => {
        const conversationId = profile.conversations[0].conversation_id;
        convoIds.push(conversationId);
        mapping[conversationId] = profile;

        if (profile.conversations[0].latest_message) {
          withConversations.push(profile);
        } else {
          withoutConversations.push(profile);
        }
      });

      setConversationHistory(withConversations);
      setUnInteractedMatches(withoutConversations);
      setSubscribedConversations(convoIds);
      conversationMappingRef.current = mapping;
    } catch (err) {
      console.error("Failed to fetch connections:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeProfileId, viewMode]);

  const setupMembershipSubscription = useCallback(() => {
    if (!activeProfileId) return () => {};

    const userId = activeProfileId;
    const conversationMembersChannel = supabase.channel("conversations");

    conversationMembersChannel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_members",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("Received payload:", payload);
          if (payload.eventType === "INSERT") {
            const { conversation_id } = payload.new;

            if (!subscribedConversations.includes(conversation_id)) {
              setSubscribedConversations((prev) => [...prev, conversation_id]);

              const { data } = await supabase
                .from("conversation_members")
                .select("user_id")
                .eq("conversation_id", conversation_id)
                .neq("user_id", userId)
                .single();

              const otherUserId = data?.user_id;

              const { data: profileData } = await supabase.functions.invoke(
                "getProfile",
                {
                  body: {
                    userId: otherUserId,
                    sourceId: userId,
                    minimal: true,
                  },
                }
              );

              if (profileData && profileData.length > 0) {
                const newConnection = profileData[0] as Profile;

                conversationMappingRef.current[conversation_id] = newConnection;

                if (newConnection.conversations[0].latest_message) {
                  setConversationHistory((prev) => [newConnection, ...prev]);
                } else {
                  setUnInteractedMatches((prev) => [newConnection, ...prev]);
                }
              }
            }
          }

          if (payload.eventType === "DELETE") {
            const { conversation_id } = payload.old;

            setSubscribedConversations((prev) =>
              prev.filter((id) => id !== conversation_id)
            );

            setConversationHistory((prev) =>
              prev.filter(
                (p) => p.conversations[0].conversation_id !== conversation_id
              )
            );

            setUnInteractedMatches((prev) =>
              prev.filter(
                (p) => p.conversations[0].conversation_id !== conversation_id
              )
            );

            delete conversationMappingRef.current[conversation_id];
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationMembersChannel);
    };
  }, [activeProfileId, subscribedConversations]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections, viewMode]);

  useEffect(() => {
    const cleanup = setupMembershipSubscription();
    return cleanup;
  }, [setupMembershipSubscription]);

  useEffect(() => {
    updateMessageSubscription();

    return () => {
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
      }
    };
  }, [updateMessageSubscription]);

  if (isLoading) {
    return <Loading title="Searching for connections" />;
  }

  const renderListHeader = () => (
    <View>
      <SectionHeader title="Connections" />
      <MatchedProfilesRow profiles={unInteractedMatches} />
      <SectionHeader title="Messages" />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        bg={"$background"}
        paddingBlock={"$2"}
        flex={1}
        height={"100%"}
        paddingInline={"$4"}
      >
        {conversationHistory.length === 0 &&
        unInteractedMatches.length === 0 ? (
          <Loading title="No connections found" />
        ) : (
          <FlatList
            overScrollMode="never"
            ListHeaderComponent={renderListHeader}
            data={conversationHistory}
            renderItem={({ item }) => <ConversationMini {...item} />}
            ItemSeparatorComponent={ConversationSeparator}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

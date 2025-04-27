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

// Component to render section headers
const SectionHeader = ({ title }) => {
  return (
    <H6 fontSize={"$2"} fontWeight={"bold"} color={"$color"}>
      {title}
    </H6>
  );
};

// Component to render matched profiles horizontally
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

// Component to render a separator between conversation items
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

  // Use a ref to keep track of conversation mapping for message updates
  const conversationMappingRef = useRef<Record<string, Profile>>({});
  // Use a ref to store the current message channel subscription
  const messageChannelRef = useRef<any>(null);

  console.log("activeProfileId", activeProfileId);
  if (!activeProfileId) return <></>;

  // Function to update message subscription when conversation list changes
  const updateMessageSubscription = useCallback(() => {
    // Clean up existing message channel if it exists
    if (messageChannelRef.current) {
      supabase.removeChannel(messageChannelRef.current);
    }

    // Only create subscription if we have conversations to subscribe to
    if (subscribedConversations.length === 0) {
      return;
    }

    // Create filter string for the "in" operator - must use parentheses around values
    const filterString = `conversation_id=in.(${subscribedConversations.join(
      ","
    )})`;

    // Create new message channel
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

            // Find the profile associated with this conversation
            setConversationHistory((prev) => {
              // Check if this conversation exists in history
              const existingIndex = prev.findIndex(
                (profile) =>
                  profile.conversations[0].conversation_id === conversationId
              );

              if (existingIndex >= 0) {
                // Update existing conversation
                const updatedHistory = [...prev];
                const profileToUpdate = { ...updatedHistory[existingIndex] };

                // Update the conversation data
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

                // Remove from current position
                updatedHistory.splice(existingIndex, 1);
                // Add to the beginning (most recent)
                return [profileToUpdate, ...updatedHistory];
              }

              // Check if this is a new message in a previously uninteracted match
              const uninteractedMatch = unInteractedMatches.find(
                (profile) =>
                  profile.conversations[0].conversation_id === conversationId
              );

              if (uninteractedMatch) {
                // Move from uninteracted to history
                setUnInteractedMatches((current) =>
                  current.filter(
                    (p) => p.conversations[0].conversation_id !== conversationId
                  )
                );

                // Create updated profile with message
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

                // Add to beginning of history
                return [updatedProfile, ...prev];
              }

              // If we get here, it's a message for a conversation we don't know about yet
              // console.log(
              //   "Received message for unknown conversation:",
              //   conversationId
              // );
              return prev;
            });
          }
        }
      )
      .subscribe();

    // Store the channel reference
    messageChannelRef.current = newChannel;
  }, [subscribedConversations, unInteractedMatches]);

  // Fetch user connections from the API
  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    console.log("Fetching connections for user:", activeProfileId);
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

        // Check if the profile has a conversation
        if (profile.conversations[0].latest_message) {
          withConversations.push(profile);
        } else {
          withoutConversations.push(profile);
        }
      });

      // Update state all at once to reduce renders
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

  // Set up realtime subscription for new conversations
  const setupMembershipSubscription = useCallback(() => {
    if (!activeProfileId) return () => {};

    const userId = activeProfileId;
    const conversationMembersChannel = supabase.channel("conversations");

    // Subscribe to conversation_members table changes
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

            // Only process if we're not already subscribed
            if (!subscribedConversations.includes(conversation_id)) {
              // Add to subscribed conversations immediately
              setSubscribedConversations((prev) => [...prev, conversation_id]);

              // Get the other user in the conversation
              const { data } = await supabase
                .from("conversation_members")
                .select("user_id")
                .eq("conversation_id", conversation_id)
                .neq("user_id", userId)
                .single();

              const otherUserId = data?.user_id;

              // Get profile data
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

              console.log("profileData", profileData);

              if (profileData && profileData.length > 0) {
                const newConnection = profileData[0] as Profile;

                // Update our conversation mapping
                conversationMappingRef.current[conversation_id] = newConnection;

                // Add to appropriate list
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

            // Remove from subscribed conversations
            setSubscribedConversations((prev) =>
              prev.filter((id) => id !== conversation_id)
            );

            // Remove from appropriate lists
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

            // Remove from mapping
            delete conversationMappingRef.current[conversation_id];
          }
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(conversationMembersChannel);
    };
  }, [activeProfileId, subscribedConversations]);

  // Fetch connections on component mount
  useEffect(() => {
    fetchConnections();
  }, [fetchConnections, viewMode]);

  // Set up membership subscription
  useEffect(() => {
    const cleanup = setupMembershipSubscription();
    return cleanup;
  }, [setupMembershipSubscription]);

  // Update message subscription when subscribed conversations change
  useEffect(() => {
    updateMessageSubscription();

    // Clean up on unmount
    return () => {
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
      }
    };
  }, [updateMessageSubscription]);

  // Render loading state
  if (isLoading) {
    return <Loading title="Searching for connections" />;
  }

  // Render the main list header with connections and messages sections
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

import { useAuth } from "@/components/AuthProvider";
import ProfileCard from "@/components/ProfileCard";
import SwipeHandler from "@/components/SwipeHandler";
import { Profile, User } from "@/typings";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

import { View } from "tamagui";
import Loading from "@/components/Loading";
import { useFocusEffect } from "expo-router";
import { getSavedFilters } from "@/utils/filterUtils";

export default function HomeScreen() {
  const auth = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const requestUpdate = async () => {
    try {
      setIsLoading(true);

      const filters = await getSavedFilters();
      const _response = await supabase.functions.invoke(
        "getDiscoveryProfiles",
        {
          body: {
            sourceId: auth.session?.user.id,
            filters: filters,
          },
        }
      );

      const { response, error } = _response.data;

      console.log("Fetched profiles:", response);

      if (error) {
        console.error("Error fetching profiles:", error);
        return;
      }

      const parsedData = response.filter((profile) => profile);
      setProfiles(parsedData || []);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestUpdate();

    // (async () => {
    //   const likeUser = async (targetId: string, sourceId: string) => {
    //     if (targetId === sourceId) return;

    //     const { data, error } = await supabase
    //       .from("profile_interactions")
    //       .select("type")
    //       .eq("cohert2", sourceId)
    //       .eq("cohert1", targetId)
    //       .eq("type", "like")
    //       .single();

    //     if (!data) {
    //       await supabase.from("profile_interactions").insert({
    //         cohert1: sourceId,
    //         cohert2: targetId,
    //       });
    //     } else {
    //       const deleteInteractions = Promise.all([
    //         supabase
    //           .from("profile_interactions")
    //           .delete()
    //           .eq("cohert1", targetId)
    //           .eq("cohert2", sourceId),
    //         supabase
    //           .from("profile_interactions")
    //           .delete()
    //           .eq("cohert1", sourceId)
    //           .eq("cohert2", targetId),
    //       ]);

    //       const createConversation = supabase
    //         .from("conversation_registry")
    //         .insert({})
    //         .select("conversation_id")
    //         .single();

    //       const [_, { data: conversationData, error: conversationError }] =
    //         await Promise.all([deleteInteractions, createConversation]);

    //       if (!conversationData) {
    //         return console.error(
    //           "Error creating conversation:",
    //           conversationError
    //         );
    //       }

    //       await Promise.all([
    //         supabase.from("connections").insert({
    //           cohert1: targetId,
    //           cohert2: sourceId,
    //           type: "flatmate",
    //         }),
    //         supabase.from("conversation_members").insert([
    //           {
    //             conversation_id: conversationData.conversation_id,
    //             user_id: targetId,
    //           },
    //           {
    //             conversation_id: conversationData.conversation_id,
    //             user_id: sourceId,
    //           },
    //         ]),
    //       ]);

    //       return;
    //     }
    //   };

    //   if (auth.session?.user.id) {
    //     likeUser("0b64453c-d71d-441d-ad17-e96fe2fcb158", auth.session.user.id);
    //     likeUser(auth.session.user.id, "0b64453c-d71d-441d-ad17-e96fe2fcb158");
    //   } else {
    //     console.error("User ID is undefined.");
    //   }
    // })();

    // (async () => {
    //   const getUserDataQuery = `
    //     conversation_members!user_id(
    //       conversation_id,
    //       user_id,
    //       conversation_registry!conversation_id(
    //         conversation_id,
    //         conversation_messages!conversation_id(
    //           content, status, sender_id, created_at, message_id
    //         )
    //       )
    //     ),
    //     profile_information!profile_id(*, profile_information_registry!key(label, priority_order)),
    //     profile_interests!profile_id(interest_registry!id(interest)),
    //     profile_locations!profile_id(point, city)
    //   `;
    //   const { data: _userData, error: _userError } = await supabase
    //     .from("profiles")
    //     .select(
    //       `
    //                 full_name,
    //                 type,
    //                 id,
    //                 ${getUserDataQuery}
    //                 `
    //     )
    //     .limit(10);

    //   const parsedData = _userData?.map((profile) => {
    //     // Filter out your own membership
    //     const members = profile.conversation_members.filter((member) => {
    //       return member.user_id !== auth.session?.user.id;
    //     });

    //     // Extract conversations and latest messages
    //     const conversations = members.map((member) => {
    //       const messages =
    //         member.conversation_registry.conversation_messages || [];

    //       // Sort messages by newest first
    //       const sortedMessages = [...messages].sort((a, b) => {
    //         return (
    //           new Date(b.created_at).getTime() -
    //           new Date(a.created_at).getTime()
    //         );
    //       });

    //       return {
    //         conversation_id: member.conversation_id,
    //         messages,
    //         latest_message: sortedMessages[0] || null,
    //       };
    //     });

    //     return {
    //       conversations,
    //       full_name: profile.full_name,
    //       id: profile.id,
    //       type: profile.type,
    //       interests: profile.profile_interests,
    //       location: profile.profile_locations,
    //       information: profile.profile_information,
    //     };
    //   });

    //   console.log(parsedData);
    // })();
  }, []);

  const handleSwipeRight = async ({ index }: { index: number }) => {
    const target = profiles[index];
    if (!auth.session?.user.id) {
      console.error("User not authenticated.");
      return;
    }

    console.log(target.id, auth.session?.user.id);
    try {
      const _response = await supabase.functions.invoke(
        "sendProfileInteraction",
        {
          body: {
            targetId: target.id,
            sourceId: auth.session?.user.id,
            type: "like",
          },
        }
      );

      const { status, response } = _response.data;

      if (status === "success") console.log("Interaction sent successfully.");
      else console.error("Error sending interaction:", status, response);
    } catch (error) {
      console.error("Error sending interaction:", error);
    }
  };

  const handleSwipeLeft = async ({
    index,
    data,
  }: {
    index: number;
    data: { profile: Profile; id: string };
  }) => {
    const target = profiles[index];
    if (!auth.session?.user.id) {
      console.error("User not authenticated.");
      return;
    }

    try {
      const { status } = await supabase.functions.invoke(
        "sendProfileInteraction",
        {
          body: {
            targetId: target.id,
            sourceId: auth.session?.user.id,
            type: "dislike",
          },
        }
      );

      if (status === "success") console.log("Interaction sent successfully.");
      else console.error("Error sending interaction:", status);
    } catch (error) {
      console.error("Error sending interaction:", error);
    }
  };

  if (profiles.length === 0) {
    return <Loading title="Searching for profiles" />;
  }

  return (
    <View bg={"$background"} style={{ flex: 1 }}>
      <SwipeHandler
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        requestUpdate={requestUpdate}
        data={profiles.map(
          (profile) =>
            profile && {
              profile: profile,
              id: profile.id,
            }
        )}
        Card={ProfileCard}
        style={{ marginTop: 16, margin: 16 }}
      />
    </View>
  );
}

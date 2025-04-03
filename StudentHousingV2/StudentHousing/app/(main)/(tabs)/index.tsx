import { useAuth } from "@/components/AuthProvider";
import ProfileCard from "@/components/ProfileCard";
import SwipeHandler from "@/components/SwipeHandler";
import { Profile, User } from "@/typings";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

import { View } from "tamagui";
import Loading from "@/components/Loading";

export default function HomeScreen() {
  const auth = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const requestUpdate = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke(
        "searchForFlatmates",
        {
          body: {
            id: auth.session?.user.id,
          },
        }
      );

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      setUsers(data || []);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestUpdate();
  }, []);

  const handleSwipeRight = async ({ index }: { index: number }) => {
    const target = users[index];
    if (!auth.session?.user.id) {
      console.error("User not authenticated.");
      return;
    }

    try {
      const { data: existingInteraction, error: checkError } = await supabase
        .from("profile_interactions")
        .select("*")
        .or(
          `cohert1.eq.${auth.session?.user.id},cohert2.eq.${auth.session?.user.id}`
        )
        .or(`cohert1.eq.${target.profile.id},cohert2.eq.${target.profile.id}`);

      if (checkError) {
        console.error("Error checking interaction:", checkError);
        return;
      }

      if (existingInteraction) {
        const { data: connectionData, error: connectionError } = await supabase
          .from("connections")
          .insert({
            cohert1: auth.session?.user.id,
            cohert2: target.profile.id,
            type: "flatmate",
          });

        if (connectionError) {
          console.error("Error creating connection:", connectionError);
          return;
        }

        return;
      }

      const { data: likeData, error: likeError } = await supabase
        .from("profile_interactions")
        .insert({
          cohert1: auth.session?.user.id,
          cohert2: target.profile.id,
          type: "like",
        });

      if (likeError) {
        console.error("Error adding like:", likeError);
        return;
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  };

  const handleSwipeLeft = async ({
    index,
    data,
  }: {
    index: number;
    data: { profile: Profile; id: string };
  }) => {
    const { data: respData, error } = await supabase
      .from("profile_interactions")
      .upsert({
        cohert1: auth.session?.user.id,
        cohert2: data.profile.id,
        type: "dislike",
      });
  };

  if (isLoading || users.length === 0) {
    return <Loading title="Searching for profiles" />;
  }

  return (
    <View bg={"$background"} style={{ flex: 1 }}>
      <SwipeHandler
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        requestUpdate={requestUpdate}
        data={users.map((user) => ({
          profile: user.profile,
          id: user.id,
        }))}
        Card={ProfileCard}
        style={{ marginTop: 16, margin: 16 }}
      />
    </View>
  );
}

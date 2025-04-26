import { useAuth } from "@/providers/AuthProvider";
import ProfileCard from "@/components/ProfileCard";
import SwipeHandler from "@/components/SwipeHandler";
import { Profile } from "@/typings";
import { useCallback, useEffect, useState } from "react";
import supabase from "@/lib/supabase";

import { View } from "tamagui";
import Loading from "@/components/Loading";
import { useFocusEffect } from "expo-router";
import { getSavedFilters } from "@/utils/filterUtils";
import { useProfile } from "@/providers/ProfileProvider";
import { useSearchMode } from "@/providers/ViewModeProvider";
import generateFakeUsers from "@/scripts/generateFakeUsers";

export default function HomeScreen() {
  const auth = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { activeProfileId } = useProfile();

  const { interests } = useProfile();
  const { searchMode } = useSearchMode();
  const [isLoading, setIsLoading] = useState(true);

  const requestUpdate = useCallback(async () => {
    if (!activeProfileId) return;
    try {
      setIsLoading(true);

      const filters = await getSavedFilters();
      const _response = await supabase.functions.invoke(
        "getDiscoveryProfiles",
        {
          body: {
            sourceId: activeProfileId,
            filters: filters,
            type: searchMode,
          },
        }
      );

      if (!_response) return;

      if (_response.error) {
        console.error("Error fetching profiles:", _response.error);
        return;
      }

      const { response, status } = _response.data;

      const parsedData = response.filter((profile) => profile);
      setProfiles(parsedData || []);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeProfileId, searchMode]);

  useFocusEffect(
    useCallback(() => {
      requestUpdate();
    }, [requestUpdate])
  );

  useEffect(() => {
    requestUpdate();
    generateFakeUsers(5);
  }, []);

  useEffect(() => {
    requestUpdate();
  }, [searchMode, requestUpdate]);

  const handleSwipeRight = async ({ index }: { index: number }) => {
    const target = profiles[index];
    if (!activeProfileId) {
      console.error("User not authenticated.");
      return;
    }

    try {
      const _response = await supabase.functions.invoke(
        "sendProfileInteraction",
        {
          body: {
            targetId: target.id,
            sourceId: activeProfileId,
            type: "like",
          },
        }
      );

      const { status, response } = _response.data;

      // if (status === "success") // console.log("Interaction sent successfully.");
      // else console.error("Error sending interaction:", status, response);
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
    if (!activeProfileId) {
      console.error("User not authenticated.");
      return;
    }

    try {
      const { status } = await supabase.functions.invoke(
        "sendProfileInteraction",
        {
          body: {
            targetId: target.id,
            sourceId: activeProfileId,
            type: "dislike",
          },
        }
      );

      // if (status === "success") // console.log("Interaction sent successfully.");
      // else console.error("Error sending interaction:", status);
    } catch (error) {
      console.error("Error sending interaction:", error);
    }
  };

  if (isLoading) {
    return <Loading title="Searching for profiles" />;
  }
  if (profiles.length === 0) {
    return <Loading title="No profiles found" />;
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
        style={{ marginTop: 16 }}
      />
    </View>
  );
}

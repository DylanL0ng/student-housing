import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { router, useNavigation } from "expo-router";

import { useTheme, View } from "@tamagui/core";

import ProfileCard from "@/components/ProfileCard";
import { Profile } from "@/typings";
import { useAuth } from "@/components/AuthProvider";
import Loading from "@/components/Loading";
import { Tabs, Text } from "tamagui";

export default function ProfileScreen() {
  const { session } = useAuth();

  if (!session) return <></>;

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      header: () => <></>,
    });
  }, [navigation]);

  const theme = useTheme();

  const [tabMode, setTabMode] = useState<"edit" | "preview">("edit");
  const [profile, setProfile] = useState<Profile | undefined>(undefined);

  useEffect(() => {
    if (tabMode === "preview") {
      (async () => {
        const { data, error } = await supabase.functions.invoke(
          "fetch-connection",
          {
            body: {
              userId: session?.user.id, // Replace with the actual user ID
            },
          }
        );

        data as Profile;

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        if (data) {
          setProfile(data.profile);
        } else {
          console.error("No profile found");
        }
      })();
    }
  }, [tabMode]);

  return (
    <>
      <View flex={1} bg={"$background"}>
        <Tabs
          flex={1}
          defaultValue={tabMode}
          orientation="horizontal"
          flexDirection="column"
          overflow="hidden"
          onValueChange={(value) => {
            setTabMode(value as "edit" | "preview");
          }}
        >
          <Tabs.List>
            <Tabs.Tab
              flex={1}
              bg={"$color2"}
              focusStyle={{
                backgroundColor: "$color3",
              }}
              value="edit"
            >
              <Text color={"$color"}>Edit</Text>
            </Tabs.Tab>
            <Tabs.Tab
              flex={1}
              bg={"$color2"}
              focusStyle={{
                backgroundColor: "$color3",
              }}
              value="preview"
            >
              <Text color={"$color"}>Preview</Text>
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Content flex={1} value="edit">
            <Text color={"$color"}>Edit</Text>
          </Tabs.Content>
          <Tabs.Content flex={1} value="preview">
            {profile ? (
              <ProfileCard profile={profile} />
            ) : (
              <Loading title="Loading profile" />
            )}
          </Tabs.Content>
        </Tabs>
      </View>
    </>
  );
}

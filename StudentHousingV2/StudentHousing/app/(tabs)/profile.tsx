import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { router, useNavigation } from "expo-router";
import { Button } from "@tamagui/button";
import { XStack } from "@tamagui/stacks";
import { Tabs } from "@tamagui/tabs";
import { useTheme, View } from "@tamagui/core";
import { Text } from "@tamagui/core";
import ProfileCard from "@/components/ProfileCard";
import { Profile } from "@/typings";
import { useAuth } from "@/components/AuthProvider";
import Loading from "@/components/Loading";

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

// const HorizontalTabs = () => {
//   return (
//     <Tabs
//       defaultValue="tab1"
//       orientation="horizontal"
//       flexDirection="column"
//       width={400}
//       height={150}
//       borderRadius="$4"
//       borderWidth="$0.25"
//       overflow="hidden"
//       borderColor="$borderColor"
//     >
//       <Tabs.List
//         separator={<Separator vertical />}
//         disablePassBorderRadius="bottom"
//         aria-label="Manage your account"
//       >
//         <Tabs.Tab
//           focusStyle={{
//             backgroundColor: "$color3",
//           }}
//           flex={1}
//           value="tab1"
//         >
//           <SizableText fontFamily="$body">Profile ne</SizableText>
//         </Tabs.Tab>
//         <Tabs.Tab
//           focusStyle={{
//             backgroundColor: "$color3",
//           }}
//           flex={1}
//           value="tab2"
//         >
//           <SizableText fontFamily="$body">Connections</SizableText>
//         </Tabs.Tab>
//         <Tabs.Tab
//           focusStyle={{
//             backgroundColor: "$color3",
//           }}
//           flex={1}
//           value="tab3"
//         >
//           <SizableText fontFamily="$body">Notifications</SizableText>
//         </Tabs.Tab>
//       </Tabs.List>
//       <Separator />
//       <TabsContent value="tab1">
//         <H5>Profile</H5>
//       </TabsContent>

//       <TabsContent value="tab2">
//         <H5>Connections</H5>
//       </TabsContent>

//       <TabsContent value="tab3">
//         <H5>Notifications</H5>
//       </TabsContent>
//     </Tabs>
//   );
// };

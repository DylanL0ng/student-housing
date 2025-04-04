import ImageCollection from "@/components/Profile/ImageCollection";
import { Profile } from "@/typings";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { Text, useTheme, View, Button, ScrollView } from "tamagui";
import { X } from "@tamagui/lucide-icons";

interface ProfileInformation {
  key: string;
  label: string;
  priority_order: number;
}

interface ProfileInformationPromptData {
  value: string;
  prompt_id: string;
}

interface ProfileInformationPrompt extends ProfileInformation {
  value: { data: ProfileInformationPromptData[] };
}

interface ProfileInformationGender extends ProfileInformation {
  value: { data: "Male" | "Female" };
}

interface ProfileInformationBudget extends ProfileInformation {
  value: { data: number };
}

interface ProfileInformationBio extends ProfileInformation {
  value: { data: string };
}

const ProfileModal = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();

  let { profile } = useLocalSearchParams();

  const [profileData, setProfileData] = useState<Profile | undefined>(
    undefined
  );

  const [profileInformation, setProfileInformation] = useState<[]>([]);

  const [age, setAge] = useState(0);

  useEffect(() => {
    if (!profile) return;
    const parsedProfile = JSON.parse(
      Array.isArray(profile) ? profile[0] : profile
    ) as Profile;

    const information = parsedProfile.information;
    setProfileData(parsedProfile);
    setProfileInformation(information);
  }, [profile]);

  const RenderProfileItem = ({ item }: { item: any }) => {
    switch (item.key) {
      case "prompt":
        item as ProfileInformationPrompt;
        return (
          <View display="flex" gap={"$2"}>
            {item.value.data.map(
              (prompt: ProfileInformationPromptData, index: number) => {
                return (
                  <View
                    overflow="hidden"
                    paddingBlock={"$8"}
                    paddingInline={"$4"}
                    bg={"$color4"}
                    display="flex"
                    gap={"$2"}
                    key={index}
                    style={{
                      borderRadius: 16,
                    }}
                  >
                    <Text fontWeight={"bold"} fontSize={"$3"}>
                      Test
                    </Text>
                    <Text fontSize={"$8"}>{prompt.value}</Text>
                  </View>
                );
              }
            )}
          </View>
        );
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.color2.val }}
      edges={["top", "left", "right"]}
    >
      <View bg={"$color2"} style={{ flex: 1 }}>
        <View
          bg={"$color2"}
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBlock: 8,
            paddingInline: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text fontWeight={"800"} fontSize={"$8"} color={"$color"}>
              {profileData?.title}
            </Text>
            <Text fontWeight={"600"} fontSize={"$6"} color={"$color12"}></Text>
          </View>
          <Button pressTheme circular={true} onPress={() => router.back()}>
            <X size={"$1"} color={"$color"} strokeWidth={2} />
          </Button>
        </View>
        <ScrollView marginInline={"$4"}>
          {profileData &&
            profileData.media.map((item: string, index: number) => (
              <View
                marginBlock={"$2"}
                key={index}
                aspectRatio={0.75}
                flex={1}
                style={{}}
              >
                <Image
                  style={{
                    flex: 1,
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                  source={item}
                  transition={0}
                />
              </View>
            ))}
          {profileInformation &&
            profileInformation.map((item: any, index: number) => {
              return <RenderProfileItem key={index} item={item} />;
            })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProfileModal;

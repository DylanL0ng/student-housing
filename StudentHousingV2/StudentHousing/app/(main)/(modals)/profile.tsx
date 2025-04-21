import ImageCollection from "@/components/Profile/ImageCollection";
import { Profile } from "@/typings";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState, useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { Text, useTheme, View, Button, ScrollView } from "tamagui";
import { X } from "@tamagui/lucide-icons";
import { calculateAge } from "@/utils/utils";

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

type ContentItem = {
  type: "image" | "info";
  data: any;
  index: number;
};

const ProfileModal = () => {
  const router = useRouter();
  const theme = useTheme();

  let { profile } = useLocalSearchParams();

  const [profileData, setProfileData] = useState<Profile | undefined>(
    undefined
  );
  const [profileInformation, setProfileInformation] = useState<any[]>([]);
  const [interspersedContent, setInterspersedContent] = useState<ContentItem[]>(
    []
  );

  useEffect(() => {
    if (!profile) return;
    const parsedProfile = JSON.parse(
      Array.isArray(profile) ? profile[0] : profile
    ) as Profile;

    // Sort information by priority_order if it exists
    const information = parsedProfile.information.sort(
      (a, b) => (a.priority_order || 0) - (b.priority_order || 0)
    );

    setProfileData(parsedProfile);
    setProfileInformation(information);
  }, [profile]);

  // Create interspersed content with images and information
  useEffect(() => {
    if (!profileData || !profileInformation.length) return;

    const media = profileData.media || [];
    const info = [...profileInformation];

    // Start with first image
    const contentItems: ContentItem[] = [];

    if (media.length > 0) {
      contentItems.push({
        type: "image",
        data: media[0],
        index: 0,
      });
    }

    let mediaIndex = 1; // Start from the second image
    let infoIndex = 0;

    // Process all info items in their priority order
    while (infoIndex < info.length) {
      // Add the info item
      contentItems.push({
        type: "info",
        data: info[infoIndex],
        index: infoIndex,
      });
      infoIndex++;

      // Decide if we should add an image after this info item
      const shouldAddImage =
        mediaIndex < media.length &&
        (Math.random() < 0.4 || infoIndex === info.length); // 40% chance or if it's the last info item

      if (shouldAddImage) {
        contentItems.push({
          type: "image",
          data: media[mediaIndex],
          index: mediaIndex,
        });
        mediaIndex++;
      }
    }

    // Add any remaining images at the end
    while (mediaIndex < media.length) {
      contentItems.push({
        type: "image",
        data: media[mediaIndex],
        index: mediaIndex,
      });
      mediaIndex++;
    }

    setInterspersedContent(contentItems);
  }, [profileData, profileInformation]);

  const RenderProfileItem = ({ item }: { item: any }) => {
    switch (item.key) {
      case "bio":
        return (
          <View
            overflow="hidden"
            paddingBlock="$8"
            paddingInline="$4"
            bg="$color4"
            display="flex"
            gap="$2"
            style={{
              borderRadius: 16,
              marginVertical: 8,
            }}
          >
            <Text fontWeight="bold" fontSize="$3">
              Bio
            </Text>
            <Text fontSize="$8">{item.value.data.value}</Text>
          </View>
        );
      case "age":
        return (
          <View
            overflow="hidden"
            paddingBlock="$4"
            paddingInline="$4"
            bg="$color4"
            display="flex"
            gap="$2"
            style={{
              borderRadius: 16,
              marginVertical: 8,
            }}
          >
            <Text fontWeight="bold" fontSize="$3">
              Age
            </Text>
            <Text fontSize="$8">{calculateAge(item.value.data.value)}</Text>
          </View>
        );
      case "gender":
        return (
          <View
            overflow="hidden"
            paddingBlock="$8"
            paddingInline="$4"
            bg="$color4"
            display="flex"
            gap="$2"
            style={{
              borderRadius: 16,
              marginVertical: 8,
            }}
          >
            <Text fontWeight="bold" fontSize="$3">
              Gender
            </Text>
            <Text fontSize="$8">{item.value.data.value}</Text>
          </View>
        );
      case "budget":
        return (
          <View
            overflow="hidden"
            paddingBlock="$4"
            paddingInline="$4"
            bg="$color4"
            display="flex"
            gap="$2"
            style={{
              borderRadius: 16,
              marginVertical: 8,
            }}
          >
            <Text fontWeight="bold" fontSize="$3">
              Budget
            </Text>
            <Text fontSize="$8">€{item.value.data.value}</Text>
          </View>
        );
      default:
        return (
          <View
            overflow="hidden"
            paddingBlock="$4"
            paddingInline="$4"
            bg="$color4"
            display="flex"
            gap="$2"
            style={{
              borderRadius: 16,
              marginVertical: 8,
            }}
          >
            <Text fontWeight="bold" fontSize="$3">
              {item.label || item.key}
            </Text>
            <Text fontSize="$8">{item.value.data.value}</Text>
          </View>
        );
    }
  };

  const renderContentItem = (item: ContentItem) => {
    if (item.type === "image") {
      return (
        <View
          key={`image-${item.index}`}
          marginBlock="$2"
          aspectRatio={0.75}
          flex={1}
        >
          <Image
            cachePolicy={"none"}
            style={{
              flex: 1,
              borderRadius: 16,
              overflow: "hidden",
            }}
            source={item.data}
            transition={0}
          />
        </View>
      );
    } else {
      return <RenderProfileItem key={`info-${item.index}`} item={item.data} />;
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.color2.val }}
      edges={["top", "left", "right"]}
    >
      <View bg="$color2" style={{ flex: 1 }}>
        <View
          bg="$color2"
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
            <Text fontWeight="800" fontSize="$8" color="$color">
              {profileData?.title}
            </Text>
            <Text fontWeight="600" fontSize="$6" color="$color12"></Text>
          </View>
          <Button pressTheme circular={true} onPress={() => router.back()}>
            <X size="$1" color="$color" strokeWidth={2} />
          </Button>
        </View>
        <ScrollView marginInline="$4">
          {interspersedContent.map((item) => renderContentItem(item))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProfileModal;

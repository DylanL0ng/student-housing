import { Profile } from "@/typings";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { Text, useTheme, View, Button, ScrollView } from "tamagui";
import { X, Heart } from "@tamagui/lucide-icons";
import { calculateAge } from "@/utils/utils";
import { Animated, TouchableOpacity } from "react-native";
import supabase from "@/lib/supabase";
import { useProfile } from "@/providers/ProfileProvider";
import { useViewMode } from "@/providers/ViewModeProvider";

interface ProfileInformation {
  key: string;
  label: string;
  priority_order: number;
}

interface ProfileInformationPromptData {
  value: string;
  prompt_id: string;
}

type ContentItem = {
  type: "image" | "info";
  data: any;
  index: number;
};

const ProfileModal = () => {
  const router = useRouter();
  const theme = useTheme();

  const { activeProfileId } = useProfile();
  const { viewMode } = useViewMode();

  let { profile, showLikes } = useLocalSearchParams();
  const shouldShowLikes = showLikes === "true";

  const [profileData, setProfileData] = useState<Profile | undefined>(
    undefined
  );
  const [profileInformation, setProfileInformation] = useState<any[]>([]);
  const [interspersedContent, setInterspersedContent] = useState<ContentItem[]>(
    []
  );
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (!profile) return;
    const parsedProfile = JSON.parse(
      Array.isArray(profile) ? profile[0] : profile
    ) as Profile;

    const information = Object.values(parsedProfile.information || {}).sort(
      (a, b) => (a.priority_order || 0) - (b.priority_order || 0)
    );

    setProfileData(parsedProfile);
    setProfileInformation(information);
  }, [profile]);

  useEffect(() => {
    if (!profileData || !profileInformation.length) return;

    const media = profileData.media || [];
    const info = [...profileInformation];

    const contentItems: ContentItem[] = [];

    if (media.length > 0) {
      contentItems.push({
        type: "image",
        data: media[0],
        index: 0,
      });
    }

    let mediaIndex = 1;
    let infoIndex = 0;

    while (infoIndex < info.length) {
      contentItems.push({
        type: "info",
        data: info[infoIndex],
        index: infoIndex,
      });
      infoIndex++;

      const shouldAddImage =
        mediaIndex < media.length &&
        (Math.random() < 0.4 || infoIndex === info.length);

      if (shouldAddImage) {
        contentItems.push({
          type: "image",
          data: media[mediaIndex],
          index: mediaIndex,
        });
        mediaIndex++;
      }
    }

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

  const sendProfileInteraction = async () => {
    if (!profileData) return;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    const _response = await supabase.functions.invoke(
      "sendProfileInteraction",
      {
        body: {
          targetId: profileData.id,
          sourceId: activeProfileId,
          type: "like",
          mode: viewMode,
        },
      }
    );

    const { status } = _response.data;
    if (status === "success") router.back();
  };

  const RenderProfileItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case "biography":
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
            <Text fontSize="$8">{`${item.value.data.value}` || ""}</Text>
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
            <Text fontSize="$8">
              {item.value?.data?.value
                ? calculateAge(new Date(item.value.data.value))
                : ""}
            </Text>
          </View>
        );
      case "gender":
        return <></>;
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
            <Text fontSize="$8">€{item.value?.data?.value || ""}</Text>
          </View>
        );
      case "name":
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
              Name
            </Text>
            <Text fontSize="$8">{item.value?.data?.value || ""}</Text>
          </View>
        );
      case "university":
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
              University
            </Text>
            <Text fontSize="$8">{item.value?.data?.value?.label}</Text>
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
            <Text fontSize="$8">
              {typeof item.value?.data === "object"
                ? JSON.stringify(item.value.data)
                : item.value?.data || ""}
            </Text>
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
              {profileData?.information.name.value.data.value}
            </Text>
            <Text fontWeight="600" fontSize="$6" color="$color12"></Text>
          </View>
          <Button pressTheme circular={true} onPress={() => router.back()}>
            <X size="$1" color="$color" strokeWidth={2} />
          </Button>
        </View>
        {
          <ScrollView showsVerticalScrollIndicator={false} marginInline="$4">
            {interspersedContent.map((item) => renderContentItem(item))}
          </ScrollView>
        }

        {shouldShowLikes && (
          <Animated.View
            style={{
              position: "absolute",
              bottom: 24,
              right: 24,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <TouchableOpacity
              onPress={sendProfileInteraction}
              activeOpacity={0.9}
              style={{
                backgroundColor: theme.color3.val,
                width: 64,
                height: 64,
                borderRadius: 28,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Heart
                size={28}
                color={"#FF6B6B"}
                fill={"#FF6B6B"}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProfileModal;

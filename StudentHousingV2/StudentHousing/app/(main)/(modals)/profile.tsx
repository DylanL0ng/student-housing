import ImageCollection from "@/components/Profile/ImageCollection";
import { Profile } from "@/typings";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { Text, useTheme, View, Button } from "tamagui";
import { X } from "@tamagui/lucide-icons";

const ProfileModal = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();

  let { profile } = useLocalSearchParams();

  const [profileData, setProfileData] = useState<Profile | undefined>(
    undefined
  );

  const [age, setAge] = useState(0);

  useEffect(() => {
    if (!profile) return;
    const parsedProfile = JSON.parse(
      Array.isArray(profile) ? profile[0] : profile
    ) as Profile;

    console.log("Parsed Profile:", parsedProfile);
    setProfileData(parsedProfile);
  }, [profile]);

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
        <ScrollView
          style={{
            flex: 1,
          }}
        >
          {profileData &&
            profileData.media.map((item: string, index: number) => (
              <View
                marginBlock={"$1"}
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
          <View
            flex={1}
            bg={"$color02"}
            style={{ borderRadius: 16, overflow: "hidden" }}
            gap={8}
          >
            <Text color={"$color"} fontWeight={"bold"} fontSize={"$4"} flex={1}>
              My interests are
            </Text>
            <View flex={1} flexDirection="row" gap={8} paddingBlock={"$2"}>
              {profileData &&
                profileData.interests.map((item: string, index: number) => (
                  <View key={index}>
                    <Button color={"$color"} outline="true" size="$1">
                      {item}
                    </Button>
                  </View>
                ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProfileModal;

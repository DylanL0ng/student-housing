import ImageCollection from "@/components/Profile/ImageCollection";
import { Profile as _Profile, Profile } from "@/typings";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { X } from "@tamagui/lucide-icons";

import { Image } from "expo-image";

import { Text, useTheme, View } from "@tamagui/core";
import { Button } from "@tamagui/button";

const ProfileModal = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();

  let { profile } = useLocalSearchParams();

  const [profileData, setProfileData] = useState<Profile | undefined>(
    undefined
  );

  const { media, title } = JSON.parse(
    Array.isArray(profile) ? profile[0] : profile
  ) as _Profile;

  useEffect(() => {
    navigation.setOptions({
      header: () => <></>,
    });
  }, [navigation]);

  useEffect(() => {
    if (!profile) return;
    setProfileData(JSON.parse(Array.isArray(profile) ? profile[0] : profile));
  }, [profile]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View bg={"$background"} style={{ flex: 1 }}>
        <View
          bg={"$background"}
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
              {title}
            </Text>
            <Text fontWeight={"600"} fontSize={"$6"} color={"$color12"}>
              {}
            </Text>
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

const styles = StyleSheet.create({});

export default ProfileModal;

import ImageCollection from "@/components/Profile/ImageCollection";
import { Profile as _Profile } from "@/typings";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
// import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text, useTheme, View } from "@tamagui/core";
import { Button } from "@tamagui/button";

const Profile = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();

  let { profile } = useLocalSearchParams();

  const { media, title } = JSON.parse(
    Array.isArray(profile) ? profile[0] : profile
  ) as _Profile;

  useEffect(() => {
    navigation.setOptions({
      header: () => <></>,
    });
  }, [navigation]);

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
          <Button circular={true} onPress={() => router.back()}>
            <FontAwesome color={theme.color11.val} name="close" />
          </Button>
        </View>
        <ImageCollection media={media} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default Profile;

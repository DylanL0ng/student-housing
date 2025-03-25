import ImageCollection from "@/components/Profile/ImageCollection";
import { Profile as _Profile } from "@/typings";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const router = useRouter();
  const navigation = useNavigation();
  let { profile } = useLocalSearchParams();

  const parsedProfile = JSON.parse(
    Array.isArray(profile) ? profile[0] : profile
  ) as _Profile;

  useEffect(() => {
    navigation.setOptions({
      header: () => <></>,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            width: "100%",
            backgroundColor: "red",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBlock: 8,
            paddingInline: 16,
          }}
        >
          <Text>Name</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="close" />
          </TouchableOpacity>
        </View>
        <ImageCollection media={parsedProfile.media} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default Profile;

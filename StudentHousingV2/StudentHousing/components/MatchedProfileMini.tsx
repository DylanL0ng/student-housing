import { Profile, User } from "@/typings";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router, useNavigation } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Text, View } from "tamagui";

const MatchedProfileMini = (profile: Profile) => {
  const openConversation = async () => {
    router.push({
      pathname: "/message_thread",
      params: {
        profile: JSON.stringify(profile),
      },
    });
  };

  return (
    <TouchableOpacity onPress={openConversation} activeOpacity={0.95}>
      <View style={styles.container}>
        <Image style={styles.inset} source={profile.media[0]} transition={0} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          locations={[0.3, 1.0]}
          style={styles.inset}
        />
      </View>
      <Text color={"$color08"} style={styles.text}>
        {profile.title || "Unknown"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    aspectRatio: 3 / 4,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    width: 96,
  },
  inset: {
    position: "absolute",
    inset: 0,
  },
  text: {
    textAlign: "center",
    fontWeight: "semibold",
    marginTop: 8,
    width: "100%",
  },
});

export default MatchedProfileMini;

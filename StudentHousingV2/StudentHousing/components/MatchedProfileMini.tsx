import { User } from "@/typings";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useNavigation, useRouter } from "expo-router";
import React, { useContext } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

import { Text, View } from "@tamagui/core";

const MatchedProfileMini = (props: User) => {
  const router = useRouter();
  console.log(props);
  const openConversation = async () => {
    router.push({
      pathname: "/message_thread",
      params: {
        conversationId: props.user_id,
      },
    });
  };

  return (
    <TouchableOpacity onPress={openConversation} activeOpacity={0.75}>
      <View style={styles.container}>
        <Image
          style={styles.inset}
          source={{
            uri: props.profile.media[0],
          }}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          locations={[0.3, 1.0]}
          style={styles.inset}
        />
      </View>
      <Text color={"$color08"} style={styles.text}>
        {props.name || "Unknown"}
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

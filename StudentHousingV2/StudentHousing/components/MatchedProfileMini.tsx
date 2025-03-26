// cimport { Conversations } from "@/constants/Users";
import { User } from "@/typings";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useNavigation, useRouter } from "expo-router";
import React, { useContext } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MatchedProfileMini = (props: User) => {
  const router = useRouter();

  const openConversation = async () => {
    // Fetch conversation id
    router.push({
      pathname: "/message_thread",
      params: {
        conversationId: props.id + ":conversation",
        target: JSON.stringify(props),
      },
    });
  };

  return (
    <TouchableOpacity onPress={openConversation} activeOpacity={0.75}>
      <View style={styles.container}>
        <Image
          style={styles.inset}
          source={{
            uri: "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
          }}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          locations={[0.3, 1.0]}
          style={styles.inset}
        />
      </View>
      <Text style={styles.text}>{props.name || "Unknown"}</Text>
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
    fontWeight: "bold",
    marginTop: 8,
    width: "100%",
  },
});

export default MatchedProfileMini;

import { Conversation, User } from "@/typings";
import { Entypo } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Image, Text, View } from "react-native";

const ConversationMini = (conversation: Conversation) => {
  if (conversation.messages.length === 0) return null;

  const recentMessage = conversation.messages[conversation.messages.length - 1];
  // const yourTurn = recentMessage.sender === "1";

  const yourTurn = true;

  const router = useRouter();

  const openConversation = () => {
    router.push({
      pathname: "/message_thread",
      params: {
        conversationId: conversation.id,
        target: JSON.stringify(conversation),
      },
    });
  };

  return (
    <TouchableOpacity onPress={openConversation} activeOpacity={0.75}>
      <View style={styles.container}>
        <View style={styles.profile}>
          <Image
            style={styles.profileImage}
            source={{
              uri: "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
            }}
          />
        </View>

        <View style={styles.messageContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.fontBold}>{conversation.profile.title}</Text>
            {/* TODO: Change sender === 1 to user id */}
            {yourTurn && (
              <View style={styles.turnIndicator}>
                <Text style={styles.turnIndicatorText}>Your Turn</Text>
              </View>
            )}
          </View>
          <View style={styles.messageRow}>
            {yourTurn && <Entypo name="reply" size={16} color="#374151" />}
            <Text
              style={styles.recentMessage}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {recentMessage?.content}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexWrap: "nowrap",
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 2,
    overflow: "hidden",
  },
  profile: {
    aspectRatio: 1,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    position: "relative",
  },
  profileImage: {
    position: "absolute",
    inset: 0,
  },
  fontBold: {
    fontWeight: "bold",
  },
  recentMessage: {
    color: "#374151",
    width: "100%",
    overflow: "hidden",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    overflow: "hidden", // Prevents content from spilling over
  },
  messageRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  turnIndicator: {
    backgroundColor: "#374151",
    borderRadius: 9999,
    paddingHorizontal: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  turnIndicatorText: {
    fontSize: 10,
    fontWeight: 500,
    color: "white",
  },
});

export default ConversationMini;

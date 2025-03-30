import { Conversation, User } from "@/typings";
import { Entypo } from "@expo/vector-icons";
import { Text, useTheme, View } from "@tamagui/core";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

const ConversationMini = (conversation: User & Conversation) => {
  const recentMessage = conversation.latest_message;
  const yourTurn = true;

  const theme = useTheme();

  const router = useRouter();

  const openConversation = () => {
    router.push({
      pathname: "/message_thread",
      params: {
        conversationId: conversation.user_id,
      },
    });
  };

  return (
    <TouchableOpacity onPress={openConversation} activeOpacity={0.75}>
      <View
        bg={"$color2"}
        paddingInline={"$2"}
        paddingBlock={"$2"}
        rounded={"$2"}
        style={styles.container}
      >
        <View style={styles.profile}>
          <Image
            style={styles.profileImage}
            source={{
              uri: conversation.profile.media[0],
            }}
          />
        </View>

        <View style={styles.messageContainer}>
          <View style={styles.headerRow}>
            <Text color={"$color"} style={styles.fontBold}>
              {conversation.profile.title}
            </Text>
            {yourTurn && (
              <View
                bg={"$yellow4"}
                paddingInline={"$2"}
                rounded={"$9"}
                style={styles.turnIndicator}
              >
                <Text color={"$color"} style={styles.turnIndicatorText}>
                  Your Turn
                </Text>
              </View>
            )}
          </View>
          <View style={styles.messageRow}>
            {yourTurn && (
              <Entypo name="reply" size={16} color={theme.color04.val} />
            )}
            <Text
              color={"$color04"}
              style={styles.recentMessage}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {recentMessage}
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
    width: "100%",
    overflow: "hidden",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
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

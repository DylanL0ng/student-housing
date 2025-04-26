import { Conversation, Profile, User } from "@/typings";
import { Entypo } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Text, useTheme, View } from "tamagui";
const ConversationMini = (profile: Profile) => {
  const conversation = profile.conversations[0];

  const recentMessage = conversation.latest_message;
  const yourTurn = recentMessage.sender_id === profile.id;

  const theme = useTheme();
  const router = useRouter();

  const openConversation = () => {
    router.push({
      pathname: "/message_thread",
      params: {
        profile: JSON.stringify(profile),
      },
    });
  };

  return (
    <TouchableOpacity onPress={openConversation} activeOpacity={0.95}>
      <View
        paddingInline={"$2"}
        paddingBlock={"$2"}
        rounded={"$2"}
        bg={yourTurn ? "$color2" : "$color1"}
        flexDirection="row"
        items={"center"}
      >
        <View style={styles.profile}>
          <Image
            cachePolicy={"none"}
            style={styles.profileImage}
            transition={0}
            source={profile?.media[0]}
          />
        </View>

        <View paddingStart={"$2"}>
          <View flexDirection={"row"} justify={"space-between"} width={"75%"}>
            <Text color={"$color"} fontWeight={"bold"}>
              {profile.information.name.value.data.value}
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
              {recentMessage.content}
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

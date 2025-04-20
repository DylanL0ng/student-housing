import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import ImageCollection from "./Profile/ImageCollection";
import { Profile } from "@/typings";

import { View } from "tamagui";
import { router } from "expo-router";
import { useProfile } from "@/providers/ProfileProvider";

const ProfileCard = ({ profile }: { profile: Profile }) => {
  // console.log("ProfileCard", profile);
  const { getInterestName } = useProfile();
  return (
    <View style={styles.body}>
      <View style={styles.float}>
        <ImageCollection media={profile.media} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,1)"]}
          locations={[0.3, 0.75]}
          style={{ ...styles.float, pointerEvents: "none" }}
        />
      </View>
      <View style={{ ...styles.personalInfoWrapper }}>
        <Text style={styles.personalInfoGreeting}>
          {profile.title}, {0}
        </Text>
        <View
          style={{
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          {/* <View style={styles.personalInfoEntryWrapper}>
            <Text>
              <MaterialIcons name="savings" color={"#e5e7eb"} size={18} />
            </Text>
            <Text style={styles.personalInfoEntryText}>€750</Text>
          </View> */}
          {/* <View style={styles.personalInfoEntryWrapper}>
            <Text>
              <Entypo name="location-pin" color={"#e5e7eb"} size={32} />
            </Text>
            <Text style={styles.personalInfoLocationText}>
              {profile.location.city} - {profile.location.distance} km away
            </Text>
          </View> */}
        </View>
        <View
          style={{
            display: "flex",
            width: "100%",
            overflow: "hidden",
            // backgroundColor: "red",
            flexDirection: "row",
            gap: 8,
          }}
        >
          {profile.interests?.map((interest, index) => (
            <View
              key={index}
              // boxSizing="content-box"
              // bg={"$yellow5"}
              borderWidth={"$1"}
              borderColor={"$yellow5"}
              style={styles.personalInfoInterestsWrapper}
            >
              <Text style={styles.personalInfoInterestsText}>
                {getInterestName(interest)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(main)/(modals)/profile",
            params: {
              profile: JSON.stringify(profile),
            },
          })
        }
      >
        <View style={styles.dropdownButton}>
          <Entypo name="chevron-down" size={28} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    padding: 16,
    width: "100%",
    color: "white",
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
    flex: 1,
    justifyContent: "flex-end",
  },
  float: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  personalInfoWrapper: {
    padding: 8,
    flex: 1,
    justifyContent: "flex-end",
    gap: 8,
  },
  personalInfoGreeting: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  personalInfoEntryWrapper: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    // width: "100%",
    flexWrap: "wrap",
  },
  personalInfoEntryText: {
    color: "#e5e7eb",
  },
  personalInfoLocationText: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "medium",
  },
  personalInfoInterestsWrapper: {
    boxSizing: "border-box",
    borderColor: "#22c55e",
    borderRadius: 10000,
    minWidth: 64,
    justifyContent: "center",
    display: "flex",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  personalInfoInterestsText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
});
export default ProfileCard;

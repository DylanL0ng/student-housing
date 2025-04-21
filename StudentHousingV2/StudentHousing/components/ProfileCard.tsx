import { Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { View } from "tamagui";
import { router } from "expo-router";
import { useEffect, useState, useMemo } from "react";

import ImageCollection from "./Profile/ImageCollection";
import { useProfile } from "@/providers/ProfileProvider";
import { Profile, InformationItem } from "@/typings";
import { calculateAge } from "@/utils/utils";

type ProfileCardProps = {
  profile: Profile;
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const { getInterestName } = useProfile();
  const { information, interests = [], media } = profile;

  const [parsedAge, setParsedAge] = useState<number>(0);

  // Parse profile information into a more usable format
  const parsedProfileInformation = useMemo(() => {
    return information.reduce<Record<string, string>>(
      (acc, item: InformationItem) => {
        acc[item.key] = item.value.data.value;
        return acc;
      },
      {}
    );
  }, [information]);

  const { name, age } = parsedProfileInformation;

  useEffect(() => {
    if (age) {
      setParsedAge(calculateAge(new Date(age)));
    }
  }, [age]);

  const handleProfilePress = () => {
    router.push({
      pathname: "/(main)/(modals)/profile",
      params: {
        profile: JSON.stringify(profile),
      },
    });
  };

  return (
    <View style={styles.body}>
      <View style={styles.float}>
        <ImageCollection media={media} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,1)"]}
          locations={[0.3, 0.75]}
          style={styles.gradient}
        />
      </View>

      <View style={styles.personalInfoWrapper}>
        <Text style={styles.personalInfoGreeting}>
          {name}, {parsedAge}
        </Text>

        <View style={styles.interestsContainer}>
          {interests.map((interest, index) => (
            <View
              key={index}
              borderWidth="$1"
              borderColor="$yellow5"
              style={styles.personalInfoInterestsWrapper}
            >
              <Text style={styles.personalInfoInterestsText}>
                {getInterestName(interest)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={handleProfilePress}>
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
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
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
  interestsContainer: {
    display: "flex",
    width: "100%",
    overflow: "hidden",
    flexDirection: "row",
    gap: 8,
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

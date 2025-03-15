import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ProfileData = {
  date_of_birth: string;
  full_name: string;
  id: string;
  location: string;
  interests: string[]; // Interests should be an array of interest IDs
};

const calculateAge = (timestamptz: string) => {
  const birthDate = new Date(timestamptz);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  // Adjust age if the birthday hasn't occurred this year yet
  const isBeforeBirthdayThisYear =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());

  if (isBeforeBirthdayThisYear) {
    age--;
  }

  return age;
};

const ProfileCard = ({
  date_of_birth,
  full_name,
  id,
  location,
  interests,
}: ProfileData) => {
  const [age, setAge] = useState(calculateAge(date_of_birth));

  return (
    <View style={styles.body}>
      <View style={styles.float}>
        <Image
          source={{
            uri: "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
          }}
          style={styles.float}
        ></Image>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          locations={[0.3, 1.0]}
          style={styles.float}
        />
      </View>
      <View style={{ ...styles.personalInfoWrapper }}>
        <Text style={styles.personalInfoGreeting}>
          {full_name}, {age}
        </Text>
        <View
          style={{
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <View style={styles.personalInfoEntryWrapper}>
            <Text>
              <MaterialIcons name="savings" color={"#e5e7eb"} size={18} />
            </Text>
            <Text style={styles.personalInfoEntryText}>€750</Text>
          </View>
          <View style={styles.personalInfoEntryWrapper}>
            <Text>
              <Entypo name="location-pin" color={"#e5e7eb"} size={32} />
            </Text>
            <Text style={styles.personalInfoLocationText}>
              Dublin - 2 kms away
            </Text>
          </View>
        </View>
        <View style={{ display: "flex", flexDirection: "row", gap: 8 }}>
          {interests?.map((interest, index) => (
            <View key={index} style={styles.personalInfoInterestsWrapper}>
              <Text style={styles.personalInfoInterestsText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
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
    backgroundColor: "rgba(34, 197, 94, 0.5)",
    boxSizing: "border-box",
    borderColor: "#22c55e",
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  personalInfoInterestsText: {
    color: "white",
    fontSize: 14,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
});
export default ProfileCard;

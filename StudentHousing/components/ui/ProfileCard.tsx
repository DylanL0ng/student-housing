import { StorageContext } from "@/app/auth_provider";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

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
  const storage = useContext(StorageContext);
  const age = calculateAge(date_of_birth);

  return (
    <View className="p-4 w-full px-4 mb-4 mt-8 flex-1 bg-black rounded-xl text-white justify-end relative overflow-hidden">
      <View className="absolute inset-0">
        <Image
          source={{
            uri: "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
          }}
          className="absolute inset-0"
        ></Image>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          locations={[0.3, 1.0]}
          className="absolute inset-0"
        />
      </View>
      <View id="personal--info" className="flex gap-2">
        <Text className="text-white text-4xl font-bold">
          {full_name}, {age}
        </Text>
        <View>
          <View className="flex flex-row justify-start items-center gap-2">
            <Text className="text-gray-200">
              <MaterialIcons
                name="savings"
                size={18}
                className="text-gray-200"
              />
            </Text>
            <Text className="text-lg font-semibold text-gray-200">€750</Text>
          </View>
          <View className="flex flex-row justify-start items-center gap-2">
            <Text className="text-gray-200">
              <Entypo name="location-pin" size={18} />
            </Text>
            <Text className="text-lg font-medium text-gray-200">
              Dublin - 2 kms away
            </Text>
          </View>
        </View>
        <View className="flex flex-row justify-start gap-2">
          {interests?.map((interest, index) => (
            <View
              key={index}
              className="bg-green-500/50 border box-border border-green-500 rounded-full px-2 py-1"
            >
              <Text className="text-white text-sm">
                {storage?.interests[interest]}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity>
        <View className="flex flex-row justify-center mt-4">
          <Entypo name="chevron-down" size={28} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileCard;

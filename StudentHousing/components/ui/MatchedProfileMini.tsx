import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, View } from "react-native";

type Props = {
  name: string;
};

const MatchedProfileMini = (props: Props) => {
  return (
    <View>
      <View className="w-32 bg-gray-300 rounded aspect-[3/4] relative overflow-hidden">
        <Image
          className="absolute inset-0"
          source={{
            uri: "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
          }}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          locations={[0.3, 1.0]}
          className="absolute inset-0"
        />
      </View>
      <Text className="text-center font-bold mt-2 w-full">
        {props.name || "Unknown"}
      </Text>
    </View>
  );
};

export default MatchedProfileMini;

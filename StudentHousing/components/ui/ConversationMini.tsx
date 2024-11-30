import { Link, useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const ConversationMini = () => {
  return (
    <Link href={"/message_thread"}>
      <View className="flex flex-nowrap w-full items-center flex-row gap-4 px-2 overflow-hidden">
        <View className="aspect-square w-16 bg-gray-300 rounded-full relative overflow-hidden">
          <Image
            className="absolute inset-0"
            source={{
              uri: "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
            }}
          />
        </View>
        <View>
          <Text className="font-bold">FULL NAME</Text>
          <Text className="text-ellipsis overflow-hidden w-full text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipisci amet, consectetur
            adipisci
          </Text>
        </View>
      </View>
    </Link>
  );
};

export default ConversationMini;

import { AuthContext } from "@/app/auth_provider";
import { supabase } from "@/lib/supabase";
import { User } from "@/typings";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useNavigation, useRouter } from "expo-router";
import React, { useContext } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const MatchedProfileMini = (props: User) => {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const openConversation = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("conversation_id")
      .match({
        user_id: auth?.session?.user.id,
        other_id: props.id,
      })
      .single();

    router.push({
      pathname: "/message_thread",
      params: {
        conversationId: data?.conversation_id,
        target: JSON.stringify(props),
      },
    });
  };

  console.log(props.full_name);

  return (
    <TouchableOpacity onPress={openConversation} activeOpacity={0.75}>
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
        {props.full_name || "Unknown"}
      </Text>
    </TouchableOpacity>
  );
};

export default MatchedProfileMini;

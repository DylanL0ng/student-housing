import { Entypo, Feather } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

type TextMessageProps = {
  sender: boolean;
  text: string;
};

const MessageThread = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const Header = () => (
    <View className="flex flex-row px-4 py-4 items-center justify-between">
      <TouchableOpacity activeOpacity={0.75} onPress={() => router.back()}>
        <View className="aspect-square rounded-full w-10 bg-slate-300 flex items-center justify-center">
          <Entypo name="chevron-left" size={20} color="black" />
        </View>
      </TouchableOpacity>
      <View className="flex flex-row items-center gap-2">
        <View className="aspect-square rounded-full w-12 bg-slate-600"></View>
        <View className="flex">
          <Text className="font-bold">John Doe</Text>
          <Text>Added today!</Text>
        </View>
      </View>
      <View className="aspect-square rounded-full w-10 bg-slate-300 flex items-center justify-center">
        <Entypo name="dots-three-horizontal" size={20} color="black" />
      </View>
    </View>
  );

  const TextMessage = (props: TextMessageProps) => (
    <View
      className={`flex flex-row ${props.sender ? "justify-end" : "justify-start"}`}
    >
      <Text
        className={`rounded-full p-2 px-3 text-white ${props.sender ? "rounded-br-none bg-slate-600" : "bg-blue-500 rounded-bl-none"}`}
      >
        {props.text}
      </Text>
    </View>
  );

  useEffect(() => {
    navigation.setOptions({
      header: Header,
    });
  }, [navigation]);

  const createTextMessage = (text: string) => {
    setMessages([...messages, { text, sender: true }]);
    setTextInputMessage("");
  };

  const [textInputMessage, setTextInputMessage] = useState("");
  const [messages, setMessages] = useState([
    { text: "Hello world!", sender: false },
    { text: "Hello world!", sender: true },
  ]);

  return (
    <View className="flex-1">
      <View className="flex-1 px-2 gap-1">
        {messages.map((message, index) => {
          return (
            <TextMessage
              key={index}
              text={message.text}
              sender={message.sender}
            />
          );
        })}
      </View>
      <View className="flex flex-row justify-between gap-2 items-center px-4 py-2">
        <View className="flex-1 h-12 border rounded-full">
          <TextInput
            className="flex-1 mx-4 h-full"
            placeholder="Write your message here"
            onChangeText={(value) => setTextInputMessage(value)}
            onSubmitEditing={() => createTextMessage(textInputMessage)}
            value={textInputMessage}
          />
        </View>
        <TouchableOpacity onPress={() => createTextMessage(textInputMessage)}>
          <View className="h-12 aspect-square bg-slate-500 flex items-center justify-center rounded-full">
            <Feather name="send" size={14} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageThread;

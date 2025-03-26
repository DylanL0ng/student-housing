import { Entypo, Feather } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AuthContext, StorageContext } from "./auth_provider";
import { useLocalSearchParams } from "expo-router";
import { Message, User } from "@/typings";
// import { supabase } from "@/lib/supabase";
import UUID from "react-native-uuid";

type TextMessageProps = {
  sender: boolean;
  text: string;
};

const Header = ({
  router,
  user,
}: {
  router: ReturnType<typeof useRouter>;
  user: User;
}) => {
  return (
    <View className="flex flex-row px-4 py-4 items-center justify-between">
      <TouchableOpacity activeOpacity={0.75} onPress={() => router.back()}>
        <View className="aspect-square rounded-full w-10 bg-slate-300 flex items-center justify-center">
          <Entypo name="chevron-left" size={20} color="black" />
        </View>
      </TouchableOpacity>
      <View className="flex flex-row items-center gap-2">
        <Image
          source={{
            uri: "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
          }}
          className="aspect-square rounded-full w-12 bg-slate-600"
        />
        <View className="flex">
          <Text className="font-bold">{user.full_name}</Text>
          <Text>Added today!</Text>
        </View>
      </View>
      <View className="aspect-square rounded-full w-10 bg-slate-300 flex items-center justify-center">
        <Entypo name="dots-three-horizontal" size={20} color="black" />
      </View>
    </View>
  );
};

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

const MessageThread = () => {
  const [textInputMessage, setTextInputMessage] = useState("");
  let { conversationId, target: _target } = useLocalSearchParams();

  if (typeof _target !== "string") return;

  _target = JSON.parse(_target);

  console.log(_target);
  let target: User = {
    id: _target.id,
    full_name: _target.full_name,
    date_of_birth: _target.date_of_birth,
    location: _target.location,
    interests: _target.interests,
  };

  console.log(target.id, target.full_name);
  const [convoId, setConvoId] = useState(
    typeof conversationId === "string" ? conversationId : ""
  );

  const [messages, setMessages] = useState<Message[]>([]);

  const storage = useContext(StorageContext);
  const auth = useContext(AuthContext);

  const router = useRouter();
  const navigation = useNavigation();

  const setupMessages = async () => {
    // const { data, error } = await supabase
    //   .from("conversations")
    //   .select("conversation_id")
    //   .eq("conversation_id", convoId)
    //   .single(); // Assuming conversation_id is unique, expect a single result
    // if (data === null || error) {
    //   let uuid = UUID.v4();
    //   setConvoId(uuid);
    // }
    // const { data: data2, error: error2 } = await supabase
    //   .from("messages")
    //   .select("message_id, content, sent_at, sender, conversation_id")
    //   .eq("conversation_id", convoId);
    // console.log("Messages data:", data2, error2);
    // setMessages(data2 || []);
    // setMessages(storage?.state.conversations[convoId]?.messages || []);
  };

  useEffect(() => {
    setupMessages();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      header: () => <Header router={router} user={target} />,
    });
  }, [navigation]);

  const createTextMessage = async (text: string) => {
    if (!auth?.session?.user.id) return;

    // const { data: insertedData, error: insertError } = await supabase
    //   .from("conversations")
    //   .insert([
    //     {
    //       user_id: auth?.session?.user.id,
    //       other_id: target.id,
    //       conversation_id: convoId,
    //     },
    //   ])
    //   .single();

    // console.log("Inserted conversation data:", insertedData);
    // if (insertError) {
    //   console.error("Error inserting conversation:", insertError.message);
    // } else {
    //   console.log("Inserted conversation data:", insertedData);
    // }
    // const message: Message = {
    //   content: text,
    //   sender: auth?.session?.user.id,
    //   sent_at: new Date().toISOString(),
    //   message_id: UUID.v4(),
    //   conversation_id: convoId,
    // };

    // storage?.dispatch({
    //   type: "ADD_MESSAGE",
    //   payload: {
    //     convoId,
    //     message: message,
    //   },
    // });

    // setTextInputMessage("");
    // setMessages([...messages, message]);

    // const { data: inserted, error: insertsError } = await supabase
    //   .from("messages")
    //   .insert([message])
    //   .single();
  };

  return (
    <View className="flex-1">
      <View className="flex-1 px-2 gap-1">
        {messages?.map((message, index) => {
          return (
            <TextMessage
              key={index}
              text={message.content}
              sender={
                auth?.session ? message.sender === auth.session.user.id : false
              }
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

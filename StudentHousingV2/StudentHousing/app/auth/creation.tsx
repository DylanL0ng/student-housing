import TailwindColours from "@/constants/TailwindColours";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import supabase from "../lib/supabase";
import { Button, Input } from "@rneui/themed";

const CreateScreen = () => {
  const [title, setTitle] = useState("My name is...");
  const [description, setDescription] = useState(
    "This is how people will know you"
  );

  const cancelCreation = () => {
    supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        id="container"
        style={{ flex: 1, backgroundColor: TailwindColours.background.primary }}
      >
        <View
          id="progress-bar"
          style={{ width: "100%", backgroundColor: "black" }}
        >
          <View
            id="indicator"
            style={{ height: 10, width: "10%", backgroundColor: "red" }}
          ></View>
        </View>
        <View style={{ padding: 24 }}>
          <TouchableOpacity activeOpacity={0.9} onPress={cancelCreation}>
            <View id="close-button">
              <MaterialIcons
                name="close"
                size={40}
                color={TailwindColours.text.muted}
              />
            </View>
          </TouchableOpacity>
          <View
            id="input-group"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              marginTop: 16,
            }}
          >
            <View style={{ display: "flex", gap: 8 }}>
              <Text
                style={{
                  color: TailwindColours.text.primary,
                  fontSize: 24,
                  fontWeight: "bold",
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  color: TailwindColours.text.muted,
                  fontSize: 14,
                  padding: 0,
                  margin: 0,
                }}
              >
                {description}
              </Text>
            </View>
            <Input
              placeholder="Your name"
              placeholderTextColor={TailwindColours.text.muted}
              style={{
                paddingInline: 16,
                color: TailwindColours.text.primary,
                backgroundColor: TailwindColours.background.secondary,
                borderColor: TailwindColours.background.tertiary,
                borderWidth: 2,
                height: 48,
                borderRadius: 8,
              }}
            />
          </View>
          <Button title={"Continue"} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreateScreen;

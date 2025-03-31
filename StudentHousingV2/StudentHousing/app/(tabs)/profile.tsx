import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import supabase from "../lib/supabase";
import MediaUpload, { ImageItem } from "@/components/MediaUpload";
import { CreationSlider } from "@/components/Inputs/Creation";
import { router, useNavigation } from "expo-router";
import DatePicker from "react-native-date-picker";
import { Button } from "@tamagui/button";

export default function ProfileScreen() {
  const [images, setImages] = useState<ImageItem[]>([]);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      header: () => <></>,
    });
  }, [navigation]);

  const getUserProfileImages = async () => {
    const { data, error } = await supabase.storage
      .from("profile-images")
      .list("1/");

    const newImages = [];
    if (data) {
      for (const item of data) {
        const { data: urlData } = await supabase.storage
          .from("profile-images")
          .getPublicUrl(`1/${item.name}`);

        const index = parseInt(item.name.split(".")[0]);
        newImages[index] = {
          uri: urlData.publicUrl,
          id: String(index),
          path: item.name,
        };
      }
    }

    setImages(newImages);
  };

  useEffect(() => {
    getUserProfileImages();
  }, []);

  const handleUpload = (index: number, uri: string, path: string) => {
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages[index] = { uri, id: String(index), path };
      return updatedImages;
    });
  };

  const handleDelete = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <TouchableOpacity
        style={{ backgroundColor: "red" }}
        onPress={() => {
          router.push("/auth/creation");
          // console.log("LOGGING OUT");
          // supabase.auth.signOut();
        }}
      >
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

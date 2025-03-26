import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import supabase from "../lib/supabase";
import MediaUpload, { ImageItem } from "@/components/MediaUpload";
import TailwindColours from "@/constants/TailwindColours";

export default function ProfileScreen() {
  const [images, setImages] = useState<ImageItem[]>([]);

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
          supabase.auth.signOut();
        }}
      >
        <Text>Logout</Text>
      </TouchableOpacity>
      <MediaUpload
        images={images}
        onUpload={handleUpload}
        onDelete={handleDelete}
      />
    </View>
  );
}

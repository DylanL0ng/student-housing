import TailwindColours from "@/constants/TailwindColours";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";

import * as ImagePicker from "expo-image-picker";
import supabase from "@/app/lib/supabase";

export interface ImageItem {
  uri?: string;
  id?: string;
  path?: string;
}

export interface MediaUploadProps {
  images: ImageItem[];
  onUpload: (index: number, uri: string, mimeType: string) => void;
  onDelete: (index: number) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  images,
  onUpload,
  onDelete,
}) => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (idx: number, uri: string, mimeType: string) => {
    try {
      setUploading(true);

      const arraybuffer = await fetch(uri).then((res) => res.arrayBuffer());
      const fileExt = uri.split(".").pop()?.toLowerCase() ?? "jpeg";
      const path = `1/${idx}.${fileExt}`;

      const { error } = await supabase.storage
        .from("profile-images")
        .upload(path, arraybuffer, { contentType: mimeType ?? "image/jpeg" });

      if (error) throw error;
      onUpload(idx, uri, mimeType); // Callback to parent with image path
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (index: number) => {
    try {
      const imageToDelete = images[index];
      if (!imageToDelete?.path) return;
      setUploading(true);
      const { error } = await supabase.storage
        .from("profile-images")
        .remove([imageToDelete.path]);
      if (error) throw error;
      onDelete(index); // Callback to parent after deletion is successful
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleImagePick = useCallback(
    async (index: number) => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          exif: false,
          allowsEditing: true,
          allowsMultipleSelection: false,
          quality: 1,
        });

        if (result.canceled || !result.assets?.length) return;

        const image = result.assets[0];
        if (!image.uri) throw new Error("No image uri!");

        await uploadImage(index, image.uri, image.mimeType ?? "image/jpeg");
      } catch (error) {
        console.error("Image pick error:", error);
      }
    },
    [images]
  );

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        {Array(9)
          .fill(0)
          .map((_, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.cell}
              onPress={() => handleImagePick(idx)}
            >
              {images[idx]?.uri ? (
                <>
                  <Image
                    source={{ uri: images[idx].uri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => deleteImage(idx)}
                    style={styles.deleteButton}
                  >
                    <MaterialIcons name="close" size={24} color="black" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.addButton}>
                  <MaterialIcons name="add" size={24} color="black" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  cell: {
    overflow: "hidden",
    width: "32%",
    height: 165,
    backgroundColor: TailwindColours.text.muted,
    borderRadius: 8,
    margin: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  deleteButton: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  addButton: {
    position: "absolute",
    top: 0,
    right: 0,
  },
});

export default MediaUpload;

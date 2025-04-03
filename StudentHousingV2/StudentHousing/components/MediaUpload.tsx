import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useTheme, View } from "tamagui";

import * as ImagePicker from "expo-image-picker";
import supabase from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export interface ImageObject {
  uri: string;
  order: number;
}

export interface MediaUploadProps {
  images: ImageObject[];
  onUpload: (image: ImageObject) => void;
  onDelete: (image: ImageObject) => void;
  onLoad: () => void;
}

export const uploadImage = async (session: Session, image: ImageObject) => {
  try {
    const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());
    const fileExt = image.uri.split(".").pop()?.toLowerCase() ?? "jpeg";
    const path = `${session?.user.id}/${image.order}.${fileExt}`;
    const { error } = await supabase.storage
      .from("profile-images")
      .update(path, arraybuffer, {
        contentType: "image/jpeg",
      });

    if (error) throw error;
  } catch (error) {
    console.error("Upload error:", error);
  }
};

export const deleteImage = async (session: Session, image: ImageObject) => {
  try {
    if (!image) return;

    const fileExt = image.uri.split(".").pop()?.toLowerCase() ?? "jpeg";
    const { error } = await supabase.storage
      .from("profile-images")
      .remove([`${session.user.id}/${image.order}.${fileExt}`]);

    if (error) throw error;
  } catch (error) {
    console.error("Delete error:", error);
  }
};

const MediaUpload: React.FC<MediaUploadProps> = ({
  images,
  onUpload,
  onDelete,
  onLoad,
}) => {
  const theme = useTheme();

  useEffect(() => {
    onLoad();
  }, []);

  const handleImagePick = useCallback(
    async (order: number) => {
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
        onUpload({ order, uri: image.uri });
      } catch (error) {
        console.error("Image pick error:", error);
      }
    },
    [uploadImage]
  );

  const renderImages = useMemo(() => {
    const imageMap = new Map(images.map((img) => [img.order, img]));

    return Array.from({ length: 9 }, (_, idx) => {
      const image = imageMap.get(idx);

      return (
        <TouchableOpacity
          style={{
            ...styles.cell,
            backgroundColor: theme.color02.val,
          }}
          key={`${idx}`}
          onPress={() => handleImagePick(idx)}
        >
          {image ? (
            <>
              <Image
                source={image.uri}
                style={[styles.image, { resizeMode: "cover" }]}
              />
              <TouchableOpacity
                onPress={() => onDelete({ uri: image.uri, order: idx })}
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
      );
    });
  }, [images, theme.color02.val, handleImagePick, deleteImage]);

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>{renderImages}</View>
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

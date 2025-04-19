import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { AlertDialog, Button, useTheme, View, XStack, YStack } from "tamagui";

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
  images: defaultImages,
  onLoad,
  onDelete,
  onUpload,
}) => {
  const theme = useTheme();

  const [modalOpen, setModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ImageObject | null>(null);
  const [images, setImages] = useState<ImageObject[]>([]);

  // Load default images on mount
  useEffect(() => {
    setImages(defaultImages);
    onLoad();
  }, [defaultImages, onLoad]);

  const handleImagePick = useCallback(async (order: number) => {
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

      const newImage = { order, uri: image.uri };

      setImages((prev) => {
        const filtered = prev.filter((img) => img.order !== order);
        return [...filtered, newImage];
      });

      const session = await supabase.auth
        .getSession()
        .then((res) => res.data.session);
      if (session) {
        await uploadImage(session, newImage);
      }
    } catch (error) {
      console.error("Image pick error:", error);
    }
  }, []);

  const handleDeleteImage = useCallback((image: ImageObject) => {
    setImageToDelete(image); // Set the image to delete
    setModalOpen(true); // Open modal
  }, []);

  const handleImageDeleteAccept = useCallback(async () => {
    console.log("Deleting image:", imageToDelete);
    if (!imageToDelete) return;

    setImages((prev) =>
      prev.filter((img) => img.order !== imageToDelete.order)
    );

    onDelete(imageToDelete);

    setModalOpen(false); // Close modal after deleting
    setImageToDelete(null); // Reset image to delete
  }, [imageToDelete]);

  const handleImageDeleteReject = useCallback(() => {
    setModalOpen(false); // Close modal
    setImageToDelete(null); // Reset image to delete
  }, []);

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
          activeOpacity={0.9}
          key={`${idx}`}
          onPress={() => handleImagePick(idx)}
        >
          {image ? (
            <>
              <Image
                source={image.uri}
                style={[
                  styles.image,
                  { resizeMode: "cover", position: "absolute", zIndex: 0 },
                ]}
              />
              <Button
                elevate
                elevation={3}
                circular
                size="$2"
                theme="accent"
                onPress={() => handleDeleteImage(image)} // Trigger delete
                bordered
              >
                <MaterialIcons name="close" size={24} color="black" />
              </Button>
            </>
          ) : (
            <Button circular size="$2" theme="accent">
              <MaterialIcons name="add" size={24} color="black" />
            </Button>
          )}
        </TouchableOpacity>
      );
    });
  }, [images, handleImagePick]);

  return (
    <>
      <AlertDialog open={modalOpen} native onOpenChange={setModalOpen}>
        <AlertDialog.Trigger asChild>
          <></>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <AlertDialog.Content
            bordered
            elevate
            key="content"
            animation={[
              "quick",
              {
                opacity: { overshootClamping: true },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            scale={1}
            opacity={1}
            y={0}
          >
            <YStack gap="$4">
              <AlertDialog.Title>Are you sure?</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure you want to delete this image? This action cannot
                be undone.
              </AlertDialog.Description>
              <XStack gap="$3" justifyContent="flex-end">
                <AlertDialog.Cancel onPress={handleImageDeleteReject} asChild>
                  <Button>Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action onPress={handleImageDeleteAccept} asChild>
                  <Button theme="accent">Accept</Button>
                </AlertDialog.Action>
              </XStack>
            </YStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>

      <View style={styles.container}>
        <View style={styles.wrapper}>{renderImages}</View>
      </View>
    </>
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

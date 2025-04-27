import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { AlertDialog, Button, useTheme, View, XStack, YStack } from "tamagui";

import * as ImagePicker from "expo-image-picker";
import supabase from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useProfile } from "@/providers/ProfileProvider";

export interface ImageObject {
  uri: string;
  order: number;
}

export interface MediaUploadProps {
  images: ImageObject[];
  onUpload?: (image: ImageObject) => void;
  onDelete?: (image: ImageObject) => void;
  onLoad?: () => void;
}

export const uploadImage = async (profileId: string, image: ImageObject) => {
  try {
    const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());
    const fileExt = image.uri.split(".").pop()?.toLowerCase() ?? "jpeg";
    const path = `${profileId}/${image.order}.${fileExt}`;

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

export const deleteImage = async (profileId: string, image: ImageObject) => {
  try {
    if (!image) return;

    const fileExt = image.uri.split(".").pop()?.toLowerCase() ?? "jpeg";
    const { error } = await supabase.storage
      .from("profile-images")
      .remove([`${profileId}/${image.order}.${fileExt}`]);

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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ImageObject | null>(null);
  const [imageToReplace, setImageToReplace] = useState<number | null>(null);
  const [images, setImages] = useState<ImageObject[]>([]);

  const { activeProfileId } = useProfile();

  useEffect(() => {
    setImages(defaultImages);
    if (onLoad) onLoad();
  }, [defaultImages, onLoad]);

  const launchImagePicker = useCallback(
    async (order: number) => {
      if (activeProfileId === null) return;
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

        onUpload?.(newImage);

        setImages((prev) => {
          const filtered = prev.filter((img) => img.order !== order);
          return [...filtered, newImage];
        });

        await uploadImage(activeProfileId, newImage);
      } catch (error) {
        console.error("Image pick error:", error);
      }
    },
    [activeProfileId, onUpload]
  );

  const handleImagePick = useCallback(
    (order: number) => {
      const existingImage = images.find((img) => img.order === order);

      if (existingImage) {
        // If there's already an image in this slot, show replacement confirmation
        setImageToReplace(order);
        setReplaceModalOpen(true);
      } else {
        // If no existing image, just pick a new one
        launchImagePicker(order);
      }
    },
    [images, launchImagePicker]
  );

  const handleDeleteImage = useCallback((image: ImageObject) => {
    setImageToDelete(image); // Set the image to delete
    setDeleteModalOpen(true); // Open delete modal
  }, []);

  const handleImageDeleteAccept = useCallback(async () => {
    if (!imageToDelete) return;

    setImages((prev) =>
      prev.filter((img) => img.order !== imageToDelete.order)
    );

    deleteImage(activeProfileId, imageToDelete);
    setDeleteModalOpen(false); // Close modal after deleting
    setImageToDelete(null); // Reset image to delete
    onDelete?.(imageToDelete); // Call onDelete callback if provided
  }, [imageToDelete, onDelete]);

  const handleImageDeleteReject = useCallback(() => {
    setDeleteModalOpen(false); // Close modal
    setImageToDelete(null); // Reset image to delete
  }, []);

  const handleImageReplaceAccept = useCallback(async () => {
    if (imageToReplace !== null) {
      launchImagePicker(imageToReplace);
    }

    // const image = images.find((img) => img.order === imageToReplace);

    // // await deleteImage(
    // //   activeProfileId,
    // //   images.find((img) => img.order === imageToReplace)
    // // );

    // // await uploadImage(
    // //   activeProfileId,
    // //   images.find((img) => img.order === imageToReplace)
    // // );

    setReplaceModalOpen(false);
    setImageToReplace(null);
  }, [imageToReplace, launchImagePicker]);

  const handleImageReplaceReject = useCallback(() => {
    setReplaceModalOpen(false);
    setImageToReplace(null);
  }, []);

  const renderImages = useMemo(() => {
    const imageMap = new Map(images.map((img) => [img.order, img]));

    return Array.from({ length: 9 }, (_, idx) => {
      const image = imageMap.get(idx);

      return (
        <View
          key={`image-${idx}`}
          bg={"$backgroundHover"}
          borderWidth={"$0.5"}
          borderColor={image ? "$color" : "$color02"}
          borderStyle={image ? "solid" : "dashed"}
          style={{
            ...styles.cell,
          }}
          onPress={() => handleImagePick(idx)}
        >
          {image ? (
            <>
              <Image
                cachePolicy={"none"}
                source={image.uri}
                style={[
                  styles.image,
                  { resizeMode: "cover", position: "absolute", zIndex: 0 },
                ]}
              />
              <Button
                elevate
                elevation={3}
                top={4}
                left={4}
                circular
                size="$2"
                theme="accent"
                onPress={() => handleDeleteImage(image)}
                bordered
              >
                <MaterialIcons name="close" size={18} color="black" />
              </Button>
            </>
          ) : (
            <Button circular top={4} left={4} size="$2" theme="accent">
              <MaterialIcons name="add" size={18} color="black" />
            </Button>
          )}
        </View>
      );
    });
  }, [images, handleImagePick, handleDeleteImage]);

  return (
    <>
      {/* Delete Image Alert Dialog */}
      <AlertDialog
        open={deleteModalOpen}
        native
        onOpenChange={setDeleteModalOpen}
      >
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
              <AlertDialog.Title>Delete Image</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure you want to delete this image? This action cannot
                be undone.
              </AlertDialog.Description>
              <XStack gap="$3" justifyContent="flex-end">
                <AlertDialog.Cancel onPress={handleImageDeleteReject} asChild>
                  <Button>Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action onPress={handleImageDeleteAccept} asChild>
                  <Button theme="accent">Delete</Button>
                </AlertDialog.Action>
              </XStack>
            </YStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>

      {/* Replace Image Alert Dialog */}
      <AlertDialog
        open={replaceModalOpen}
        native
        onOpenChange={setReplaceModalOpen}
      >
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
              <AlertDialog.Title>Replace Image</AlertDialog.Title>
              <AlertDialog.Description>
                Do you want to replace this image with a new one? The current
                image will be lost.
              </AlertDialog.Description>
              <XStack gap="$3" justifyContent="flex-end">
                <AlertDialog.Cancel onPress={handleImageReplaceReject} asChild>
                  <Button>Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action onPress={handleImageReplaceAccept} asChild>
                  <Button theme="accent">Replace</Button>
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
    gap: 4,
  },
  cell: {
    overflow: "hidden",
    width: "30%",
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

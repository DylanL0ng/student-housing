import React, { useCallback } from "react";
import { CreationText } from "./CreationText";
import { CreationMultiSelect } from "./CreationMultiSelect";
import { CreationSlider } from "./CreationSlider";
import { CreationDate } from "./CreationDate";
import MediaUpload, {
  deleteImage,
  ImageObject,
  uploadImage,
} from "../MediaUpload";
import { useAuth } from "@/providers/AuthProvider";
import supabase from "@/lib/supabase";
import { View } from "tamagui";
import { Question } from "@/app/(auth)/creation";
import { LocationPicker } from "../LocationPicker";
import { useProfile } from "@/providers/ProfileProvider";

interface CreationInputFactoryProps {
  question: Question;
  state: [any, any];
}

export const CreationInputFactory = ({
  question,
  state,
}: CreationInputFactoryProps) => {
  const { session } = useAuth();
  const { activeProfileId } = useProfile();

  if (!session) return <></>;

  const loadImages = useCallback(async () => {
    try {
      if (!session?.user?.id) return;

      const images = await supabase.storage
        .from("profile-images")
        .list(activeProfileId);

      if (images.error) {
        console.error("Error loading images:", images.error);
        return;
      }

      const newImages = await Promise.all(
        images.data.map(async (item) => {
          const { data } = await supabase.storage
            .from("profile-images")
            .getPublicUrl(`${activeProfileId}/${item.name}`);

          const order = parseInt(item.name.split(".")[0]);

          return {
            uri: data.publicUrl,
            order: order,
          };
        })
      );

      const sortedImages = newImages.sort((a, b) => a.order - b.order);

      const [inputState, setInputState] = state;
      const newMedia = sortedImages;

      setInputState({
        ...inputState,
        media: newMedia,
      });
    } catch (error) {
      console.error("Image loading error:", error);
    }
  }, [session?.user?.id]);

  const [inputState, setInputState] = state;
  switch (question.type) {
    case "text":
      return (
        <CreationText
          question={question}
          value={inputState.text}
          state={state}
        />
      );
    case "multiSelect":
      return (
        <CreationMultiSelect
          question={question}
          value={inputState.multiSelect}
          state={state}
        />
      );
    case "select":
      return (
        <CreationMultiSelect
          question={question}
          value={inputState.multiSelect}
          state={state}
          isSelect={true}
        />
      );

    case "slider":
      return (
        <CreationSlider
          question={question}
          value={inputState.slider}
          state={state}
        />
      );
    case "date":
      return (
        <CreationDate
          question={question}
          value={inputState.date}
          state={state}
        />
      );
    case "media":
      return (
        <MediaUpload
          onLoad={() => {
            loadImages();
          }}
          onUpload={(image) => {
            uploadImage(session, image);
          }}
          onDelete={(image) => {
            deleteImage(session, image);
          }}
          images={inputState.media as ImageObject[]}
        />
      );
    case "location":
      return (
        <LocationPicker
          showSaveButton={false}
          onLocationChange={(location) => {
            const [inputState, setInputState] = state;
            setInputState({
              ...inputState,
              location: location,
            });
          }}
        />
      );
    default:
      return <View />;
  }
};

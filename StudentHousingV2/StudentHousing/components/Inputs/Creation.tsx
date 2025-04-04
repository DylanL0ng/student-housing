import React, { useCallback } from "react";
import { CreationText } from "./CreationText";
import { CreationMultiSelect } from "./CreationMultiSelect";
import { CreationSlider } from "./CreationSlider";
import { CreationDate } from "./CreationDate";
import MediaUpload, { deleteImage, uploadImage } from "../MediaUpload";
import { Question, ImageObject } from "@/typings";
import { useAuth } from "../AuthProvider";
import supabase from "@/lib/supabase";
import { View } from "tamagui";

interface CreationInputFactoryProps {
  question: Question;
  state: [any, any];
}

export const CreationInputFactory = ({
  question,
  state,
}: CreationInputFactoryProps) => {
  const { session } = useAuth();

  if (!session) return <></>;

  const loadImages = useCallback(async () => {
    try {
      if (!session?.user?.id) return;

      const images = await supabase.storage
        .from("profile-images")
        .list(session.user.id);

      if (images.error) {
        console.error("Error loading images:", images.error);
        return;
      }

      const newImages = await Promise.all(
        images.data.map(async (item) => {
          const { data } = await supabase.storage
            .from("profile-images")
            .getPublicUrl(`${session.user.id}/${item.name}`);

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
          question={question}
          images={inputState.media as ImageObject[]}
        />
      );
    default:
      return <View />;
  }
};

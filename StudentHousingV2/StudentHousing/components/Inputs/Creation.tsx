import React, { useCallback } from "react";
import { View } from "@tamagui/core";
import { CreationText } from "./CreationText";
import { CreationMultiSelect } from "./CreationMultiSelect";
import { CreationSlider } from "./CreationSlider";
import { CreationDate } from "./CreationDate";
import MediaUpload, { deleteImage, uploadImage } from "../MediaUpload";
import { Question, ImageObject } from "@/typings";
import { useAuth } from "../AuthProvider";
import supabase from "@/app/lib/supabase";

interface InputState {
  text: [string, (value: string) => void];
  multiSelect: [string[], (value: string[]) => void];
  slider: [number, (value: number) => void];
  date: [Date, (value: Date) => void];
  media: [ImageObject[], (value: ImageObject[]) => void];
}

interface CreationInputFactoryProps {
  question: Question;
  inputState: InputState;
}

export const CreationInputFactory = ({
  question,
  inputState,
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

      const [media, setMedia] = inputState.media;

      setMedia(sortedImages);
    } catch (error) {
      console.error("Image loading error:", error);
    }
  }, [session?.user?.id]);

  switch (question.type) {
    case "text":
      const [text, setText] = inputState.text;

      return <CreationText question={question} setter={setText} value={text} />;
    case "multiSelect":
      const [multiSelect, setMultiSelect] = inputState.multiSelect;

      return (
        <CreationMultiSelect
          question={question}
          value={multiSelect}
          setter={setMultiSelect}
        />
      );

    case "slider":
      const [slider, setSlider] = inputState.slider;
      return (
        <CreationSlider question={question} value={slider} setter={setSlider} />
      );
    case "date":
      const [date, setDate] = inputState.date;
      return <CreationDate question={question} value={date} setter={setDate} />;
    case "media":
      const [media, setMedia] = inputState.media;

      if (!session) return <></>;

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
          images={media}
        />
      );
    default:
      return <View />;
  }
};

import React, { useCallback, useEffect } from "react";
import { TextField } from "./TextField";
import { MultiSelect } from "./MultiSelect";
import { SliderInput } from "./Slider";
import { DatePicker } from "./DatePicker";
import MediaUpload, {
  deleteImage,
  ImageObject,
  uploadImage,
} from "../MediaUpload";
import { useAuth } from "@/providers/AuthProvider";
import supabase from "@/lib/supabase";
import { View } from "tamagui";
import {
  InputOptions,
  MultiSelectOptions,
  Question,
  SliderOptions,
} from "@/app/(auth)/creation";
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
  const { activeProfileId, globalInterests, getInterestName } = useProfile();

  if (!session) return <></>;

  useEffect(() => {
    console.log("Question:", question);
  }, [question]);

  const loadImages = useCallback(async () => {
    try {
      if (!activeProfileId) return;

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
  }, [activeProfileId]);

  useEffect(() => {
    loadImages();
  }, [activeProfileId]);

  if (question.key === "interests") {
    const [inputState, setInputState] = state;
    return (
      <MultiSelect
        options={globalInterests.map((id) => ({
          id,
          label: getInterestName(id),
        }))}
        value={inputState.multiSelect || []}
        onChange={(value) => {
          setInputState({
            ...inputState,
            multiSelect: value,
          });
        }}
        singleSelect={false}
      />
    );
  }

  const [inputState, setInputState] = state;
  switch (question.type) {
    case "text":
      let textOptions = question.options as InputOptions;
      return (
        <TextField
          value={inputState.text}
          onChange={(value) => {
            setInputState({
              ...inputState,
              text: value,
            });
          }}
          options={{
            placeholder: textOptions?.placeholder || "",
          }}
        />
      );
    case "multiSelect":
      let multiSelectOptions = question.options as MultiSelectOptions[];
      return (
        <MultiSelect
          options={multiSelectOptions}
          onChange={(selected) => {
            setInputState({
              ...inputState,
              multiSelect: selected,
            });
          }}
          value={inputState.multiSelect}
        />
      );
    case "select":
      let selectOptions = question.options.values as MultiSelectOptions[];
      console.log("selectOptions", selectOptions);
      return (
        <MultiSelect
          options={selectOptions}
          onChange={(selected) => {
            setInputState({
              ...inputState,
              select: selected,
            });
          }}
          value={inputState.select}
          singleSelect={true}
        />
      );
    case "slider":
      const sliderOptions = question.options as SliderOptions;
      const { range } = sliderOptions;
      const [min, max, step] = range;
      return (
        <SliderInput
          value={inputState.slider}
          min={min}
          max={max}
          step={step}
          prefix="€"
          onValueChange={(value) => {
            setInputState({
              ...inputState,
              slider: value,
            });
          }}
        />
      );
    case "date":
      return (
        <DatePicker
          value={inputState.date}
          onValueChange={(value) => {
            setInputState({
              ...inputState,
              date: value,
            });
          }}
          showAgeLabel
        />
      );
    case "media":
      return (
        <MediaUpload
          // onLoad={() => {}}
          onUpload={(image) => {
            const [inputState, setInputState] = state;

            const newMedia = [...inputState.media, image];
            setInputState({
              ...inputState,
              media: newMedia,
            });
          }}
          onDelete={(image) => {
            const [inputState, setInputState] = state;
            const newMedia = [...inputState.media].filter(
              (img: ImageObject) => img.uri !== image.uri
            );
            setInputState({
              ...inputState,
              media: newMedia,
            });
          }}
          images={inputState.media as ImageObject[]}
        />
      );
    case "location":
      return (
        <LocationPicker
          showSaveButton={false}
          onLocationChange={(location) => {
            console.log(location);
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

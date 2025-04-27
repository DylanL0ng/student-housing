import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
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
  state: [any, Dispatch<SetStateAction<any>>];
}

export const CreationInputFactory = ({
  question,
  state,
}: CreationInputFactoryProps) => {
  const { session } = useAuth();
  const {
    activeProfileId,
    globalInterests,
    globalAmenities,
    getInterestName,
    getAmenityName,
  } = useProfile();

  const [inputState, setInputState] = state;

  const loadImages = useCallback(async () => {
    if (!activeProfileId || question.type !== "media") return;

    try {
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

      setInputState({
        ...inputState,
        media: sortedImages,
      });
    } catch (error) {
      console.error("Image loading error:", error);
    }
  }, [activeProfileId, question.type, inputState, setInputState]);

  useEffect(() => {
    loadImages();
  }, [activeProfileId, loadImages]);

  if (!session) return <></>;

  if (question.key === "interests") {
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

  if (question.key === "amenities") {
    return (
      <MultiSelect
        options={globalAmenities.map((id) => ({
          id,
          label: getAmenityName(id),
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

  const updateInputState = (field: string, value: any) => {
    setInputState({
      ...inputState,
      [field]: value,
    });
  };

  switch (question.type) {
    case "text": {
      const textOptions = question.options as InputOptions;
      return (
        <TextField
          value={inputState.text}
          onChange={(value) => updateInputState("text", value)}
          options={{
            placeholder: textOptions?.placeholder || "",
          }}
        />
      );
    }

    case "multiSelect": {
      const multiSelectOptions = question.options as MultiSelectOptions[];
      const options = multiSelectOptions;

      return (
        <MultiSelect
          options={options}
          onChange={(selected) => updateInputState("multiSelect", selected)}
          value={inputState.multiSelect}
          singleSelect={false}
        />
      );
    }

    case "select": {
      const selectOptions = question.options.values as MultiSelectOptions[];
      return (
        <MultiSelect
          options={selectOptions}
          onChange={(selected) => updateInputState("select", selected)}
          value={inputState.select}
          singleSelect={true}
        />
      );
    }

    case "slider": {
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
          onValueChange={(value) => updateInputState("slider", value)}
        />
      );
    }

    case "date":
      return (
        <DatePicker
          value={inputState.date}
          onValueChange={(value) => updateInputState("date", value)}
          showAgeLabel
        />
      );

    case "media":
      return (
        <MediaUpload
          onUpload={(image) => {
            const newMedia = [...inputState.media, image];
            updateInputState("media", newMedia);
          }}
          onDelete={(image) => {
            const newMedia = [...inputState.media].filter(
              (img: ImageObject) => img.uri !== image.uri
            );
            updateInputState("media", newMedia);
          }}
          images={inputState.media as ImageObject[]}
        />
      );

    case "location":
      return (
        <LocationPicker
          showSaveButton={false}
          onLocationChange={(location) =>
            updateInputState("location", location)
          }
        />
      );

    default:
      return <View />;
  }
};

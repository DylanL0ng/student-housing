import React, { useCallback, useEffect, useState } from "react";
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
  state: [any, React.Dispatch<React.SetStateAction<any>>];
}

export const CreationInputFactory = ({
  question,
  state,
}: CreationInputFactoryProps) => {
  const { session } = useAuth();
  const { activeProfileId, globalInterests, getInterestName } = useProfile();
  const [inputState, setInputState] = state;
  const [registryOptions, setRegistryOptions] = useState<MultiSelectOptions[]>(
    []
  );

  // Fetch registry options when needed
  useEffect(() => {
    if (question.type === "multiSelect" && question.registry) {
      fetchRegistryOptions(question.registry);
    }
  }, [question.type, question.registry]);

  // Fetch data from registry
  const fetchRegistryOptions = async (registry: string) => {
    try {
      const { data, error } = await supabase.from(registry).select("id, label");

      if (error) {
        console.error("Error fetching registry data:", error);
        return;
      }

      setRegistryOptions(data || []);
    } catch (error) {
      console.error("Registry fetch error:", error);
    }
  };

  // Load images for media type inputs
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

  // Load media on component mount or profile change
  useEffect(() => {
    loadImages();
  }, [activeProfileId, loadImages]);

  if (!session) return <></>;

  // Handle special case for interests
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

  // Update state utility function to avoid repetition
  const updateInputState = (field: string, value: any) => {
    setInputState({
      ...inputState,
      [field]: value,
    });
  };

  // Render the appropriate input component based on question type
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
      const options = question.registry ? registryOptions : multiSelectOptions;

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

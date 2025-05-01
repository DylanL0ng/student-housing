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
import { View, Text, YStack } from "tamagui";
import {
  InputOptions,
  MultiSelectOptions,
  Question,
  SliderOptions,
} from "@/app/(auth)/creation";
import { LocationPicker } from "../LocationPicker";
import { useProfile } from "@/providers/ProfileProvider";
import { validateInput, commonRules, ValidationRule } from "@/utils/validation";

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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

  const getValidationRules = (type: string): ValidationRule[] => {
    switch (type) {
      case "text":
        return [
          commonRules.required("This field is required"),
          commonRules.minLength(1, "Text must be at least 1 character long"),
          commonRules.maxLength(500, "Text must be less than 500 characters"),
        ];
      case "multiSelect":
        return [
          commonRules.required("At least one option must be selected"),
          commonRules.custom(
            (value) => Array.isArray(value) && value.length > 0,
            "At least one option must be selected"
          ),
        ];
      case "select":
        return [commonRules.required("Please select an option")];
      case "slider":
        return [
          commonRules.required("Please select a value"),
          commonRules.min(0, "Value must be greater than or equal to 0"),
        ];
      case "date":
        return [
          commonRules.required("Please select a date"),
          commonRules.age(18, "You must be at least 18 years old"),
        ];
      case "media":
        return [
          commonRules.required("Please upload at least one image"),
          commonRules.custom(
            (value) => Array.isArray(value) && value.length > 0,
            "Please upload at least one image"
          ),
        ];
      case "location":
        return [
          commonRules.required("Please select a location"),
          commonRules.custom(
            (value) => value?.latitude && value?.longitude,
            "Please select a valid location"
          ),
        ];
      default:
        return [];
    }
  };

  const validateAndUpdateState = (field: string, value: any) => {
    const rules = getValidationRules(question.type);
    const result = validateInput(value, rules);
    setValidationErrors(result.errors);

    setInputState({
      ...inputState,
      [field]: value,
    });
  };

  if (!session) return <></>;

  if (question.key === "interests") {
    return (
      <View>
        <MultiSelect
          options={globalInterests.map((id) => ({
            id,
            label: getInterestName(id),
          }))}
          value={inputState.multiSelect || []}
          onChange={(value) => validateAndUpdateState("multiSelect", value)}
          singleSelect={false}
        />
        {validationErrors.length > 0 && (
          <YStack space="$2">
            <Text color="$red10" fontSize="$2">
              {validationErrors[0]}
            </Text>
          </YStack>
        )}
      </View>
    );
  }

  if (question.key === "amenities") {
    return (
      <View>
        <MultiSelect
          options={globalAmenities.map((id) => ({
            id,
            label: getAmenityName(id),
          }))}
          value={inputState.multiSelect || []}
          onChange={(value) => validateAndUpdateState("multiSelect", value)}
          singleSelect={false}
        />
        {validationErrors.length > 0 && (
          <YStack space="$2">
            <Text color="$red10" fontSize="$2">
              {validationErrors[0]}
            </Text>
          </YStack>
        )}
      </View>
    );
  }

  const renderInput = () => {
    switch (question.type) {
      case "text": {
        const textOptions = question.options as InputOptions;
        return (
          <View>
            <TextField
              value={inputState.text}
              onChange={(value) => validateAndUpdateState("text", value)}
              options={{
                placeholder: textOptions?.placeholder || "",
              }}
            />
            {validationErrors.length > 0 && (
              <YStack space="$2">
                <Text color="$red10" fontSize="$2">
                  {validationErrors[0]}
                </Text>
              </YStack>
            )}
          </View>
        );
      }

      case "multiSelect": {
        const multiSelectOptions = question.options as MultiSelectOptions[];
        return (
          <View>
            <MultiSelect
              options={multiSelectOptions}
              onChange={(selected) =>
                validateAndUpdateState("multiSelect", selected)
              }
              value={inputState.multiSelect}
              singleSelect={false}
            />
            {validationErrors.length > 0 && (
              <YStack space="$2">
                <Text color="$red10" fontSize="$2">
                  {validationErrors[0]}
                </Text>
              </YStack>
            )}
          </View>
        );
      }

      case "select": {
        const selectOptions = question.options.values as MultiSelectOptions[];
        return (
          <View>
            <MultiSelect
              options={selectOptions}
              onChange={(selected) =>
                validateAndUpdateState("select", selected)
              }
              value={inputState.select}
              singleSelect={true}
            />
            {validationErrors.length > 0 && (
              <YStack space="$2">
                <Text color="$red10" fontSize="$2">
                  {validationErrors[0]}
                </Text>
              </YStack>
            )}
          </View>
        );
      }

      case "slider": {
        const sliderOptions = question.options as SliderOptions;
        const { range } = sliderOptions;
        const [min, max, step] = range;
        return (
          <View>
            <SliderInput
              value={inputState.slider}
              min={min}
              max={max}
              step={step}
              prefix="€"
              onValueChange={(value) => validateAndUpdateState("slider", value)}
            />
            {validationErrors.length > 0 && (
              <YStack space="$2">
                <Text color="$red10" fontSize="$2">
                  {validationErrors[0]}
                </Text>
              </YStack>
            )}
          </View>
        );
      }

      case "date":
        return (
          <View>
            <DatePicker
              value={inputState.date}
              onValueChange={(value) => validateAndUpdateState("date", value)}
              showAgeLabel
            />
            {validationErrors.length > 0 && (
              <YStack space="$2">
                <Text color="$red10" fontSize="$2">
                  {validationErrors[0]}
                </Text>
              </YStack>
            )}
          </View>
        );

      case "media":
        return (
          <View>
            <MediaUpload
              onUpload={(image) => {
                const newMedia = [...inputState.media, image];
                validateAndUpdateState("media", newMedia);
              }}
              onDelete={(image) => {
                const newMedia = [...inputState.media].filter(
                  (img: ImageObject) => img.uri !== image.uri
                );
                validateAndUpdateState("media", newMedia);
              }}
              images={inputState.media as ImageObject[]}
            />
            {validationErrors.length > 0 && (
              <YStack space="$2">
                <Text color="$red10" fontSize="$2">
                  {validationErrors[0]}
                </Text>
              </YStack>
            )}
          </View>
        );

      case "location":
        return (
          <View>
            <LocationPicker
              showSaveButton={false}
              onLocationChange={(location) =>
                validateAndUpdateState("location", location)
              }
            />
            {validationErrors.length > 0 && (
              <YStack space="$2">
                <Text color="$red10" fontSize="$2">
                  {validationErrors[0]}
                </Text>
              </YStack>
            )}
          </View>
        );

      default:
        return <View />;
    }
  };

  return renderInput();
};

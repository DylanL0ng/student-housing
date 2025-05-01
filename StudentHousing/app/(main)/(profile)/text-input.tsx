import React, { useEffect, useState } from "react";
import { useTheme, View, Button, Label, Text, YStack } from "tamagui";
import { HeaderWithBack } from "../(filters)";
import { useRoute, RouteProp } from "@react-navigation/native";
import supabase from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/providers/ProfileProvider";
import { TextField } from "@/components/Inputs/TextField";
import { commonRules, validateInput } from "@/utils/validation";

type TextInputRouteParams = {
  item: string;
};

type TextInputRouteProp = RouteProp<{ params: TextInputRouteParams }>;

const TextInputScreen = () => {
  const theme = useTheme();
  const { activeProfileId } = useProfile();
  const route = useRoute<TextInputRouteProp>();
  const { item } = route.params;
  const parsedItem = JSON.parse(Array.isArray(item) ? item[0] : item);
  const { type, value } = parsedItem;
  const { label, placeholder, data } = value;
  const [inputValue, setInputValue] = useState(data.value);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputSave = async () => {
    if (validationErrors.length > 0) return;

    await supabase
      .from("profile_information")
      .upsert({
        profile_id: activeProfileId,
        key: type,
        value: {
          data: { value: inputValue },
        },
      })
      .eq("profile_id", activeProfileId)
      .eq("key", type)
      .eq("view", "flatmate");
  };

  const getValidationRules = () => {
    switch (type) {
      case "email":
        return [
          commonRules.required("Email is required"),
          commonRules.email("Please enter a valid email address"),
        ];
      case "phone":
        return [
          commonRules.required("Phone number is required"),
          commonRules.minLength(10, "Phone number must be at least 10 digits"),
          commonRules.maxLength(15, "Phone number must be less than 15 digits"),
        ];
      default:
        return [
          commonRules.required("This field is required"),
          commonRules.minLength(1, "Text must be at least 1 character long"),
          commonRules.maxLength(500, "Text must be less than 500 characters"),
        ];
    }
  };

  return (
    <>
      <HeaderWithBack page={parsedItem.creation.pageLabel} />
      <View flex={1} gap="$4" bg="$background" paddingInline="$4">
        <View>
          <Label>{label}</Label>
          <TextField
            value={inputValue}
            onChange={(value) => {
              setInputValue(value);
              const result = validateInput(value, getValidationRules());
              setValidationErrors(result.errors);
            }}
            options={{
              placeholder,
              validationRules: getValidationRules(),
            }}
          />
        </View>
        <Button
          onPress={handleInputSave}
          opacity={validationErrors.length > 0 ? 0.5 : 1}
          disabled={validationErrors.length > 0}
        >
          Save Input
        </Button>
      </View>
    </>
  );
};

export default TextInputScreen;

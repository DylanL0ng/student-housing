import React, { useEffect, useState } from "react";
import { useTheme, View, Button, Label, Text, YStack } from "tamagui";
import { HeaderWithBack } from "../(filters)";
import { useRoute, RouteProp } from "@react-navigation/native";
import supabase from "@/lib/supabase";
import { useProfile } from "@/providers/ProfileProvider";
import { SliderInput } from "@/components/Inputs/Slider";
import { useNavigation } from "expo-router";
import { validateInput, commonRules } from "@/utils/validation";

type SliderRouteParams = {
  item: string;
};

type SliderRouteProp = RouteProp<{ params: SliderRouteParams }>;

const SliderInputScreen = () => {
  const theme = useTheme();
  const { activeProfileId } = useProfile();
  const route = useRoute<SliderRouteProp>();
  const { item } = route.params;
  const parsedItem = JSON.parse(Array.isArray(item) ? item[0] : item);
  const { type, value, creation } = parsedItem;
  const { title, data } = value;
  const [min, max, step] = creation.options.range;
  const [inputValue, setInputValue] = useState(data.value);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const navigation = useNavigation();

  const handleInputSave = async () => {
    if (validationErrors.length > 0) return;

    await supabase
      .from("profile_information")
      .upsert({
        profile_id: activeProfileId,
        key: type,
        value: {
          ...value,
          data: { value: inputValue },
        },
      })
      .eq("profile_id", activeProfileId)
      .eq("key", type)
      .eq("view", "flatmate");

    navigation.goBack();
  };

  const getValidationRules = () => {
    return [
      commonRules.required("Please select a value"),
      commonRules.min(min, `Value must be at least ${min}`),
      commonRules.max(max, `Value must be at most ${max}`),
    ];
  };

  return (
    <>
      <HeaderWithBack page={parsedItem.creation.pageLabel} />
      <View flex={1} gap="$4" bg="$background" paddingInline="$4">
        <View>
          <Label color="$color">{title}</Label>
          <YStack space="$2">
            <SliderInput
              min={min}
              max={max}
              step={step}
              value={inputValue}
              prefix={parsedItem.creation.options.prefix}
              onValueChange={(value) => {
                setInputValue(value);
                const result = validateInput(value, getValidationRules());
                setValidationErrors(result.errors);
              }}
            />
            {validationErrors.length > 0 && (
              <Text color="$red10" fontSize="$2">
                {validationErrors[0]}
              </Text>
            )}
          </YStack>
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

export default SliderInputScreen;

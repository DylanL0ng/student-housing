import React, { useState, useEffect, useMemo } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { View, YStack, Text, Button } from "tamagui";
import { HeaderWithBack } from "../(filters)";
import { MultiSelect } from "@/components/Inputs/MultiSelect";
import { useProfile } from "@/providers/ProfileProvider";
import Loading from "@/components/Loading";
import supabase from "@/lib/supabase";
import { useViewMode } from "@/providers/ViewModeProvider";
import { validateInput, commonRules } from "@/utils/validation";

type SelectRouteParams = {
  item: string;
};

type SelectRouteProp = RouteProp<{ params: SelectRouteParams }>;

type Option = {
  id: string;
  label: string;
};

export default function SelectScreen() {
  const navigation = useNavigation();
  const route = useRoute<SelectRouteProp>();
  const { activeProfileId, setInterests, setAmenities } = useProfile();
  const { viewMode } = useViewMode();
  const [loading, setLoading] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const parsedItem = useMemo(() => {
    const { item } = route.params;
    if (!item) return null;

    try {
      return JSON.parse(Array.isArray(item) ? item[0] : item);
    } catch (e) {
      console.error("Failed to parse item:", e);
      return null;
    }
  }, [route.params]);

  const { type, value, creation } = parsedItem;

  const title = creation.pageLabel || "Select Options";

  const options = creation?.options?.values || [];
  const isSingleSelect = creation?.options?.singleSelect;

  const formattedOptions = useMemo(() => {
    return options.map((option: Option) => ({
      id: option.id || option,
      label: option.label || option,
    }));
  }, [options]);

  useEffect(() => {
    const dataValue = value?.data?.value;
    if (!dataValue) return;

    const initialValue = Array.isArray(dataValue) ? dataValue : [dataValue];

    if (initialValue.length > 0) {
      setCurrentSelection(
        initialValue.map((item) => {
          if (item.id) {
            return item.id;
          }
          return item;
        })
      );
    }
  }, [parsedItem]);

  const handleSelectionChange = (newSelection: string[]) => {
    setCurrentSelection(newSelection);

    // Validate selection
    const rules = [
      commonRules.required("Please select at least one option"),
      commonRules.custom(
        (value) => Array.isArray(value) && value.length > 0,
        "Please select at least one option"
      ),
    ];

    const result = validateInput(newSelection, rules);
    setValidationErrors(result.errors);
  };

  const saveSelection = async () => {
    if (validationErrors.length > 0) return;

    if (!activeProfileId || !type) {
      console.error("User session or database key not available.");
      return;
    }

    setLoading(true);
    try {
      if (type === "interests") {
        setInterests(currentSelection);
      } else if (type === "amenities") {
        setAmenities(currentSelection);
      } else {
        const selectedOptions = formattedOptions.filter((option: Option) =>
          currentSelection.includes(option.id)
        );

        await supabase
          .from("profile_information")
          .upsert({
            profile_id: activeProfileId,
            key: type,
            value: {
              ...value,
              data: {
                value: isSingleSelect ? selectedOptions[0] : selectedOptions,
              },
            },
          })
          .eq("profile_id", activeProfileId)
          .eq("type", viewMode);
      }

      navigation.goBack();
    } catch (error) {
      console.error("Failed to save selection:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!parsedItem) {
    return (
      <>
        <HeaderWithBack page="Error" />
        <View flex={1} space="$4" bg="$background" jc="center" ai="center">
          <Text>Invalid configuration data</Text>
          <Button onPress={() => navigation.goBack()}>Go Back</Button>
        </View>
      </>
    );
  }

  return (
    <>
      <HeaderWithBack page={title} />
      <View flex={1} space="$4" bg="$background">
        {loading ? (
          <Loading title="Saving your selection" />
        ) : (
          <YStack space="$4">
            <Text>
              {currentSelection.length} item
              {currentSelection.length !== 1 ? "s" : ""} selected
            </Text>
            <MultiSelect
              options={formattedOptions}
              value={currentSelection}
              onChange={handleSelectionChange}
              singleSelect={isSingleSelect}
            />
            {validationErrors.length > 0 && (
              <Text color="$red10" fontSize="$2">
                {validationErrors[0]}
              </Text>
            )}
            <Button
              onPress={saveSelection}
              opacity={validationErrors.length > 0 ? 0.5 : 1}
              disabled={validationErrors.length > 0}
            >
              Save
            </Button>
          </YStack>
        )}
      </View>
    </>
  );
}

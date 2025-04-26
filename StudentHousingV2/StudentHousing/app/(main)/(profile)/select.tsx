import React, { useState, useEffect, useMemo } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { View, YStack, Text, Button } from "tamagui";
import { HeaderWithBack } from "../(filters)";
import { MultiSelect } from "@/components/Inputs/MultiSelect";
import { useProfile } from "@/providers/ProfileProvider";
import Loading from "@/components/Loading";
import supabase from "@/lib/supabase";
import { useViewMode } from "@/providers/ViewModeProvider";

export default function SelectScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { activeProfileId, setInterests, setAmenities } = useProfile();
  const { viewMode } = useViewMode();
  const [loading, setLoading] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<string[]>([]);

  // Parse incoming data safely using useMemo
  const parsedItem = useMemo(() => {
    const { item } = route.params || {};
    if (!item) return null;

    try {
      return JSON.parse(Array.isArray(item) ? item[0] : item);
    } catch (e) {
      console.error("Failed to parse item:", e);
      return null;
    }
  }, [route.params]);

  const { type, value, creation } = parsedItem;
  console.log("parsedItem", parsedItem);

  const title = value?.title || "Select Options";

  const options = creation?.options?.values || [];
  const isSingleSelect = creation?.options?.singleSelect;

  const formattedOptions = useMemo(() => {
    return options.map((option) => ({
      id: option.id || option,
      label: option.label || option,
    }));
  }, [options]);

  // Initialize selection on mount with proper dependencies
  useEffect(() => {
    const dataValue = value?.data?.value;
    if (!dataValue) return;

    const initialValue = Array.isArray(dataValue) ? dataValue : [dataValue];

    console.log("Initial value:", value.data.value);
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

  // Handle saving selection
  const saveSelection = async () => {
    if (!activeProfileId || !type) {
      console.error("User session or database key not available.");
      return;
    }

    setLoading(true);
    try {
      if (type === "interests") {
        setInterests(currentSelection);
      } else if (type === "amenities") {
        console.log(currentSelection);
        setAmenities(currentSelection);
      } else {
        const selectedOptions = formattedOptions.filter((option) =>
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
        <View
          flex={1}
          padding="$4"
          backgroundColor="$background"
          justifyContent="center"
          alignItems="center"
        >
          <Text>Invalid configuration data</Text>
          <Button onPress={() => navigation.goBack()} marginTop="$4">
            Go Back
          </Button>
        </View>
      </>
    );
  }

  return (
    <>
      <HeaderWithBack page={title} />
      <View flex={1} padding="$4" backgroundColor="$background">
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
              onChange={setCurrentSelection}
              singleSelect={isSingleSelect}
            />
            <Button onPress={saveSelection}>Save</Button>
          </YStack>
        )}
      </View>
    </>
  );
}

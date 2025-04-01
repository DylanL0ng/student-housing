import { Text } from "@tamagui/core";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { YStack } from "@tamagui/stacks";
import { ListItem } from "@tamagui/list-item";
import { Checkbox } from "@tamagui/checkbox";

import { Check as CheckIcon } from "@tamagui/lucide-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Filter } from "@/typings";

const MultiSelect = () => {
  const { item } = useLocalSearchParams();
  if (!item) return null;
  const filter = JSON.parse(Array.isArray(item) ? item[0] : item) as Filter;
  useEffect(() => {
    const fetchData = async () => {
      const data = await AsyncStorage.getItem("filters");
      const parsedData: { [key: string]: any } = data ? JSON.parse(data) : {};

      if (parsedData) {
        setSelectedItems(parsedData[filter.filter_key]);
      }
    };

    // fetchData();
  }, []);

  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: boolean;
  }>({});

  const handleCheckboxChange = async (itemLabel: string, checked: boolean) => {
    const newSelectedItems = { ...selectedItems, [itemLabel]: checked };
    setSelectedItems(newSelectedItems);

    const data = await AsyncStorage.getItem("filters");
    const parsedData: { [key: string]: any } = data ? JSON.parse(data) : {};
    parsedData[filter.filter_key] = newSelectedItems;

    AsyncStorage.setItem("filters", JSON.stringify(parsedData));
  };

  const RenderCheckbox = (itemLabel: string) => {
    return (
      <Checkbox
        size="$4"
        onCheckedChange={(checked: boolean) =>
          handleCheckboxChange(itemLabel, checked)
        }
        checked={selectedItems[itemLabel] || false}
      >
        <Checkbox.Indicator>
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox>
    );
  };

  return (
    <YStack
      flex={1}
      bg={"$background"}
      paddingInline={"$4"}
      rowGap={"$2"}
      gap={"$2"}
    >
      {Object.entries(filter.options.values).map(([_, item]: any) => (
        <ListItem
          key={item.label}
          onPress={() => handleCheckboxChange(item.label, false)}
          pressTheme
          title={item.label}
          iconAfter={() => RenderCheckbox(item.label)}
        ></ListItem>
      ))}
    </YStack>
  );
};

export default MultiSelect;

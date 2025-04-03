import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";

import { Checkbox, ListItem, useTheme, View, YStack } from "tamagui";
import { Check as CheckIcon } from "@tamagui/lucide-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Filter } from "@/typings";

import { Header } from "@react-navigation/elements/src/Header/Header";
import { Text as HeaderText } from "@react-navigation/elements/src/Text";

import { Button } from "@react-navigation/elements";
import { HeaderWithBack } from ".";

const MultiSelect = () => {
  const { item } = useLocalSearchParams();
  if (!item) return null;

  const filter = JSON.parse(Array.isArray(item) ? item[0] : item) as Filter;
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      const data = await AsyncStorage.getItem("filters");
      const parsedData: { [key: string]: any } = data ? JSON.parse(data) : {};

      if (parsedData) {
        setSelectedItems(parsedData[filter.filter_key]);
      }
    };

    fetchData();
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
    <>
      <HeaderWithBack page={filter.label} />
      <YStack
        flex={1}
        bg={"$background"}
        paddingInline={"$4"}
        paddingBlock={"$4"}
        rowGap={"$2"}
        gap={"$2"}
      >
        {Object.entries(filter.options.values).map(([_, item]: any) => (
          <ListItem
            key={item.label}
            onPress={() =>
              handleCheckboxChange(item.label, !selectedItems[item.label])
            }
            pressTheme
            title={item.label}
            iconAfter={() => RenderCheckbox(item.label)}
          ></ListItem>
        ))}
      </YStack>
    </>
  );
};

export default MultiSelect;

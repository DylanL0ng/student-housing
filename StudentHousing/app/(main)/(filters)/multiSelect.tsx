import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { Button, Checkbox, ListItem, YStack } from "tamagui";
import { Check as CheckIcon } from "@tamagui/lucide-icons";
import { Filter } from "@/typings";
import { HeaderWithBack } from ".";
import { clearFilters, getSavedFilters, saveFilter } from "@/utils/filterUtils";

const MultiSelect: React.FC = () => {
  const { item } = useLocalSearchParams();
  if (!item) return null;

  const filter = JSON.parse(Array.isArray(item) ? item[0] : item) as Filter;
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedFilters = await getSavedFilters();
        const savedValue = savedFilters[filter.filter_key];

        if (savedValue) {
          setSelectedItems(savedValue);
        }
      } catch (error) {
        console.error("Error loading saved filters:", error);
      }
    };

    // clearFilters();
    fetchData();
  }, [filter.filter_key]);

  const handleCheckboxChange = async (itemId: string, checked: boolean) => {
    const newSelectedItems = { ...selectedItems, [itemId]: checked };
    setSelectedItems(newSelectedItems);
  };

  const RenderCheckbox = (itemId: string) => {
    return (
      <Checkbox
        size="$4"
        onCheckedChange={(checked: boolean) =>
          handleCheckboxChange(itemId, checked)
        }
        checked={selectedItems[itemId] || false}
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
        {Object.entries(filter.options.values || {}).map(([_, item]: any) => (
          <ListItem
            key={item.id}
            onPress={() =>
              handleCheckboxChange(item.id, !selectedItems[item.id])
            }
            pressTheme
            title={item.label}
            iconAfter={() => RenderCheckbox(item.id)}
          />
        ))}

        <Button
          pressTheme
          onPress={() => {
            saveFilter(filter.filter_key, selectedItems);
          }}
        >
          {"Save"}
        </Button>
      </YStack>
    </>
  );
};

export default MultiSelect;

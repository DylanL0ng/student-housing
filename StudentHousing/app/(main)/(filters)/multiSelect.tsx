import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { Checkbox, ListItem, YStack } from "tamagui";
import { Check as CheckIcon } from "@tamagui/lucide-icons";
import { Filter } from "@/typings";
import { HeaderWithBack } from ".";
import { getSavedFilters, saveFilter } from "@/utils/filterUtils";

const MultiSelect: React.FC = () => {
  const { item } = useLocalSearchParams();
  if (!item) return null;

  const filter = JSON.parse(Array.isArray(item) ? item[0] : item) as Filter;
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {}
  );
  const isMounted = useRef(true);
  const pendingSave = useRef<Promise<void> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!isMounted.current) return;

      try {
        const savedFilters = await getSavedFilters();
        const savedValue = savedFilters[filter.filter_key];

        if (savedValue && isMounted.current) {
          setSelectedItems(savedValue);
        }
      } catch (error) {
        console.error("Error loading saved filters:", error);
      }
    };

    fetchData();
  }, [filter.filter_key]);

  const handleCheckboxChange = async (itemLabel: string, checked: boolean) => {
    if (!isMounted.current) return;

    const newSelectedItems = { ...selectedItems, [itemLabel]: checked };
    setSelectedItems(newSelectedItems);

    // If there's a pending save, wait for it to complete
    if (pendingSave.current) {
      await pendingSave.current;
    }

    // Create a new save operation
    pendingSave.current = saveFilter(filter.filter_key, newSelectedItems);
    await pendingSave.current;
    pendingSave.current = null;
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
        {Object.entries(filter.options.values || {}).map(([_, item]: any) => (
          <ListItem
            key={item.label}
            onPress={() =>
              handleCheckboxChange(item.label, !selectedItems[item.label])
            }
            pressTheme
            title={item.label}
            iconAfter={() => RenderCheckbox(item.label)}
          />
        ))}
      </YStack>
    </>
  );
};

export default MultiSelect;

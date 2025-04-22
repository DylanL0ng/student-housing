import { useCallback, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Button, ButtonProps } from "tamagui";

type Option = {
  id: string;
  label: string;
};

type MultiSelectProps = {
  options: Option[];
  value: string[];
  onChange: (selectedIds: string[]) => void;
  singleSelect?: boolean;
};

export const MultiSelect = ({
  options,
  value,
  onChange,
  singleSelect = false,
}: MultiSelectProps) => {
  console.log(options, value, singleSelect);
  const handleSelect = useCallback(
    (id: string) => {
      let newSelection: string[];

      if (singleSelect) {
        // Single select behavior - toggle the selected item
        newSelection = value.includes(id) ? [] : [id];
      } else {
        // Multi-select behavior - add/remove the item
        console.log("value", value);
        newSelection = value.includes(id)
          ? value.filter((i) => i !== id)
          : [...value, id];

        console.log("newSelection", newSelection);
      }

      onChange(newSelection);
    },
    [value, singleSelect, onChange]
  );

  return (
    <ScrollView
      contentContainerStyle={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          maxHeight: 500,
        },
      ]}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    >
      {options.map((option) => (
        <Button
          key={option.id}
          onPress={() => handleSelect(option.id)}
          variant={value.includes(option.id) ? undefined : "outlined"}
        >
          {option.label}
        </Button>
      ))}
    </ScrollView>
  );
};

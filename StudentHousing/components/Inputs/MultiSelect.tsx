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
  const [optionsState, setOptionsState] = useState<Option[]>(options);

  useEffect(() => {
    setOptionsState(options);
  }, [options]);

  const handleSelect = useCallback(
    (id: string) => {
      let newSelection: string[];

      // if singleSelect is true, only one option can be selected at a time
      // if the selected option is already in the value array, remove it

      // if the selected option is not in the value array, add it
      // if the selected option is already in the value array, remove it
      if (singleSelect) {
        newSelection = value.includes(id) ? [] : [id];
      } else {
        newSelection = value.includes(id)
          ? value.filter((i) => i !== id)
          : [...value, id];
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
      {optionsState &&
        optionsState.map((option) => (
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

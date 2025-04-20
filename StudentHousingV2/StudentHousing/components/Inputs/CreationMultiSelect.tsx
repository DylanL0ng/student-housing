import { useCallback, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { CreationInputProps, Interest } from "@/typings";
import { Button } from "tamagui";
import { useProfile } from "@/providers/ProfileProvider";

type Option = {
  id: string;
  label: string;
};

export const CreationMultiSelect = ({
  question,
  value,
  state,
  isSelect,
}: CreationInputProps) => {
  const { globalInterests, getInterestName } = useProfile();
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    if (question.key === "interests") {
      // Handle interests case
      const interests = globalInterests.map((interest) => ({
        id: interest,
        label: getInterestName(interest),
      }));
      setOptions(interests);
    } else if (question.options?.values) {
      // Handle universal options case
      const formattedOptions = question.options.values.map((option) => {
        if (typeof option === "string") {
          return { id: option, label: option };
        }
        return {
          id: option.id,
          label: option.label || option.interest || option.id,
        };
      });
      setOptions(formattedOptions);
    }
  }, [question.key, question.options?.values, globalInterests]);

  const [inputState, setInputState] = state;
  const selectOption = useCallback(
    (id: string) => {
      let newSelectedOptions;

      if (isSelect) {
        // Single select behavior
        newSelectedOptions = value.includes(id) ? [] : [id];
      } else {
        // Multi-select behavior
        newSelectedOptions = value.includes(id)
          ? value.filter((i: string) => i !== id)
          : [...value, id];
      }

      setSelectedOptions(newSelectedOptions);
      console.log(question.type);
      setInputState({
        ...inputState,
        [question.type]: newSelectedOptions,
      });
    },
    [value, isSelect, inputState, question.type, setInputState]
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        maxHeight: 500,
      }}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    >
      {options.map((option, index) => (
        <Button
          key={`${option.id}-${index}`}
          onPress={() => selectOption(option.id)}
          variant={selectedOptions.includes(option.id) ? undefined : "outlined"}
        >
          {option.label}
        </Button>
      ))}
    </ScrollView>
  );
};

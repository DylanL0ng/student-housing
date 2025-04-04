// components/inputs/CreationMultiSelect.tsx
import { useCallback } from "react";
import { ScrollView } from "react-native";
import { CreationInputProps, Interest } from "@/typings";
import { Button } from "tamagui";

export const CreationMultiSelect = ({
  question,
  value,
  state,
}: CreationInputProps) => {
  const [inputState, setInputState] = state;
  const selectOption = useCallback(
    (interest_id: string) => {
      const newSelectedOptions = value.includes(interest_id)
        ? value.filter((i: string) => i !== interest_id)
        : [...value, interest_id];

      const newState = {
        ...inputState,
        [question.type]: newSelectedOptions,
      };
      setInputState(newState);
    },
    [value]
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        maxHeight: 500,
      }}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
    >
      {question.options?.values?.map((interest: Interest, index: number) => (
        <Button
          key={index}
          onPress={() => selectOption(interest.id)}
          variant={value.includes(interest.id) ? undefined : "outlined"}
        >
          {interest.interest}
        </Button>
      ))}
    </ScrollView>
  );
};

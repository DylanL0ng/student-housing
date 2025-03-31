// components/inputs/CreationMultiSelect.tsx
import React, { useCallback } from "react";
import { ScrollView } from "react-native";
import { Button } from "@tamagui/button";

import { CreationInputProps, Interest } from "@/typings";

export const CreationMultiSelect = ({
  question,
  value,
  setter,
}: CreationInputProps) => {
  const selectOption = useCallback(
    (interest_id: string) => {
      const newSelectedOptions = value.includes(interest_id)
        ? value.filter((i: string) => i !== interest_id)
        : [...value, interest_id];

      console.log("newSelectedOptions", newSelectedOptions);
      setter(newSelectedOptions);
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

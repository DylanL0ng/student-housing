import { useEffect, useState } from "react";
import { CreationInputProps } from "@/typings";
import { Input } from "tamagui";

export const CreationText = ({
  question,
  value,
  state,
}: CreationInputProps) => {
  const [inputState, setInputState] = state;
  return (
    <Input
      value={value}
      onChangeText={(data) => {
        const newState = {
          ...inputState,
          text: data,
        };
        setInputState(newState);
      }}
      placeholder={question.options?.placeholder}
      placeholderTextColor="$color"
    />
  );
};

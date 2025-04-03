import { useEffect, useState } from "react";
import { CreationInputProps } from "@/typings";
import { Input } from "tamagui";

export const CreationText = ({
  question,
  value,
  setter,
}: CreationInputProps) => {
  return (
    <Input
      value={value}
      onChangeText={(data) => {
        setter((prev: string) => data);
      }}
      placeholder={question.options?.placeholder}
      placeholderTextColor="$color"
    />
  );
};

// components/inputs/CreationText.tsx
import React, { useEffect, useState } from "react";
import { Input } from "@tamagui/input";
import { CreationInputProps } from "@/typings";

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

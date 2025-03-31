// components/inputs/CreationSlider.tsx
import React, { useEffect, useState } from "react";
import { Slider } from "@tamagui/slider";
import { Text, useTheme, View } from "@tamagui/core";

import { CreationInputProps, Question } from "@/typings";

export const CreationSlider = ({
  question,
  setter,
  value,
}: CreationInputProps) => {
  const [options, setOptions] = useState<{ range: number[] }>({ range: [] });

  useEffect(() => {
    if (
      question &&
      question.options &&
      question.options.range &&
      question.options.value
    ) {
      setter(value);
      console.log("Updated options", question.options);
      setOptions(question.options);
    }
  }, []);

  return (
    <View bg="$background04" borderColor="$borderColor" borderWidth="$1" p="$4">
      <View flexDirection="row" justify="space-between" marginEnd="$4">
        <Text color="$color12" fontSize="$3">
          €{options?.range[0]}
        </Text>
        <Text color="$color" fontSize="$4" fontWeight="bold">
          €{value.toLocaleString()}
        </Text>
        <Text color="$color12" fontSize="$3">
          €{options?.range[1]}
        </Text>
      </View>
      <Slider
        onValueChange={([value]) => {
          setter(value);
        }}
        defaultValue={[question.options?.value]}
        min={options.range[0]}
        max={options?.range[1]}
        step={options.range[2]}
      >
        <Slider.Track>
          <Slider.TrackActive />
        </Slider.Track>
        <Slider.Thumb size="$2" index={0} circular />
      </Slider>
    </View>
  );
};

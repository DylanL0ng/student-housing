import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { XStack, YStack } from "@tamagui/stacks";
import { H2, H4, H6 } from "@tamagui/text";
import { Slider } from "@tamagui/slider";
import { Text } from "@tamagui/core";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FilterSlider = () => {
  const { item } = useLocalSearchParams();
  if (!item) return null;

  const { title, filter, options } = JSON.parse(
    Array.isArray(item) ? item[0] : item
  );
  const { range, default: defaultValue, returnRange } = options;
  const [min, max, step] = range;

  const initialState = returnRange
    ? [defaultValue || min, max]
    : [defaultValue || min];

  const [values, setValues] = useState(initialState);

  const handleValueChange = async (newValues) => {
    setValues(newValues);
  };

  const getDisplayText = () => {
    if (returnRange) {
      return `${title}: ${values[0]} - ${values[1]}`;
    } else {
      return `${title}: ${values[0]}`;
    }
  };

  return (
    <YStack paddingBlock="$4" space="$4">
      <Text fontWeight="bold">{getDisplayText()}</Text>
      <XStack items="center" space="$4">
        <Text>{min}</Text>
        <Slider
          size="$4"
          width={300}
          defaultValue={initialState}
          min={min}
          max={max}
          step={step}
          onValueChange={handleValueChange}
        >
          <Slider.Track>
            <Slider.TrackActive />
          </Slider.Track>
          <Slider.Thumb circular index={0} />
          {returnRange && <Slider.Thumb circular index={1} />}
        </Slider>
        <Text>{max}</Text>
      </XStack>
    </YStack>
  );
};

export default FilterSlider;

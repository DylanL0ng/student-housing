import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Text, Slider, H2, H4, H6, XStack, YStack } from "tamagui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Header } from "@react-navigation/elements/src/Header/Header";
import { Text as HeaderText } from "@react-navigation/elements/src/Text";

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
    if (returnRange) {
      // Ensure max doesn't go below min for range sliders
      if (newValues[1] < newValues[0]) {
        // If the second thumb (max) is trying to go below the first thumb (min),
        // set the max value equal to the min value
        newValues[1] = newValues[0];
      }
    }
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
    <>
    <Header
              title="Filters"
              headerRight={() => {
                return (
                  <HeaderText onPress={() => {
                    router.back();
                  }}>
                    Done
                  </HeaderText>
                )
              }}
              />
    <YStack flex={1} bg={'$background'} paddingBlock="$4" space="$4">
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
          <Slider.Thumb size={"$3"} circular index={0} />
          {returnRange && <Slider.Thumb size={"$3"} circular index={1} />}
        </Slider>
        <Text>{max}</Text>
      </XStack>
    </YStack>
          </>
  );
};

export default FilterSlider;
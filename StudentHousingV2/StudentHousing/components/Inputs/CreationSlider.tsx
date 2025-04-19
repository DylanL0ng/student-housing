import { useEffect, useState } from "react";

import { CreationInputProps, Question } from "@/typings";
import { Slider, Text, View } from "tamagui";

export const CreationSlider = ({
  question,
  state,
  value,
}: CreationInputProps) => {
  const [options, setOptions] = useState<{ range: number[] }>({ range: [] });
  const [inputState, setInputState] = state;
  const [sliderValue, setSliderValue] = useState<number>(
    value || question.options?.value
  );

  useEffect(() => {
    setInputState((prev) => ({
      ...prev,
      slider: value,
    }));
    setSliderValue(value);
    setOptions(question.options);
  }, []);

  return (
    <View
      bg="$background04"
      borderColor="$borderColor"
      borderWidth="$1"
      gap={"$5"}
      paddingBlock="$4"
      paddingInline="$4"
    >
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
          setInputState((prev) => {
            return {
              ...prev,
              slider: value,
            };
          });
        }}
        defaultValue={[sliderValue]}
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

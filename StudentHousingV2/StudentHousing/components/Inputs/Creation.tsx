import React, { useCallback } from "react";
import { Text, ScrollView } from "react-native";
import TailwindColours from "@/constants/TailwindColours";
import { QuestionOption, Interest } from "@/typings";

import { Slider } from "@tamagui/slider";
import { Input } from "@tamagui/input";
import { Button } from "@tamagui/button";
import { useTheme, View } from "@tamagui/core";

interface CreationInputProps {
  question: {
    type: string;
    options?: QuestionOption;
  };
  value: any;
  onValueChange: (value: any) => void;
}

export const CreationText = ({
  question,
  value,
  onValueChange,
}: CreationInputProps) => {
  return (
    <Input
      value={value}
      onChangeText={onValueChange}
      placeholder={question.options?.placeholder}
      placeholderTextColor="$color"
      // placeholderTextColor=""
      // placeholderTextColor={TailwindColours.text.muted}
      // style={{
      //   paddingInline: 16,
      //   color: TailwindColours.text.primary,
      //   backgroundColor: TailwindColours.background.secondary,
      //   borderColor: TailwindColours.background.tertiary,
      //   borderWidth: 2,
      //   height: 48,
      //   borderRadius: 8,
      // }}
    />
  );
};

export const CreationMultiSelect = ({
  question,
  value,
  onValueChange,
}: CreationInputProps) => {
  const selectOption = useCallback(
    (interest_id: string) => {
      const newSelectedOptions = value.includes(interest_id)
        ? value.filter((i: string) => i !== interest_id)
        : [...value, interest_id];
      onValueChange(newSelectedOptions);
    },
    [value, onValueChange]
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

export const CreationSlider = ({
  question = { type: "slider", options: { range: [0, 20000, 1] } },
  value = 0,
  onValueChange = () => {},
}: CreationInputProps) => {
  const [min = 0, max = 20000, step = 1] = question.options?.range || [];
  const theme = useTheme();

  return (
    <View
      bg={"$background04"}
      borderColor={"$borderColor"}
      borderWidth={"$1"}
      // borderradius={"$2"}
      style={{
        // borderWidth: 2,
        // borderRadius: theme.$2,
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: TailwindColours.text.muted,
            fontSize: 14,
          }}
        >
          €{min}
        </Text>
        <Text
          style={{
            color: TailwindColours.text.primary,
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          €{value.toLocaleString()}
        </Text>
        <Text
          style={{
            color: TailwindColours.text.muted,
            fontSize: 14,
          }}
        >
          €{max}
        </Text>
      </View>
      <Slider
        onValueChange={onValueChange}
        defaultValue={[value]}
        max={max}
        step={step}
        min={min}
      >
        <Slider.Track>
          <Slider.TrackActive />
        </Slider.Track>
        <Slider.Thumb size={"$2"} index={0} circular />
      </Slider>
    </View>
  );
};

{
  /* <Slider
        value={value}
        onValueChange={onValueChange}
        maximumValue={max}
        minimumValue={min}
        step={step}
        minimumTrackTintColor={TailwindColours.accent.primary.default}
        maximumTrackTintColor={TailwindColours.background.tertiary}
        thumbStyle={{
          height: 24,
          width: 24,
          backgroundColor: TailwindColours.accent.primary.default,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        trackStyle={{
          height: 8,
          borderRadius: 4,
        }}
      /> */
}

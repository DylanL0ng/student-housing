import React, { useCallback } from "react";
import { Text, View, ScrollView } from "react-native";
import { Input, Slider as RNESlider, Chip, Slider } from "@rneui/themed";
import TailwindColours from "@/constants/TailwindColours";
import { QuestionOption, Interest } from "@/typings";

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
      placeholderTextColor={TailwindColours.text.muted}
      style={{
        paddingInline: 16,
        color: TailwindColours.text.primary,
        backgroundColor: TailwindColours.background.secondary,
        borderColor: TailwindColours.background.tertiary,
        borderWidth: 2,
        height: 48,
        borderRadius: 8,
      }}
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
        <Chip
          key={index}
          title={interest.interest}
          type={value.includes(interest.id) ? "solid" : "outline"}
          onPress={() => selectOption(interest.id)}
        />
      ))}
    </ScrollView>
  );
};

export const CreationSlider = ({
  question,
  value,
  onValueChange,
}: CreationInputProps) => {
  const [min = 0, max = 20000, step = 1] = question.options?.range || [];

  return (
    <View
      style={{
        backgroundColor: TailwindColours.background.secondary,
        borderColor: TailwindColours.background.tertiary,
        borderWidth: 2,
        borderRadius: 8,
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
          ${min}
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
      />
    </View>
  );
};

import { Slider, Text, View } from "tamagui";
import { useState, useEffect } from "react";

type SliderValue = number | [number, number];

interface SliderInputProps {
  min: number;
  max: number;
  step?: number;
  value: SliderValue;
  onValueChange: (value: SliderValue) => void;
  prefix?: string;
  range?: boolean;
}

export const SliderInput = ({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  prefix,
  range = false,
}: SliderInputProps) => {
  const normalizeValue = (val: number): number => {
    let normalized = Math.max(min, Math.min(max, val));
    if (step === 1) {
      return Math.round(normalized);
    }
    const steps = Math.round(normalized / step);
    return parseFloat((steps * step).toFixed(10));
  };

  const initialValue = range
    ? Array.isArray(value)
      ? [normalizeValue(value[0]), normalizeValue(value[1])]
      : [normalizeValue(value), normalizeValue(max)]
    : Array.isArray(value)
    ? normalizeValue(value[0])
    : normalizeValue(value);

  const [localValue, setLocalValue] = useState<SliderValue>(initialValue);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    if (!isSliding) {
      setLocalValue(
        range
          ? Array.isArray(value)
            ? [normalizeValue(value[0]), normalizeValue(value[1])]
            : [normalizeValue(value), normalizeValue(max)]
          : Array.isArray(value)
          ? normalizeValue(value[0])
          : normalizeValue(value)
      );
    }
  }, [value, isSliding, range, max, step, min]);

  const handleValueChange = (values: number[]) => {
    const normalizedValues = values.map(normalizeValue);
    const newValue = range
      ? [normalizedValues[0], normalizedValues[1]]
      : normalizedValues[0];
    setLocalValue(newValue);
  };

  const handleSlideEnd = () => {
    let finalValue: SliderValue;

    if (range && Array.isArray(localValue)) {
      finalValue = [
        normalizeValue(localValue[0]),
        normalizeValue(localValue[1]),
      ];
    } else {
      finalValue = normalizeValue(
        Array.isArray(localValue) ? localValue[0] : localValue
      );
    }

    onValueChange(finalValue);
    setIsSliding(false);
  };

  const formatDisplayValue = (val: number) => {
    if (Number.isInteger(val)) return val.toString();
    return val.toFixed(Math.max(0, Math.log10(1 / (step || 1))));
  };

  const renderValueDisplay = () => {
    if (range && Array.isArray(localValue)) {
      return (
        <Text color="$color" fontSize="$4" fontWeight="bold">
          {prefix}
          {formatDisplayValue(localValue[0])} - {prefix}
          {formatDisplayValue(localValue[1])}
        </Text>
      );
    }
    return (
      <Text color="$color" fontSize="$4" fontWeight="bold">
        {prefix}
        {formatDisplayValue(
          Array.isArray(localValue) ? localValue[0] : localValue
        )}
      </Text>
    );
  };

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
          {prefix}
          {formatDisplayValue(min)}
        </Text>
        {renderValueDisplay()}
        <Text color="$color12" fontSize="$3">
          {prefix}
          {formatDisplayValue(max)}
        </Text>
      </View>
      <Slider
        height={10}
        value={Array.isArray(localValue) ? localValue : [localValue]}
        onSlideStart={() => setIsSliding(true)}
        onValueChange={handleValueChange}
        onSlideEnd={handleSlideEnd}
        min={min}
        max={max}
        step={step}
      >
        <Slider.Track>
          <Slider.TrackActive />
        </Slider.Track>
        <Slider.Thumb size="$2" index={0} circular />
        {range && <Slider.Thumb size="$2" index={1} circular />}
      </Slider>
    </View>
  );
};

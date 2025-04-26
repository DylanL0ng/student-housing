import React, { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Text, View } from "tamagui";
import { calculateAge } from "@/utils/utils";

export interface DatePickerProps {
  value?: Date | undefined;
  onValueChange?: (date: Date) => void;
  showAgeLabel?: boolean;
}

export const DatePicker = ({
  value,
  onValueChange,
  showAgeLabel,
}: DatePickerProps) => {
  const [date, setDate] = useState(value || new Date());
  const [age, setAge] = useState<number | null>(
    value ? calculateAge(value) : null
  );

  useEffect(() => {
    if (!value) value = new Date();
    setDate(value);
    if (showAgeLabel) setAge(calculateAge(value));
  }, [showAgeLabel]);

  return (
    <View>
      {showAgeLabel && (
        <View>
          {age !== null && <Text color="$color">I am {age} years old</Text>}
        </View>
      )}
      <View marginBlock={"auto"}>
        <DateTimePicker
          display="spinner"
          value={date}
          mode="date"
          onChange={(event, selectedDate) => {
            if (!selectedDate) return;
            if (event.type === "set") {
              onValueChange?.(selectedDate);
              if (showAgeLabel) {
                setAge(calculateAge(selectedDate));
              }
            }
          }}
        />
      </View>
    </View>
  );
};

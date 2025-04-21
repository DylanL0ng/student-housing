import React, { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

import { CreationDateProps } from "@/typings";
import { Button, Text, View } from "tamagui";
import { calculateAge } from "@/utils/utils";

export const CreationDate = ({ value, state }: CreationDateProps) => {
  const [inputState, setInputState] = state;

  const [date, setDate] = useState(value || new Date());
  const [age, setAge] = useState<number | null>(
    value ? calculateAge(value) : null
  );

  useEffect(() => {
    if (!value) value = new Date();
    setDate(value);
    setAge(calculateAge(value));
  }, []);

  return (
    <View>
      <View>
        {age !== null && <Text color="$color">I am {age} years old</Text>}
      </View>
      <View marginBlock={"auto"}>
        <DateTimePicker
          display="spinner"
          value={date}
          mode="date"
          onChange={(event, selectedDate) => {
            if (!selectedDate) return;
            if (event.type === "set") {
              setInputState((prev) => ({
                ...prev,
                date: selectedDate,
              }));
              setAge(calculateAge(selectedDate));
            }
          }}
        />
      </View>
    </View>
  );
};

// components/inputs/CreationDate.tsx
import React, { useState } from "react";
import { Button } from "@tamagui/button";
import { Text } from "@tamagui/core";
import DatePicker from "react-native-date-picker";
import { CreationDateProps } from "@/typings";

export const CreationDate = ({ value, setter }: CreationDateProps) => {
  const calculateAge = (date: Date) => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age;
  };

  const [date, setDate] = useState(value || new Date());
  const [open, setOpen] = useState(false);
  const [age, setAge] = useState<number | null>(
    value ? calculateAge(value) : null
  );

  return (
    <>
      {age !== null && <Text color="$color">I am {age} years old</Text>}
      <Button onPress={() => setOpen(true)}>Select date</Button>
      <DatePicker
        modal
        date={date}
        open={open}
        mode="date"
        onConfirm={(date) => {
          setDate(date);
          setOpen(false);
          const newAge = calculateAge(date);
          setAge(newAge);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </>
  );
};

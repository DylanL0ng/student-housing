// components/inputs/CreationDate.tsx
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

// import DatePicker from "react-native-date-picker";
import { CreationDateProps } from "@/typings";
import { Button, Text } from "tamagui";

export const CreationDate = ({ value, state }: CreationDateProps) => {
  const [inputState, setInputState] = state;

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

  const closeDatePicker = () => {
    setOpen(false);
  };
  const openDatePicker = () => {
    setOpen(true);
  };

  return (
    <>
      {age !== null && <Text color="$color">I am {age} years old</Text>}
      <Button onPress={() => openDatePicker}>Select date</Button>
      {open && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || date;
            closeDatePicker();
            setDate(currentDate);
            const newData = {
              ...inputState,
              date: currentDate,
            };
            setInputState(newData);
          }}
        />
      )}

      {/* <DatePicker
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
      /> */}
    </>
  );
};

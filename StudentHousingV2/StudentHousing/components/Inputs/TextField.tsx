import { Input } from "tamagui";

type TextFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options?: {
    placeholder?: string;
  };
};

export const TextField = ({ value, onChange, options }: TextFieldProps) => {
  return (
    <Input
      value={value}
      onChangeText={(data) => {
        onChange(data);
      }}
      placeholder={options?.placeholder || "Enter text"}
      placeholderTextColor="$color"
    />
  );
};

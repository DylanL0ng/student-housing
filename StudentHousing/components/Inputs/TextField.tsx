import { Input, Text, YStack } from "tamagui";
import { validateInput, commonRules, ValidationRule } from "@/utils/validation";
import { useState } from "react";

type TextFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options?: {
    placeholder?: string;
    validationRules?: ValidationRule[];
  };
};

export const TextField = ({ value, onChange, options }: TextFieldProps) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleChange = (text: string) => {
    onChange(text);

    if (options?.validationRules) {
      const result = validateInput(text, options.validationRules);
      setValidationErrors(result.errors);
    }
  };

  return (
    <YStack space="$2">
      <Input
        value={value}
        onChangeText={handleChange}
        placeholder={options?.placeholder || "Enter text"}
        placeholderTextColor="$color"
      />
      {validationErrors.length > 0 && (
        <Text color="$red10" fontSize="$2">
          {validationErrors[0]}
        </Text>
      )}
    </YStack>
  );
};

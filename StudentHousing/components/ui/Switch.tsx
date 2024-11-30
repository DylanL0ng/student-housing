import React, { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";

type Option<T> = {
  state: T;
  icon: {
    component: React.ComponentType<{ name: string; size: number }>;
    icon: string;
  };
};
interface SwitchProps<T> {
  options: Option<T>[];
  onStateChange?: (newState: T) => void;
}

const Switch = <T extends string | number>({
  options,
  onStateChange,
}: SwitchProps<T>) => {
  const [active, setActive] = useState<T>(options[0].state);

  const handlePress = () => {
    const currentIndex = options.findIndex((option) => option.state === active);
    const nextIndex = (currentIndex + 1) % options.length;
    const nextState = options[nextIndex].state;
    setActive(nextState);
    if (onStateChange) {
      onStateChange(nextState);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1.0}>
      <View className="border rounded-full overflow-hidden border-slate-100 bg-slate-300 px-4 gap-6 flex flex-row justify-between relative">
        <View
          className={`absolute w-14 inset-y-1 bg-slate-400 rounded-full ${
            active === options[0].state ? "left-1" : "right-1"
          }`}
        ></View>

        {options.map((option, index) => (
          <View key={index} className="py-2">
            <Text
              className={`${
                active === option.state ? "text-slate-700" : "text-slate-500"
              }`}
            >
              <option.icon.component name={option.icon.icon} size={24} />
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export default Switch;

import React, { useState } from "react";
import { StyleSheet } from "react-native";
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
      <View style={styles.container}>
        <View
          style={{
            ...styles.circle,
            ...styles[active === options[0].state ? "left" : "right"],
          }}
        ></View>

        {options.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            <Text
              style={
                styles[
                  active === option.state
                    ? "optionTextEnabled"
                    : "optionTextDisabled"
                ]
              }
            >
              <option.icon.component name={option.icon.icon} size={24} />
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    paddingBlock: 2,
  },
  optionTextDisabled: {
    color: "#64748b",
  },
  optionTextEnabled: {
    color: "#334155",
  },
  container: {
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    backgroundColor: "#cbd5e1",
    paddingHorizontal: 4,
    gap: 6,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
  },
  circle: {
    borderRadius: "100%",
    overflow: "hidden",
    position: "absolute",
    insetBlock: 4,
    backgroundColor: "#94a3b8",
  },
  left: {
    left: 1,
  },
  right: {
    right: 1,
  },
});

export default Switch;

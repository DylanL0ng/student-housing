import React from "react";
import { View } from "react-native";

// Ensure T extends an object to allow spreading as props
interface Props<T extends Record<string, unknown>> {
  Card: React.ComponentType<T>; // Accepts a component with props of type T
  data: T[]; // Array of T objects
}

export default function SwipeHandler<T extends Record<string, unknown>>({
  Card,
  data,
}: Props<T>) {
  return (
    <View className="flex-1">
      {/* Ensure there's at least one item in the array */}
      {data.length > 0 && <Card {...data[0]} />}
    </View>
  );
}

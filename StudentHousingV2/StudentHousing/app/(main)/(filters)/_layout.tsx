import { Stack } from "expo-router";

const FilterLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="multiSelect" options={{ headerShown: false }} />
      <Stack.Screen name="slider" options={{ headerShown: false }} />
    </Stack>
  );
};
export default FilterLayout;

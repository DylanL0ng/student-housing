import { Stack } from "expo-router";
import { useTheme } from "tamagui";

const ModalLayout = () => {
  const theme = useTheme();
  return (
    <Stack>
      <Stack.Screen
        name="message_thread"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="profile"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="settings"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
};
export default ModalLayout;

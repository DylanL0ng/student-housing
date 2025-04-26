import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
  const { session } = useAuth();
  if (!session) return <Redirect href={"/(auth)/login"}></Redirect>;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      <Stack.Screen
        name="(modals)"
        options={{ presentation: "containedModal", headerShown: false }}
      />
      <Stack.Screen
        name="(filters)"
        options={{ presentation: "containedModal", headerShown: false }}
      />
      <Stack.Screen
        name="(profile)"
        options={{ presentation: "containedModal", headerShown: false }}
      />
    </Stack>
  );
}

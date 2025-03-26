import { Stack, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect } from "react";
import { ThemeProvider } from "@rneui/themed";
import theme from "@/constants/Theme";
import supabase from "../lib/supabase";

const RootLayout = () => {
  const navigation = useNavigation();
  const router = useRouter();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        return router.replace("/auth/login");
      } else {
        return router.replace("/auth/creation");
      }
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="creation" />
      </Stack>
    </ThemeProvider>
  );
};

export default RootLayout;

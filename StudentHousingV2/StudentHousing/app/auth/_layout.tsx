import { Stack, useNavigation } from "expo-router";
import React, { useLayoutEffect } from "react";
import { ThemeProvider } from "@rneui/themed";
import theme from "@/constants/Theme";

const RootLayout = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

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

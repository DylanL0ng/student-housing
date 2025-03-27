import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
// import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import Header from "@/components/Header";
import { Text } from "react-native";
import supabase from "./lib/supabase";

import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { AuthProvider } from "@/components/AuthProvider";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// you usually export this from a tamagui.config.ts file
// defaultConfig.themes.dark
const config = createTamagui(defaultConfig);

type Conf = typeof config;

// make imports typed
declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf {}
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <TamaguiProvider config={config} defaultTheme="dark">
        <Stack
          screenOptions={{
            header: ({ route, options }) => {
              return <Header page={options.title || route.name} />;
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
          <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </TamaguiProvider>
    </AuthProvider>
  );
}

{
  /* <Stack
screenOptions={{
  header: ({ route, options }) => {
    return <Header page={options.title || route.name} />;
  },
}}
>
<Stack.Screen
  name="(tabs)"
  options={{
    headerShown: true,
  }}
/>
<Stack.Screen name="+not-found" />
</Stack>
</Provider> */
}

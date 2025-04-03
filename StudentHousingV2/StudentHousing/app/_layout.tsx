import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import supabase from "@/lib/supabase";

import * as Location from "expo-location";

import { defaultConfig } from '@tamagui/config/v4'


import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { Session } from "@supabase/supabase-js";
import { createTamagui, TamaguiProvider, Text } from "tamagui";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();



// you usually export this from a tamagui.config.ts file
const config = createTamagui(defaultConfig)

type Conf = typeof config

// make imports typed
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setSession(null);
        } else setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <></>;
  }

  return (
    <AuthProvider>
      <TamaguiProvider config={config} defaultTheme="dark">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{headerShown: false}} />
          <Stack.Screen name="(main)" options={{headerShown: false}} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </TamaguiProvider>
    </AuthProvider>
  );
}

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
import "react-native-get-random-values";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

import { useColorScheme } from "@/hooks/useColorScheme";
import supabase from "@/lib/supabase";

import * as Location from "expo-location";

import { defaultConfig } from "@tamagui/config/v4";

import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { Session } from "@supabase/supabase-js";
import { createTamagui, TamaguiProvider, Text, useTheme } from "tamagui";
import { ModeProvider } from "@/providers/ViewModeProvider";
import { ProfileProvider } from "@/providers/ProfileProvider";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// you usually export this from a tamagui.config.ts file
const config = createTamagui(defaultConfig);

type Conf = typeof config;

// make imports typed
declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: "black",
        borderLeftColor: "#4ade80", // green
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
      }}
      text2Style={{
        color: "#d4d4d4",
        fontSize: 14,
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        backgroundColor: "#1e1e1e",
        borderLeftColor: "#f87171", // red
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
      }}
      text2Style={{
        color: "#d4d4d4",
        fontSize: 14,
      }}
    />
  ),
  // You can do the same for info or custom
};

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
        <ModeProvider>
          <ProfileProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(main)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ProfileProvider>
        </ModeProvider>
        <Toast swipeable={true} config={toastConfig} topOffset={100} />
        <StatusBar style="auto" />
      </TamaguiProvider>
    </AuthProvider>
  );
}

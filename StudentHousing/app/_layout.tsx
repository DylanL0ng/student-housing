import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-get-random-values";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

import { useColorScheme } from "@/hooks/useColorScheme";
import supabase from "@/lib/supabase";

import { defaultConfig } from "@tamagui/config/v4";

import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { Session } from "@supabase/supabase-js";
import { createTamagui, TamaguiProvider, Text, useTheme } from "tamagui";
import { ModeProvider } from "@/providers/ViewModeProvider";
import { ProfileProvider } from "@/providers/ProfileProvider";

SplashScreen.preventAutoHideAsync();

const config = createTamagui(defaultConfig);

type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

export default function RootLayout() {
  const [_, setSession] = useState<Session | null>(null);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    })();

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
        <Toast swipeable={true} topOffset={100} />
        <StatusBar style="auto" />
      </TamaguiProvider>
    </AuthProvider>
  );
}

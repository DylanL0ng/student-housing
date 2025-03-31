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
import Header from "@/components/Header";
import { Text } from "react-native";
import supabase from "./lib/supabase";

import * as Location from "expo-location";

import { TamaguiProvider, createTamagui, useTheme } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { Session } from "@supabase/supabase-js";

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
  const [session, setSession] = useState<Session | null>(null);
  const colorScheme = useColorScheme();
  // const theme = useTheme();
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

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error(
        "Permission to access location was denied. Please enable location permissions in your device settings."
      );
      return;
    }
  };

  const handleMountOperations = async () => {
    await requestPermissions();

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 100,
      },
      async (location) => {
        const { latitude, longitude } = location.coords;

        const geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        let city = "unknown";
        let country = "unknown";
        if (geocode.length > 0) {
          const { city: _city, country: _country } = geocode[0];
          if (_city) city = _city;
          if (_country) country = _country;
        }

        const { data, error } = await supabase
          .from("profile_locations")
          .upsert({
            point: `POINT(${latitude} ${longitude})`,
            city: city,
            id: session?.user.id,
          });
      }
    );

    return () => {
      subscription.remove();
    };
  };

  useEffect(() => {
    if (!session) return;
    handleMountOperations();
  }, [session]);

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
            headerStyle: {
              backgroundColor: "hsla(0, 0%, 100%, 0.1)",
            },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </TamaguiProvider>
    </AuthProvider>
  );
}

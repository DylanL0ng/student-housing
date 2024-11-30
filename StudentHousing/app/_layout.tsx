import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppState, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Auth from "@/components/Auth";
import { Session } from "@supabase/supabase-js";
import Header from "@/components/ui/Header";
import AuthProvider from "./auth_provider";

// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <GluestackUIProvider mode="light">
      {session && session.user ? (
        <AuthProvider>
          <Stack
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
            <Stack.Screen
              name="message_thread"
              options={{
                presentation: "modal",
              }}
            />
          </Stack>
        </AuthProvider>
      ) : (
        <Auth />
      )}
    </GluestackUIProvider>
  );
}

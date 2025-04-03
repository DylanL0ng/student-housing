import { router, Stack, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { useAuth } from "@/components/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "tamagui";
import supabase from "@/lib/supabase";

const RootLayout = () => {
  const { session } = useAuth();

  const handleSession = async (session: Session | null) => {
    if (!session) return;

    const { data, error } = await supabase
      .from("profiles")
      .select('created')
      .eq("id", session.user.id).single();

    if (error) {
      supabase.auth.signOut();
      return router.replace("/login");
    }

    if (!data) {
      return router.replace("/login");
    }

    console.log(data.created)
    if (data.created) return router.replace("/(main)/(tabs)");

    return router.replace("/creation");
  };

  useEffect(() => {
    handleSession(session);
  }, [session]);

  const theme = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.val }}>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="login" />
        <Stack.Screen name="creation" />
      </Stack>
    </SafeAreaView>
  );
};

export default RootLayout;

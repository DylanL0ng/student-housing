import { router, Stack, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { useAuth } from "@/providers/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "tamagui";
import supabase from "@/lib/supabase";
import generateFakeUsers from "@/scripts/generateFakeUsers";
import { useViewMode } from "@/providers/ViewModeProvider";

const RootLayout = () => {
  const { session } = useAuth();
  const { viewMode } = useViewMode();

  const handleSession = async (session: Session | null) => {
    if (!session) return;

    const { data, error } = await supabase
      .from("profile_mapping")
      .select("created")
      .eq("linked_profile", session.user.id)
      .eq("type", viewMode)
      .single();

    if (error || !data) {
      supabase.auth.signOut();
      return router.replace("/login");
    }

    if (data.created) return router.replace("/(main)/(tabs)");

    return router.replace("/creation");
  };

  useEffect(() => {
    // generateFakeUsers(1);
    handleSession(session);
  }, [session]);

  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.val }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="creation" />
      </Stack>
    </SafeAreaView>
  );
};

export default RootLayout;

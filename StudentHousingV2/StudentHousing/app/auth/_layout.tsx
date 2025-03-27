import { router, Stack, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect } from "react";
import supabase from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useAuth } from "@/components/AuthProvider";

const RootLayout = () => {
  const navigation = useNavigation();
  const { session } = useAuth();
  // const router = useRouter();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleSession = async (session: Session | null) => {
    if (!session) return;

    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq("id", session.user.id);

    if (error) {
      supabase.auth.signOut();
      return router.replace("/auth/login");
    }

    if (data.length === 0) {
      return router.replace("/auth/creation");
    }

    if (data[0].created) return router.replace("/(tabs)");

    return router.replace("/auth/creation");
  };

  useEffect(() => {
    handleSession(session);
  }, [session]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="creation" />
    </Stack>
  );
};

export default RootLayout;

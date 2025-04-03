import { router } from "expo-router";
import React, { useEffect } from "react";
import supabase from "@/lib/supabase";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import generateFakeUsers from "@/scripts/generateFakeUsers";

const Routing = () => {
  const { session, loading } = useAuth();

  // useEffect(() => {
  //   generateFakeUsers(10);
  // }, []);

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.replace("/(main)/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [session, loading]);

  return <></>;
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <Routing />
    </AuthProvider>
  );
};

export default RootLayout;

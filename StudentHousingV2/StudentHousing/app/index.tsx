import { router } from "expo-router";
import React, { useEffect } from "react";
import supabase from "@/lib/supabase";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import generateFakeUsers from "@/scripts/generateFakeUsers";

const Routing = () => {
  const { session, loading } = useAuth();

  // useEffect(() => {
  //   generateFakeUsers(10);
  // }, []);

  useEffect(() => {
    if (!loading) {
      router.replace("/(auth)/login");
      // if (session) {
      // router.replace("/(main)/(tabs)");
      // } else {
      // }
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

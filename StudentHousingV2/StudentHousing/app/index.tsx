import { router } from "expo-router";
import React, { useEffect } from "react";
import supabase from "./lib/supabase";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
// import { useAuth } from "../AuthProvider";

const Routing = () => {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/login");
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

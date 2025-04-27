import { router } from "expo-router";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import generateFakeUsers from "@/scripts/generateFakeUsers";

const Routing = () => {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace("/(auth)/login");
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

import { Redirect, router } from "expo-router";
import React, { useEffect } from "react";
import supabase from "./lib/supabase";

const Index = () => {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        return router.replace("/(tabs)");
      }
    });

    supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        return router.replace("/auth/login");
      } else {
        return router.replace("/(tabs)");
      }
    });
  }, []);

  return <></>;
};

export default Index;

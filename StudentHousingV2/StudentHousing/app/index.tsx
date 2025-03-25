import { Redirect, router } from "expo-router";
import React, { useEffect } from "react";
import supabase from "./lib/supabase";

const Index = () => {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Session got", session);
      if (session) {
        return router.replace("/auth/creation");
      }
    });

    supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        return router.replace("/auth/login");
      }
    });
  }, []);

  return <Redirect href={"/auth/login"} />;
};

export default Index;

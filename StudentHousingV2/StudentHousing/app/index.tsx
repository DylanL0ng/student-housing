import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import supabase from "./lib/supabase";

const Index = () => {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        return <Redirect href={"/(tabs)"} />;
      }
    });
  });
  return <Redirect href={"/(auth)/login"} />;
};

export default Index;

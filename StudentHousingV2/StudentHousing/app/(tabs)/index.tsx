import { Image, StyleSheet, Platform } from "react-native";
import ProfileCard from "@/components/ProfileCard";
import SwipeHandler from "@/components/SwipeHandler";
import { useState } from "react";
import Header from "@/components/Header";
import { User } from "@/typings";
import { Users } from "@/constants/Users";
import supabase from "../lib/supabase";

const requestUpdate = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    const users = Array.from(Object.values(Users));
    resolve(users.splice(3, users.length));
  });
};

export default function HomeScreen() {
  const [users, setUsers] = useState<User[]>(
    Array.from(Object.values(Users)).splice(0, 3)
  );

  const handleRequestUpdate = async () => {
    const newUsers = await requestUpdate();
    return newUsers;
  };

  const handleSwipeRight = () => {};

  const handleSwipeLeft = () => {};

  return (
    <SwipeHandler
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      requestUpdate={handleRequestUpdate}
      data={users.map((user) => ({ profile: user.profile }))} // Map users to objects with profile property
      Card={ProfileCard}
      style={{ marginTop: 16, margin: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});

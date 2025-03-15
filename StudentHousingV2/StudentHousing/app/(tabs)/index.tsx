import { Image, StyleSheet, Platform } from "react-native";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ProfileCard from "@/components/ProfileCard";
import SwipeHandler from "@/components/SwipeHandler";
import { useState } from "react";

interface User {
  id: string;
  full_name: string;
  date_of_birth: string;
  location: string;
  interests: string[];
}

const initialUsers: User[] = [
  {
    id: "1",
    full_name: "Alice",
    date_of_birth: "1982/31/08",
    location: "Dublin",
    interests: ["music", "sports", "art"],
  },
  {
    id: "2",
    full_name: "Bob",
    date_of_birth: "1982/31/08",
    location: "Dublin",
    interests: ["music", "sports", "art"],
  },
  {
    id: "3",
    full_name: "Charlie",
    date_of_birth: "1982/31/08",
    location: "Dublin",
    interests: ["music", "sports", "art"],
  },
];

const requestUpdate = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    const newUsers = [
      {
        id: "4",
        full_name: "Dylan",
        date_of_birth: "1982/31/08",
        location: "Dublin",
        interests: ["music", "sports", "art"],
      },
      {
        id: "5",
        full_name: "Eve",
        date_of_birth: "1982/31/08",
        location: "Dublin",
        interests: ["music", "sports", "art"],
      },
      {
        id: "6",
        full_name: "Frank",
        date_of_birth: "1982/31/08",
        location: "Dublin",
        interests: ["music", "sports", "art"],
      },
    ];
    resolve(newUsers);
  });
};

export default function HomeScreen() {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const handleRequestUpdate = async () => {
    const newUsers = await requestUpdate();
    return newUsers;
  };

  const handleSwipeRight = () => {
    console.log("Swiped right");
  };

  const handleSwipeLeft = () => {
    console.log("Swiped left");
  };

  return (
    <SwipeHandler
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      requestUpdate={handleRequestUpdate}
      data={users} // Pass the users state as data
      Card={ProfileCard}
      style={{ marginTop: 32, margin: 16 }}
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

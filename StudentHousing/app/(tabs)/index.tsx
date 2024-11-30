import Header from "@/components/ui/Header";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import ProfileCard from "@/components/ui/ProfileCard";

import { Swiper, type SwiperCardRefType } from "rn-swiper-list";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthContext, StorageContext } from "../auth_provider";

interface User {
  id: string;
  full_name: string;
  date_of_birth: string;
  location: string;
  interests: string[];
}

export default function DiscoverScreen() {
  const auth = useContext(AuthContext);
  const storage = useContext(StorageContext);

  const [updateCount, setUpdateCount] = useState(0);
  const [usersToMatch, setUsersToMatch] = useState<User[]>([]);

  useEffect(() => {
    if (!auth?.session) return;
    if (!auth.interests) return;
    if (!storage?.interests) return;
    getUsersToMatch();
  }, [auth?.session, storage?.interests, auth?.interests]);

  const cosineSimilarity = (vectorA: number[], vectorB: number[]): number => {
    const dotProduct = vectorA.reduce(
      (sum, value, index) => sum + value * vectorB[index],
      0
    );
    const magnitudeA = Math.sqrt(
      vectorA.reduce((sum, value) => sum + value * value, 0)
    );
    const magnitudeB = Math.sqrt(
      vectorB.reduce((sum, value) => sum + value * value, 0)
    );
    return dotProduct / (magnitudeA * magnitudeB);
  };

  const calculateUsersSimilarities = (users: User[]): User[] => {
    if (!storage?.interests || !auth?.interests) return [];

    const global_interests = Object.keys(storage.interests).sort();

    const personal_interest_vector = global_interests.map((interest) =>
      auth.interests.includes(interest) ? 1 : 0
    );

    const matchedSimilarities = users.map((user) => {
      const interest_vector = global_interests.map((interest) =>
        user.interests.includes(interest) ? 1 : 0
      );

      const similarity = cosineSimilarity(
        personal_interest_vector,
        interest_vector
      );

      return { similarity: similarity || 0.0, user };
    });

    matchedSimilarities.sort((a, b) => b.similarity - a.similarity);

    return matchedSimilarities.map((match) => match.user);
  };

  const getUsersToMatch = async () => {
    try {
      if (!auth?.session?.user) throw new Error("No user session found!");
      const { data, error, status } = await supabase
        .from("profiles")
        .select(
          `user_id, full_name, date_of_birth, location, user_interests (interest_id)`
        )
        .neq("user_id", auth.session.user.id);

      if (error && status !== 406) throw error;

      const newUsers: User[] =
        data?.map(
          ({
            date_of_birth,
            full_name,
            user_id,
            location,
            user_interests,
          }) => ({
            date_of_birth,
            full_name,
            id: user_id,
            location,
            interests: user_interests.map(
              (i: { interest_id: string }) => i.interest_id
            ),
          })
        ) || [];

      setUsersToMatch(calculateUsersSimilarities(newUsers));
      setUpdateCount(updateCount + 1);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  };

  return (
    <View className="flex-1 px-4">
      <GestureHandlerRootView>
        <View className="flex-1">
          <Swiper
            key={updateCount}
            data={usersToMatch}
            cardStyle={{ height: "100%", width: "100%" }}
            renderCard={ProfileCard}
            onIndexChange={(index) => {
              if (index === usersToMatch.length) {
                getUsersToMatch();
              }
              console.log(index, usersToMatch.length);
            }}
          ></Swiper>
        </View>
      </GestureHandlerRootView>
    </View>
  );
}

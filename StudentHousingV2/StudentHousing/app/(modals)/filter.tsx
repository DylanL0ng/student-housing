import { CreationSlider } from "@/components/Inputs/Creation";
import { Text, View } from "@tamagui/core";
import { useNavigation } from "expo-router";
import React, { useEffect } from "react";

const FilterPage = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Filters",
    });
  }, [navigation]);

  return (
    <View flex={1} bg={"$background"}>
      <CreationSlider question={{ type: "t", options: [] }} />
    </View>
  );
};

export default FilterPage;

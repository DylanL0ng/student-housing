import { FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import Switch from "./Switch";
import { usePathname, useRouter, useSegments } from "expo-router";

type ViewStates = "people" | "accommodation";
type HeaderProps = {
  page: string;
};
const Header = (props: HeaderProps) => {
  const [_, cur_page] = useSegments();
  let page = cur_page?.toString();

  if (page === undefined) page = "discover";

  const options = [
    {
      state: "people",
      icon: { component: FontAwesome5, icon: "user-alt" },
    },
    {
      state: "accommodation",
      icon: { component: FontAwesome6, icon: "house" },
    },
  ];

  return (
    <View className="flex w-full flex-row items-center justify-between py-6 px-4">
      <View className="bg-amber-700 aspect-square w-10"></View>
      {page === "discover" && <Switch options={options} />}
      <TouchableHighlight>
        <Ionicons name="filter" size={24} color="black" />
      </TouchableHighlight>
    </View>
  );
};

export default Header;

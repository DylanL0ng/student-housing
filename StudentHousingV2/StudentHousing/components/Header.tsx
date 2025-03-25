import { FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
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
    <View style={styles.container}>
      <View style={styles.logo}></View>
      {page === "discover" && <Switch options={options} />}
      <TouchableHighlight>
        <Ionicons name="filter" size={24} color="black" />
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  logo: {
    aspectRatio: 1,
    backgroundColor: "#fbbf24",
    width: 30,
  },
});

export default Header;

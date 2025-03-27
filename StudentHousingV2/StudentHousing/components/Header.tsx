import { FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";

import Toggle from "react-native-toggle-element";

import { usePathname, useRouter, useSegments } from "expo-router";
import { useTheme, View } from "@tamagui/core";
import { Button } from "@tamagui/button";

type ViewStates = "people" | "accommodation";
type HeaderProps = {
  page: string;
};
const Header = (props: HeaderProps) => {
  const [_, cur_page] = useSegments();
  let page = cur_page?.toString();
  const [pageMode, setPageMode] = useState<boolean>(true);

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

  const theme = useTheme();

  return (
    <View bg={"$color2"} style={styles.container}>
      <View style={styles.logo}></View>
      {page === "discover" && (
        <Toggle
          trackBar={{
            activeBackgroundColor: theme.color02.val,
            inActiveBackgroundColor: theme.color02.val,
            width: 60,
            height: 30,
          }}
          thumbButton={{
            height: 35,
            width: 35,
            activeBackgroundColor: theme.color11.val,
            inActiveBackgroundColor: theme.color11.val,
          }}
          thumbActiveComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome5
                name="user-alt"
                size={18}
                color={theme.black3.val}
              />
            </View>
          }
          thumbInActiveComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome6 name="house" size={18} color={theme.black3.val} />
            </View>
          }
          value={pageMode}
          onPress={(newState) => setPageMode(newState ?? false)}
        />
      )}
      <Button bg="$color02" circular={true}>
        <Ionicons name="filter" size={24} color={theme.white10.val} />
      </Button>
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

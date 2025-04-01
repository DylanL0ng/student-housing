import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Settings, Settings2 } from "@tamagui/lucide-icons";
import { router, useSegments } from "expo-router";
import { useTheme, View } from "@tamagui/core";
import { Button } from "@tamagui/button";
import { XGroup } from "@tamagui/group";

type HeaderProps = {
  page: string;
};

const Header = (props: HeaderProps) => {
  const [_, cur_page] = useSegments();
  const insets = useSafeAreaInsets(); // Get safe area insets
  let page = cur_page?.toString();
  const [pageMode, setPageMode] = useState<boolean>(true);
  const theme = useTheme();

  return (
    <>
      <View
        width={"100%"}
        bg={"$color2"}
        paddingInline={"$4"}
        paddingBlock={"$2"}
        pt={insets.top + 8} // Add padding for status bar
        items={"flex-end"}
      >
        <StatusBar barStyle="dark-content" />
        <XGroup gap={"$1"}>
          <XGroup.Item>
            <Button
              circular={true}
              onPress={() => {
                router.push({
                  pathname: "/(modals)/filters",
                });
              }}
            >
              <Settings2 strokeWidth={2} opacity={0.85} />
            </Button>
          </XGroup.Item>
          <XGroup.Item>
            <Button
              circular={true}
              onPress={() => {
                router.push("/(modals)/settings");
              }}
            >
              <Settings size={"$1"} strokeWidth={2} opacity={0.85} />
            </Button>
          </XGroup.Item>
        </XGroup>
      </View>
    </>
  );
};

export default Header;

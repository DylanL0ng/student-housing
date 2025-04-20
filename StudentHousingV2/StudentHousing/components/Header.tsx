import React, { useState } from "react";
import { StyleSheet, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Settings, Settings2 } from "@tamagui/lucide-icons";
import { router, useSegments } from "expo-router";
import { Button, useTheme, View, XGroup } from "tamagui";
import { useViewMode } from "@/providers/ViewModeProvider";

type HeaderProps = {
  page: string;
};

const Header = (props: HeaderProps) => {
  const [_, cur_page] = useSegments();
  const insets = useSafeAreaInsets(); // Get safe area insets
  let page = cur_page?.toString();
  const theme = useTheme();

  const { viewMode } = useViewMode();

  return (
    <>
      <View
        width={"100%"}
        bg={"$color2"}
        paddingInline={"$4"}
        paddingBlock={"$4"}
        paddingTop={insets.top}
        items={"flex-end"}
      >
        <StatusBar barStyle="dark-content" />
        <XGroup gap={"$1"}>
          {viewMode === "flatmate" && (
            <XGroup.Item>
              <Button
                circular={true}
                onPress={() => {
                  router.push({
                    pathname: "/(filters)",
                  });
                }}
              >
                <Settings2 strokeWidth={2} opacity={0.85} />
              </Button>
            </XGroup.Item>
          )}
          <XGroup.Item>
            <Button
              circular={true}
              onPress={() => {
                router.push({
                  pathname: "/(modals)/settings",
                });
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

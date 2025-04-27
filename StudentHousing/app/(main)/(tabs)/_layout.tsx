import { Tabs, useNavigation, useRouter } from "expo-router";
import { Platform, Pressable } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, View } from "@tamagui/core";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { usePathname } from "expo-router/build/hooks";
import { Compass, Mail, MessageCircle, User } from "@tamagui/lucide-icons";
import { useViewMode } from "@/providers/ViewModeProvider";

export default function TabLayout() {
  const theme = useTheme();
  const navigation = useNavigation();

  const { viewMode, setViewMode } = useViewMode();
  const router = useRouter();
  const pathname = usePathname();

  // useEffect(() => {
  //   if (viewMode === "accommodation" && pathname === "/") {
  //     return router.replace("/(main)/(tabs)/requests");
  //   }
  //   if (viewMode === "flatmate" && pathname === "/requests") {
  //     return router.replace("/");
  //   }
  // }, [viewMode, pathname]);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    navigation.setOptions({
      header: () => <Header page="" />,
    });
  }, [navigation]);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarStyle: {
          borderTopWidth: 0,
          height: insets.bottom + (Platform.OS === "android" ? 60 : 40),
        },
        tabBarBackground: () => (
          <View
            bg={"$color2"}
            style={{ position: "absolute", inset: 0 }}
          ></View>
        ),
        tabBarButton: (props) => <Pressable {...props} />,
        tabBarIconStyle: {
          color: theme.color02.val,
        },
        tabBarLabelStyle: {
          color: theme.color02.val,
        },
        tabBarActiveTintColor: theme.color.val,
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => <Compass color={color} />,
          href: viewMode === "flatmate" ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: ({ color }) => <Mail color={color} />,
          href: viewMode === "accommodation" ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <MessageCircle color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} />,
        }}
      />
    </Tabs>
  );
}

import { Colors } from "@/constants/Colors";
import { router, Tabs, useNavigation, useRouter } from "expo-router";
import {
  Platform,
  Pressable,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";
import {
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import TailwindColours from "@/constants/TailwindColours";
import { useTheme, View } from "@tamagui/core";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { usePathname, useRouteInfo } from "expo-router/build/hooks";
import { Compass, Mail, MessageCircle, User } from "@tamagui/lucide-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { useViewMode } from "@/providers/ViewModeProvider";

export default function TabLayout() {
  const theme = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const pathname = usePathname();

  const { viewMode, setViewMode } = useViewMode();

  useEffect(() => {
    console.log(viewMode);
    // if landlord mode is true and we are on discovery page redirect to requests
    // if landlord mode is false and we are on requests page redirect to discovery
    // if (viewMode === "landlord" && pathname.includes("/"))
    //   return router.replace("/(main)/(tabs)/requests");
    // if (viewMode === "flatmate" && pathname.includes("/requests"))
    //   return router.replace("/(main)/(tabs)");
  }, [viewMode]);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    navigation.setOptions({
      header: () => <Header page="" />,
    });
  }, [navigation]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          borderTopWidth: 0,
          height: insets.bottom + 40,
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
        tabBarActiveTintColor: theme.white1.val,
        headerShown: false,
      }}
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
          href: viewMode === "landlord" ? undefined : null,
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

import { Colors } from "@/constants/Colors";
import { Tabs } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";
import TailwindColours from "@/constants/TailwindColours";
import { useTheme, View } from "@tamagui/core";
import { useEffect } from "react";

export default function TabLayout() {
  const theme = useTheme(); // Get current theme colors

  // useEffect(() => {})

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "rgba(0, 0, 0, 0)",
          paddingBlock: 8,
          height: 60,
          borderWidth: 0,
          boxShadow: "0",
          elevation: 0, // Android shadow removal
          shadowOpacity: 0, // iOS shadow removal
        },

        tabBarButton: (props) => <Pressable {...props} />,
        tabBarIconStyle: {
          color: TailwindColours.text.muted,
        },
        tabBarLabelStyle: {
          // marginTop: 2,
          color: TailwindColours.text.muted,
        },
        tabBarActiveTintColor: theme.color11.val,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="message-minus"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-alt" size={24} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="interests"
        options={{
          title: "Interests",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />

      /> */}
    </Tabs>
  );
}

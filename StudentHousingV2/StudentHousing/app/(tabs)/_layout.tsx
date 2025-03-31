import { Colors } from "@/constants/Colors";
import { Tabs, useNavigation } from "expo-router";
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
import Header from "@/components/Header";

export default function TabLayout() {
  const theme = useTheme();
  const navigation = useNavigation();

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
          height: 60,
        },
        tabBarBackground: () => (
          <View
            bg={"$color2"}
            style={{ position: "absolute", inset: 0 }}
          ></View>
        ),

        tabBarButton: (props) => <Pressable {...props} />,
        tabBarIconStyle: {
          color: TailwindColours.text.muted,
        },
        tabBarLabelStyle: {
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

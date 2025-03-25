import { Colors } from "@/constants/Colors";
import { Tabs } from "expo-router";
import {
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";
import {
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    // <SafeAreaView style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarStyle: {
          paddingBlock: 8,
          height: 70,
          borderWidth: 0,
          boxShadow: "0",
        },
        tabBarButton: (props) => (
          <TouchableOpacity activeOpacity={1.0} {...props} />
        ),
        tabBarLabelStyle: {
          marginTop: 2,
        },
        tabBarActiveTintColor: "blue",
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
    // </SafeAreaView>
  );
}

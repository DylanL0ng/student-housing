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
import { useRouteInfo } from "expo-router/build/hooks";
import { Compass, Mail, MessageCircle, User } from "@tamagui/lucide-icons";

export default function TabLayout() {
  const theme = useTheme();
  const navigation = useNavigation();

  const [landlordMode, setLandlordMode] = useState(true);

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
      {landlordMode && (
        <Tabs.Screen
          name="requests"
          options={{
            title: "Requests",
            tabBarIcon: ({ color }) => <Mail color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}

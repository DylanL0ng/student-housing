import {
  ScrollView,
  View,
  H6,
  YGroup,
  ListItem,
  Button,
  Checkbox,
} from "tamagui";

import { Check as CheckIcon } from "@tamagui/lucide-icons";
import { router, useNavigation } from "expo-router";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabase";
import { useEffect, useLayoutEffect } from "react";
import { Header } from "@react-navigation/elements/src/Header/Header";

const SettingsPage = () => {
  const checkbox = (itemLabel: string) => {
    return (
      <Checkbox
        size="$4"
        // onCheckedChange={(checked) => {
        //   setSelectedItems((prev) => ({
        //     ...prev,
        //     [itemLabel]: checked === true,
        //   }));
        // }}
        // checked={selectedItems[itemLabel] || false}
      >
        <Checkbox.Indicator>
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox>
    );
  };

  return (
    <>
      <Header back={{ title: "Back", href: "/" }} title="Settings" />
      <ScrollView flex={1} paddingBlock={"$4"} bg={"$background"}>
        <View key={0}>
          <YGroup paddingInline={"$4"} rowGap={"$0.5"}>
            <YGroup.Item key={1}>
              <Button
                pressTheme
                onPress={() => {
                  console.log("Pressed");
                  router.replace("/(auth)/creation");
                }}
              >
                Creation Screen
              </Button>
            </YGroup.Item>
            <YGroup.Item key={3}>
              <ListItem
                title={"Landlord mode"}
                subTitle={"Toggle into the landlord dashboard"}
                pressTheme
                iconAfter={() => checkbox("Landlord mode")}
              ></ListItem>
            </YGroup.Item>
            <YGroup.Item key={2}>
              <Button
                pressTheme
                onPress={() => {
                  supabase.auth.signOut();
                  router.replace("/(auth)/login");
                }}
                theme={"red"}
              >
                Logout
              </Button>
            </YGroup.Item>
          </YGroup>
        </View>
      </ScrollView>
    </>
  );
};

export default SettingsPage;

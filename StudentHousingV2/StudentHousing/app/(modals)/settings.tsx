// import React from "react";

import { ScrollView } from "@tamagui/scroll-view";
import { View } from "@tamagui/core";
import { H6 } from "@tamagui/text";
import { YGroup } from "@tamagui/group";
import { ListItem } from "@tamagui/list-item";
import { Button } from "@tamagui/button";

import { Checkbox } from "@tamagui/checkbox";
import { Check as CheckIcon } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAuth } from "@/components/AuthProvider";
import supabase from "../lib/supabase";

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
    <ScrollView flex={1} bg={"$background"}>
      <View key={0}>
        <YGroup paddingInline={"$4"} rowGap={"$0.5"}>
          <YGroup.Item key={1}>
            <Button
              pressTheme
              onPress={() => {
                router.replace("/auth/creation");
              }}
            >
              Creation Screen
            </Button>
          </YGroup.Item>
          <YGroup.Item key={1}>
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
                router.replace("/auth/login");
              }}
              theme={"red"}
            >
              Logout
            </Button>
          </YGroup.Item>
        </YGroup>
      </View>
    </ScrollView>
  );
};

export default SettingsPage;

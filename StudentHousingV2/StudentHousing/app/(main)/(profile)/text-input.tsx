import { useEffect, useState } from "react";
import { useTheme, View, Button, Input, Label } from "tamagui";
import { HeaderWithBack } from "../(filters)";
import { useRoute } from "@react-navigation/native";
import supabase from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/providers/ProfileProvider";

const TextInputScreen = () => {
  const theme = useTheme();
  const { session } = useAuth();

  const { activeProfileId } = useProfile();

  const route = useRoute();
  const { item } = route.params;

  const parsedItem = JSON.parse(Array.isArray(item) ? item[0] : item);

  const { label, placeholder, data } = parsedItem.information.value;

  const [inputValue, setInputValue] = useState(data.value);

  const handleInputSave = async () => {
    await supabase
      .from("profile_information")
      .upsert({
        profile_id: activeProfileId,
        key: parsedItem.information.key,
        value: {
          ...parsedItem.information.value,
          data: { value: inputValue },
        },
      })
      .eq("profile_id", activeProfileId)
      .eq("key", parsedItem.information.key)
      .eq("view", "flatmate");
  };

  return (
    <>
      <HeaderWithBack page="Your Name" />
      <View flex={1} gap="$4" bg="$background" paddingInline="$4">
        <View>
          <Label>{label}</Label>
          <Input
            onChangeText={(value) => setInputValue(value)}
            defaultValue={inputValue}
            placeholder={placeholder}
          />
        </View>
        <Button onPress={handleInputSave}>Save Input</Button>
      </View>
    </>
  );
};

export default TextInputScreen;

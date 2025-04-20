import { useEffect, useState } from "react";
import { useTheme, View, Button, Input, Label } from "tamagui";
import { HeaderWithBack } from "../(filters)";
import { useRoute } from "@react-navigation/native";
import supabase from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

const TextInputScreen = () => {
  const theme = useTheme();
  const { session } = useAuth();

  const route = useRoute();
  const { item } = route.params;

  const parsedItem = JSON.parse(Array.isArray(item) ? item[0] : item);

  const { label, placeholder, data } = parsedItem.information.value;

  const [inputValue, setInputValue] = useState(data);

  const handleInputSave = async () => {
    await supabase
      .from("profile_information")
      .upsert({
        profile_id: session?.user.id,
        key: parsedItem.information.key,
        value: {
          ...parsedItem.information.value,
          data: { value: inputValue },
        },
      })
      .eq("profile_id", session?.user.id)
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
            defaultValue={data}
            placeholder={placeholder}
          />
        </View>
        <Button onPress={handleInputSave}>Save Input</Button>
      </View>
    </>
  );
};

export default TextInputScreen;

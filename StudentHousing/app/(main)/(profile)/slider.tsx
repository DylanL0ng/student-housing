import { useEffect, useState } from "react";
import { useTheme, View, Button, Input, Label } from "tamagui";
import { HeaderWithBack } from "../(filters)";
import { useRoute } from "@react-navigation/native";
import supabase from "@/lib/supabase";
import { useProfile } from "@/providers/ProfileProvider";
import { SliderInput } from "@/components/Inputs/Slider";
import { useNavigation } from "expo-router";

const SliderInputScreen = () => {
  const theme = useTheme();

  const { activeProfileId } = useProfile();

  const route = useRoute();
  const { item } = route.params;

  const parsedItem = JSON.parse(Array.isArray(item) ? item[0] : item);

  const { type, value, creation } = parsedItem;
  const { title, data } = value;

  const [min, max, step] = creation.options.range;

  const [inputValue, setInputValue] = useState(data.value);

  const navigation = useNavigation();
  const handleInputSave = async () => {
    await supabase
      .from("profile_information")
      .upsert({
        profile_id: activeProfileId,
        key: type,
        value: {
          ...value,
          data: { value: inputValue },
        },
      })
      .eq("profile_id", activeProfileId)
      .eq("key", type)
      .eq("view", "flatmate");

    navigation.goBack();
  };

  return (
    <>
      <HeaderWithBack page="Your Name" />
      <View flex={1} gap="$4" bg="$background" paddingInline="$4">
        <View>
          <Label color={"$color"}>{title}</Label>
          <SliderInput
            min={min}
            max={max}
            step={step}
            value={inputValue}
            prefix={parsedItem.creation.options.prefix}
            onValueChange={(value) => {
              setInputValue(value);
            }}
          />
        </View>
        <Button onPress={handleInputSave}>Save Input</Button>
      </View>
    </>
  );
};

export default SliderInputScreen;

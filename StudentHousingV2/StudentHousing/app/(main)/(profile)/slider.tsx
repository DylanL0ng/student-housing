import { useEffect, useState } from "react";
import { useTheme, View, Button, Input, Label } from "tamagui";
import { HeaderWithBack } from "../(filters)";
import { useRoute } from "@react-navigation/native";
import supabase from "@/lib/supabase";
import { useProfile } from "@/providers/ProfileProvider";
import { CreationSlider } from "@/components/Inputs/Slider";

const SliderInputScreen = () => {
  const theme = useTheme();

  const { activeProfileId } = useProfile();

  const route = useRoute();
  const { item } = route.params;

  const parsedItem = JSON.parse(Array.isArray(item) ? item[0] : item);

  const [min, max, step] = parsedItem.creation.options.range;
  const { title, data } = parsedItem.information.value;

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
          <Label color={"$color"}>{title}</Label>
          <CreationSlider
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

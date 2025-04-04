import { SafeAreaView } from "react-native-safe-area-context";
import { Input, Slider, useTheme, View } from "tamagui";
import { HeaderWithBack } from ".";
import { Filter } from "@/typings";
import { useLocalSearchParams } from "expo-router";

const MapScreen = () => {
  const { item } = useLocalSearchParams();
  if (!item) return null;
  const filter = JSON.parse(Array.isArray(item) ? item[0] : item) as Filter;
  const theme = useTheme();
  return (
    <>
      <HeaderWithBack page={filter.label} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.val }}>
        <View flex={1} gap={"$8"} paddingInline={"$4"}>
          <View display="flex" gap={"$4"}>
            <View
              width={"100%"}
              style={{ borderRadius: 8 }}
              aspectRatio={1}
              bg={"$color02"}
            ></View>
            <Input placeholder="Enter your address" />
          </View>
          <Slider
            defaultValue={[0]}
            min={0}
            max={100}
            step={1}
            orientation="horizontal"
            size="$4"
            bg={"$background"}
          >
            <Slider.Track bg={"$color02"}>
              <Slider.TrackActive bg={"$color04"} />
            </Slider.Track>
            <Slider.Thumb index={0} size={"$3"} circular={true} />
          </Slider>
        </View>
      </SafeAreaView>
    </>
  );
};

export default MapScreen;

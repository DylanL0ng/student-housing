import { Text } from "@tamagui/core";
import { Spinner, YStack } from "tamagui";
import { View } from "@tamagui/core";

const Loading = ({ title }: { title: string }) => {
  return (
    <View bg={"$background"} flex={1} justify={"center"} items={"center"}>
      <YStack gap={"$2"}>
        <Text fontSize={"$4"} color={"$color"}>
          {title}
        </Text>
        <Spinner size={"large"} color={"$color"} />
      </YStack>
    </View>
  );
};

export default Loading;

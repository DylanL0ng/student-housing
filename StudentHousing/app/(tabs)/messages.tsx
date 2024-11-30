import MatchedProfileMini from "@/components/ui/MatchedProfileMini";
import Header from "@/components/ui/Header";
import React, { useCallback } from "react";
import { FlatList, SafeAreaView, ScrollView, Text, View } from "react-native";
import ConversationMini from "@/components/ui/ConversationMini";
import { FlashList } from "@shopify/flash-list";

export default function MessagesScreen() {
  const renderRowItem = useCallback(({ item, index }: any) => {
    return (
      <View
        style={{
          marginHorizontal: index % 2 != 0 ? 4 : 0,
        }}
      >
        <MatchedProfileMini {...item} />
      </View>
    );
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 h-screen px-4">
        <FlashList
          overScrollMode="never"
          estimatedItemSize={35}
          ListHeaderComponent={
            <View>
              <Text className="text-xl font-bold mb-4">
                Potential Flatmates
              </Text>
              <FlashList
                overScrollMode="never"
                renderItem={renderRowItem}
                data={[1, 2, 3, 4, 5, 6]}
                horizontal
                estimatedItemSize={75}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
              />
              <Text className="text-xl font-bold mb-4 mt-6">Conversations</Text>
            </View>
          }
          data={[1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]}
          renderItem={ConversationMini}
          ItemSeparatorComponent={() => (
            <View className="w-full bg-gray-200 h-0.5 my-4"></View>
          )}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

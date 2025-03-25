import ConversationMini from "@/components/ConversationMini";
import MatchedProfileMini from "@/components/MatchedProfileMini";
import { Conversations, Relationships, Users } from "@/constants/Users";
import { Conversation, Relationship, User } from "@/typings";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FlatList, SafeAreaView, ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native";

export default function MessagesScreen() {
  const [unInteractedMatches, setUnInteractedMatches] = useState<User[]>([]);

  useEffect(() => {
    setUnInteractedMatches(
      Relationships.filter((relationship) => !relationship.interacted).map(
        (relationship) => {
          return Users[relationship.id as keyof typeof Users];
        }
      )
    );
  }, [Relationships]);

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
    <SafeAreaView style={styles.flex}>
      <View style={{ ...styles.flex, ...styles.container }}>
        <FlatList
          overScrollMode="never"
          ListHeaderComponent={
            <View>
              {unInteractedMatches.length > 0 && (
                <Text style={styles.text}>Potential Flatmates</Text>
              )}
              <FlatList
                overScrollMode="never"
                renderItem={renderRowItem}
                data={unInteractedMatches.map((relationship) => {
                  return Users[relationship.id as keyof typeof Users];
                })}
                horizontal
                // estimatedItemSize={75}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
              />
              <Text style={{ ...styles.text, ...styles.mt }}>
                Conversations
              </Text>
            </View>
          }
          // Conversations history
          data={Conversations}
          renderItem={({ item, index }) => <ConversationMini {...item} />}
          ItemSeparatorComponent={() => <View style={styles.seperator}></View>}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  mt: {
    marginTop: 16,
  },
  container: {
    height: "100%",
    paddingHorizontal: 16,
  },
  seperator: {
    width: "100%",
    backgroundColor: "#e5e7eb",
    height: 0.5,
    marginBlock: 8,
  },
});

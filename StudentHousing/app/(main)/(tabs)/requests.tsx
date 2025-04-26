import Loading from "@/components/Loading";
import supabase from "@/lib/supabase";
import { useProfile } from "@/providers/ProfileProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, FlatList, useWindowDimensions } from "react-native";
import { Image, Text, useTheme, View } from "tamagui";

const RequestsPage = () => {
  const { activeProfileId } = useProfile();
  const [connections, setConnections] = useState([]);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [isLoading, setIsLoading] = useState(true);
  const gap = 12;
  // Calculate item width based on screen width, padding, and gap
  const itemWidth = (width - 16 - gap) / 2; // 16 is from the paddingInline="$2"

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke(
        "getHousingRequests",
        {
          body: {
            sourceId: activeProfileId,
          },
        }
      );

      if (data) {
        setConnections(data.response);
      }
      setIsLoading(false);
    })();
  }, [activeProfileId]);

  const openProfile = (profile) => {
    router.push({
      pathname: "/(main)/(modals)/profile",
      params: {
        profile: JSON.stringify(profile),
        showLikes: "true",
      },
    });
  };

  const renderItem = ({ item, index }) => {
    // Determine if this is an odd or even item
    const isEven = index % 2 === 0;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => openProfile(item)}
        style={{
          width: itemWidth,
          marginRight: isEven ? gap : 0,
          marginBottom: gap,
        }}
      >
        <View borderRadius={"$4"} aspectRatio={0.75} key={item.id}>
          <Image
            transition="0"
            overflow="hidden"
            borderRadius={"$4"}
            flex={1}
            source={{ uri: item.media[0] }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View flex={1} paddingInline={"$2"} bg={"$background"}>
      {isLoading ? (
        <View flex={1} justifyContent="center" alignItems="center">
          <Loading title="Searching for requests" />
        </View>
      ) : connections.length > 0 ? (
        <View flex={1}>
          <Text fontWeight={"bold"} fontSize={"$6"} marginVertical="$2">
            Requests
          </Text>
          <FlatList
            data={connections}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id + "-" + index}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: gap }}
            columnWrapperStyle={{
              justifyContent: "flex-start",
            }}
          />
        </View>
      ) : (
        <View flex={1} justifyContent="center" alignItems="center">
          <Text>No requests found</Text>
        </View>
      )}
    </View>
  );
};

export default RequestsPage;

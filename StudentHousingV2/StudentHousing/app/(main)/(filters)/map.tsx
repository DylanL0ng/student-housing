import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, View } from "tamagui";
import { HeaderWithBack } from ".";
import { Filter } from "@/typings";
import { useLocalSearchParams } from "expo-router";
import { getSavedFilters, saveFilter } from "@/utils/filterUtils";
import { LocationPicker } from "@/components/LocationPicker"; // make sure the path is correct

const MapScreen = () => {
  const { item } = useLocalSearchParams();
  const theme = useTheme();

  if (!item) return null;
  const filter = JSON.parse(Array.isArray(item) ? item[0] : item) as Filter;

  const [initialLocation, setInitialLocation] = useState<{
    latitude: number;
    longitude: number;
    range: number;
  } | null>(null);

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    range: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedFilters = await getSavedFilters();
        const savedValue = savedFilters[filter.filter_key];

        if (savedValue) {
          setInitialLocation(savedValue);
        }
      } catch (error) {
        console.error("Error loading saved filters:", error);
      }
    };

    fetchData();
  }, [filter.filter_key]);

  const handleSaveFilter = () => {
    if (currentLocation) {
      saveFilter(filter.filter_key, currentLocation);
    }
  };

  return (
    <>
      <HeaderWithBack page={filter.label} />
      <View
        flex={1}
        gap="$4"
        bg={"$background"}
        paddingBlock={"$4"}
        paddingInline="$4"
      >
        {initialLocation && (
          <LocationPicker
            initialLocation={initialLocation}
            onLocationChange={(loc) => setCurrentLocation(loc)}
            onSave={handleSaveFilter}
            headerText={filter.label}
            saveButtonText="Save Location"
          />
        )}
      </View>
    </>
  );
};

export default MapScreen;

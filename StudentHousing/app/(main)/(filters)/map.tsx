import { useCallback, useEffect, useState } from "react";
import { Text, useTheme, View } from "tamagui";
import { Filter } from "@/typings";
import { useLocalSearchParams } from "expo-router";
import { getSavedFilters, saveFilter } from "@/utils/filterUtils";
import { LocationPicker } from "@/components/LocationPicker"; // make sure the path is correct
import { HeaderWithBack } from ".";

import * as Location from "expo-location";
import Loading from "@/components/Loading";

const MapScreen = () => {
  const { item } = useLocalSearchParams();
  const theme = useTheme();

  if (!item) return null;
  const [isLoading, setIsLoading] = useState(true);
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
        } else {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          const { latitude, longitude } = location.coords;
          setInitialLocation({
            latitude,
            longitude,
            range: 1000, // default range
          });
        }
      } catch (error) {
        console.error("Error loading saved filters:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filter.filter_key]);

  const handleSaveFilter = () => {
    if (currentLocation) {
      saveFilter(filter.filter_key, currentLocation);
    }
  };

  const handleLocationChange = useCallback(
    (location) => {
      setCurrentLocation(location);
    },
    [setCurrentLocation]
  );

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
        {isLoading ? (
          <Loading title="Loading map" />
        ) : (
          initialLocation && (
            <LocationPicker
              initialLocation={initialLocation}
              onLocationChange={handleLocationChange}
              onSave={handleSaveFilter}
              headerText={filter.label}
              saveButtonText="Save Location"
            />
          )
        )}
      </View>
    </>
  );
};

export default MapScreen;

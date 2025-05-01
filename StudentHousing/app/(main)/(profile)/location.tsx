import { useEffect, useState } from "react";
import { useTheme, View, Button } from "tamagui";
import { LocationPicker } from "@/components/LocationPicker";
import { HeaderWithBack } from "../(filters)";
import { useProfile } from "@/providers/ProfileProvider";
import { useNavigation } from "expo-router";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import * as Location from "expo-location";

const LocationScreen = () => {
  const { location, setLocation } = useProfile();

  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const [initialLocation, setInitialLocation] = useState<{
    latitude: number;
    longitude: number;
    range?: number;
  } | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    range?: number;
  } | null>(null);

  useEffect(() => {
    if (location) {
      setInitialLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setLoading(false);
    } else {
      // get the current location
      async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location was denied");
          setLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({});
        setInitialLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      };
    }
  }, [location]);

  const handleSaveLocation = async () => {
    if (!selectedLocation) return;

    try {
      setLocation({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });

      navigation.goBack();
    } catch (error) {
      console.error("Failed to update location", error);
    }
  };

  return (
    <>
      <HeaderWithBack page="Set Your Location" />
      <View
        flex={1}
        bg="$background"
        gap="$4"
        paddingBlock={"$4"}
        paddingInline="$4"
      >
        {loading && (
          <LocationPicker
            initialLocation={initialLocation}
            onLocationChange={setSelectedLocation}
            showSaveButton={true}
            onSave={handleSaveLocation}
            headerText="Your Location"
            saveButtonText="Save Location"
          />
        )}
      </View>
    </>
  );
};

export default LocationScreen;

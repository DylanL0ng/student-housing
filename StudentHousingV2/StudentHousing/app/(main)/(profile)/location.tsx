import { useEffect, useState } from "react";
import { useTheme, View, Button } from "tamagui";
import { LocationPicker } from "@/components/LocationPicker";
import { Alert } from "react-native";
import { HeaderWithBack } from "../(filters)";
import { useProfile } from "@/providers/ProfileProvider";
import Toast from "react-native-toast-message";

const LocationScreen = () => {
  const theme = useTheme();
  const { location, setLocation } = useProfile();

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

  // Set initial location when user location is available
  useEffect(() => {
    // console.log(location);
    if (location) {
      setInitialLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }, [location]);

  const handleSaveLocation = async () => {
    if (!selectedLocation) return;

    try {
      setLocation({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });

      Toast.show({
        type: "success",
        text1: "Location saved",
      });
      // console.log("Location saved:", selectedLocation);
      //   Alert.alert("Success", "Your location has been updated.");
    } catch (error) {
      console.error("Failed to update location", error);
      Alert.alert("Error", "There was an issue saving your location.");
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
        {initialLocation && (
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

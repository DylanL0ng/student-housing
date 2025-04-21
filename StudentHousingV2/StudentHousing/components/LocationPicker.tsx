import { useEffect, useRef, useState } from "react";
import { View, Text, Button, Slider, useTheme } from "tamagui";
import MapView, { Circle, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { Compass } from "@tamagui/lucide-icons";

type LocationPickerProps = {
  initialLocation?: {
    latitude: number;
    longitude: number;
    range?: number;
  };
  onLocationChange?: (location: {
    latitude: number;
    longitude: number;
    range?: number;
  }) => void;
  onSave?: () => void;
  showSaveButton?: boolean;
  saveButtonText?: string;
  headerText?: string;
};

export const LocationPicker = ({
  initialLocation,
  onLocationChange,
  onSave,
  showSaveButton = true,
  saveButtonText = "Save Location",
  headerText = "Choose Location",
}: LocationPickerProps) => {
  const theme = useTheme();
  const mapRef = useRef(null);

  const [center, setCenter] = useState(
    initialLocation || { latitude: 37.78825, longitude: -122.4324 }
  );

  const [radius, setRadius] = useState(initialLocation?.range ?? 1000);

  const handleRegionChange = (region) => {
    setCenter({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied"
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCenter(coords);
      mapRef.current?.animateToRegion(
        { ...coords, latitudeDelta: 0.0922, longitudeDelta: 0.0421 },
        1000
      );
    } catch (error) {
      Alert.alert("Error", "Could not get your location");
      console.error(error);
    }
  };

  useEffect(() => {
    if (onLocationChange) {
      onLocationChange({ ...center, range: radius });
    }
  }, [center, radius]);

  return (
    <View gap="$4">
      <Text fontSize={"$6"} fontWeight="bold">
        {headerText}
      </Text>

      <View
        width="100%"
        aspectRatio={1}
        borderRadius={8}
        bg="$color02"
        position="relative"
      >
        <MapView
          ref={mapRef}
          style={{ width: "100%", height: "100%", borderRadius: 8 }}
          initialRegion={{
            ...center,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onRegionChange={handleRegionChange}
        >
          {initialLocation?.range ? (
            <Circle
              center={center}
              radius={radius}
              strokeWidth={2}
              strokeColor={theme.color04.val}
              fillColor={`${theme.color04.val}40`}
            />
          ) : (
            <Marker
              coordinate={center}
              anchor={{ x: 0.5, y: 1 }}
              style={{ opacity: 1 }} // hides the marker
            ></Marker>
          )}
        </MapView>

        <View position="absolute" bottom="$2" right="$2" zIndex={1000}>
          <Button
            circular
            size="$3"
            bg="$color"
            pressTheme
            onPress={getCurrentLocation}
            icon={() => <Compass size={20} color="black" />}
          />
        </View>
      </View>

      {initialLocation?.range && (
        <View gap="$2">
          <Text>Radius: {(radius / 1000).toFixed(1)} km</Text>
          <Slider
            height={50}
            value={[radius / 100]}
            onValueChange={(values) => setRadius(values[0] * 100)}
            min={10}
            max={1000}
            step={1}
            orientation="horizontal"
            size="$4"
            bg="$background"
          >
            <Slider.Track bg="$color02">
              <Slider.TrackActive bg="$color04" />
            </Slider.Track>
            <Slider.Thumb index={0} size="$3" circular />
          </Slider>
        </View>
      )}

      {showSaveButton && (
        <Button pressTheme onPress={onSave}>
          {saveButtonText}
        </Button>
      )}
    </View>
  );
};

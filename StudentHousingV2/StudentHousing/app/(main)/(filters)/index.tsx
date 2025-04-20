import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { ChevronRight } from "@tamagui/lucide-icons";
import {
  YGroup,
  ListItem,
  ScrollView,
  View,
  Button,
  Text,
  XStack,
} from "tamagui";
import { Header } from "@react-navigation/elements/src/Header/Header";
import supabase from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { Text as HeaderText } from "@react-navigation/elements/src/Text";
import { getSavedFilters } from "@/utils/filterUtils";
import * as Location from "expo-location";
import { useSearchMode } from "@/providers/ViewModeProvider";

interface Filter {
  id: string;
  default: {
    data: any;
  };
  options: any;
  description: string;
  group?: string;
  label: string;
  filter_key: string;
  filter_table: string;
  view_type: string;
  type: string;
}

export const HeaderWithText = ({
  page = "Filters",
  title = "Done",
  onPress,
}: {
  page: string;
  title: string;
  onPress?: () => void;
}) => {
  return (
    <Header
      title={page}
      headerRightContainerStyle={{ paddingRight: 24 }}
      headerRight={() => {
        return (
          <HeaderText
            onPress={() => {
              router.back();
              onPress && onPress();
            }}
          >
            {title}
          </HeaderText>
        );
      }}
    />
  );
};

export const getCityFromCoordinates = async (
  latitude: number,
  longitude: number
) => {
  try {
    const geocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (geocode.length > 0) {
      const { city, district, subregion, region, country } = geocode[0];
      return (
        city || district || subregion || region || country || "Unknown location"
      );
    }
    return "Unknown location";
  } catch (error) {
    console.error("Error getting location name:", error);
    return "Unknown location";
  }
};

export const HeaderWithBack = ({ page = "Filters" }) => {
  return <Header back={{ title: "Back", href: "/" }} title={page} />;
};

const FilterScreen = () => {
  const navigation = useNavigation();
  const [filterData, setFilterData] = useState<Filter[]>([]);
  const [savedFilterData, setSavedFilterData] = useState<Record<string, any>>(
    {}
  );
  const [formattedFilterData, setFormattedFilterData] = useState<Filter[]>([]);

  // Use the search mode context
  const { searchMode, setSearchMode } = useSearchMode();

  const { filtersToSave } = useLocalSearchParams();

  const fetchFilters = async (viewType: string) => {
    const { data, error } = await supabase
      .from("filters")
      .select("*")
      .in("view_type", [viewType, "shared"]);

    if (error) {
      console.error("Error fetching filters:", error);
      return [];
    }

    return data as Filter[];
  };

  const formatFilterDescriptions = useCallback(
    async (filters: Filter[], savedData: Record<string, any>) => {
      return Promise.all(
        filters.map(async (filter: Filter) => {
          let description = "";
          if (savedData[filter.filter_key] !== undefined) {
            if (filter.type === "multiSelect") {
              const values = Object.entries(savedData[filter.filter_key]);
              description = values
                .filter(([_, value]) => value)
                .map(([key]) => key)
                .join(", ");
            } else if (filter.type === "slider") {
              const values = savedData[filter.filter_key];
              description = values.join(" - ");
            } else if (filter.type === "toggle") {
              const value = savedData[filter.filter_key];
              const { data } = filter.options;
              description = value ? data[0] : data[1];
            } else if (filter.type === "location") {
              const value = savedData[filter.filter_key];
              const label = await getCityFromCoordinates(
                value.latitude,
                value.longitude
              );

              description = `${label} (${value.range / 1000} km)`;
            }
          }

          return {
            ...filter,
            description,
          };
        })
      );
    },
    []
  );

  // Refresh data when search mode changes - this will load the appropriate filters
  const refreshData = useCallback(async () => {
    setSavedFilterData(await getSavedFilters()); // This now uses the search mode-specific storage key
    setFilterData(await fetchFilters(searchMode));
  }, [searchMode]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
      return () => {};
    }, [refreshData])
  );

  useEffect(() => {
    const formatData = async () => {
      if (filterData.length > 0) {
        const formattedData = await formatFilterDescriptions(
          filterData,
          savedFilterData
        );
        setFormattedFilterData(formattedData);
      }
    };
    formatData();
  }, [filterData, savedFilterData, formatFilterDescriptions]);

  const handleSearchTypeChange = (type: "accommodation" | "flatmate") => {
    setSearchMode(type);
    // Filters will be automatically refreshed due to the dependency in refreshData
  };

  const RenderFilterItem = (item: Filter) => {
    switch (item.type) {
      case "multiSelect":
        return (
          <ListItem
            key={item.id}
            title={item.label}
            pressTheme
            subTitle={item.description}
            onPress={() =>
              router.navigate({
                pathname: "/multiSelect",
                params: {
                  item: JSON.stringify(item),
                  onReturn: "refresh",
                },
              })
            }
            iconAfter={ChevronRight}
          />
        );
      case "slider":
        return (
          <ListItem
            title={item.label}
            subTitle={item.description}
            pressTheme
            onPress={() => {
              router.navigate({
                pathname: "/slider",
                params: {
                  item: JSON.stringify(item),
                  onReturn: "refresh",
                },
              });
            }}
            iconAfter={ChevronRight}
          />
        );

      case "location":
        return (
          <ListItem
            title={item.label}
            subTitle={item.description}
            onPress={() =>
              router.navigate({
                pathname: "/map",
                params: {
                  item: JSON.stringify(item),
                  onReturn: "refresh",
                },
              })
            }
            iconAfter={ChevronRight}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    <>
      <HeaderWithText page={"Filters"} title={"Done"} />
      <ScrollView flex={1} bg={"$background"}>
        <View paddingHorizontal="$4" paddingTop="$4">
          <Text size="$5" fontWeight="bold" marginBottom="$2">
            Search Type
          </Text>
          <XStack gap="$2" marginBottom="$4">
            <Button
              flex={1}
              variant={searchMode === "accommodation" ? "filled" : "outlined"}
              onPress={() => handleSearchTypeChange("accommodation")}
            >
              Accommodation
            </Button>
            <Button
              flex={1}
              variant={searchMode === "flatmate" ? "filled" : "outlined"}
              onPress={() => handleSearchTypeChange("flatmate")}
            >
              Flatmate
            </Button>
          </XStack>
        </View>

        <View paddingBlock={"$2"} paddingInline={"$4"}>
          <YGroup rowGap={"$0.5"}>
            {formattedFilterData.map((filter, index) => (
              <YGroup.Item key={index}>{RenderFilterItem(filter)}</YGroup.Item>
            ))}
          </YGroup>
        </View>
      </ScrollView>
    </>
  );
};

export default FilterScreen;

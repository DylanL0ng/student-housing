import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { ChevronRight } from "@tamagui/lucide-icons";
import { YGroup, ListItem, ScrollView, View, Button } from "tamagui";
import { Header } from "@react-navigation/elements/src/Header/Header";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Text as HeaderText } from "@react-navigation/elements/src/Text";

interface Filter {
  id: number;
  filter_id: string;
  default: {
    data: any;
  };
  options: any;
  group?: string;
  label: string;
  description: string;
  filter_key: string;
  filter_table: string;
  filter_registry: {
    type: string;
  };
}

export const HeaderWithText = ({
  page = "Filters",
  title = "Done",
}: {
  page: string;
  title: string;
}) => {
  return (
    <Header
      title={page}
      headerRight={() => {
        return (
          <HeaderText
            onPress={() => {
              router.back();
            }}
          >
            {title}
          </HeaderText>
        );
      }}
    />
  );
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

  const { filtersToSave } = useLocalSearchParams();

  // Fetch original filters from Supabase
  const fetchFilters = async () => {
    const { data, error } = await supabase.from("filters").select(
      `
        *,
        filter_registry (type)
      `
    );

    if (error) {
      console.error("Error fetching filters:", error);
      return;
    }
    if (!data) return;

    setFilterData(data as Filter[]);
  };

  // Format descriptions based on saved filter data
  const formatFilterDescriptions = useCallback(
    (filters: Filter[], savedData: Record<string, any>) => {
      return filters.map((filter: Filter) => {
        let description = filter.description;

        if (savedData[filter.filter_key] !== undefined) {
          if (filter.filter_registry.type === "multiSelect") {
            const values = Object.entries(savedData[filter.filter_key]);
            description = values
              .filter(([_, value]) => value)
              .map(([key]) => key)
              .join(", ");
          } else if (filter.filter_registry.type === "slider") {
            const values = savedData[filter.filter_key];
            description = values.join(" - ");
          } else if (typeof savedData[filter.filter_key] === "object") {
            description = Object.keys(savedData[filter.filter_key]).join(", ");
          } else {
            description = String(savedData[filter.filter_key]);
          }
        }

        return {
          ...filter,
          description,
        };
      });
    },
    []
  );

  // Get saved filters from AsyncStorage
  const getSavedFilters = async () => {
    try {
      const data = await AsyncStorage.getItem("filters");
      const parsedData: { [key: string]: any } = data ? JSON.parse(data) : {};

      // console.log("Saved filters:", parsedData);
      setSavedFilterData(parsedData);

      // If we already have filter data, update the formatted data immediately
      if (filterData.length > 0) {
        setFormattedFilterData(
          formatFilterDescriptions(filterData, parsedData)
        );
      }
    } catch (error) {
      console.error("Error getting saved filters:", error);
      setSavedFilterData({});
    }
  };

  // Refresh all data
  const refreshData = useCallback(async () => {
    await getSavedFilters();
    await fetchFilters();
  }, []);

  // Initial data loading
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
      return () => {}; // cleanup function
    }, [refreshData])
  );

  useEffect(() => {
    if (filterData.length > 0) {
      setFormattedFilterData(
        formatFilterDescriptions(filterData, savedFilterData)
      );
    }
  }, [filterData, savedFilterData, formatFilterDescriptions]);

  const RenderFilterItem = (item: Filter) => {
    switch (item.filter_registry.type) {
      case "multiSelect":
        return (
          <ListItem
            key={item.id}
            title={item.label}
            pressTheme
            subTitle={item.description}
            onPress={() =>
              router.navigate({
                pathname: "/(filters)/multiSelect",
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
                pathname: "/(filters)/slider",
                params: {
                  item: JSON.stringify(item),
                  onReturn: "refresh",
                },
              });
            }}
            iconAfter={ChevronRight}
          />
        );
      case "map":
        return (
          <ListItem
            title={item.label}
            subTitle={item.description}
            onPress={() =>
              router.navigate({
                pathname: "/(filters)/map",
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
        return (
          <ListItem
            title={item.label}
            subTitle={item.description}
            onPress={() =>
              router.navigate({
                pathname: "/(filters)/default",
                params: {
                  item: JSON.stringify(item),
                  onReturn: "refresh",
                },
              })
            }
            iconAfter={ChevronRight}
          />
        );
    }
  };
  return (
    <>
      <HeaderWithText page={"Filters"} title={"Done"} />
      <ScrollView flex={1} bg={"$background"}>
        <View paddingBlock={"$4"} paddingInline={"$4"}>
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

import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { ChevronRight, List } from "@tamagui/lucide-icons";
import { YGroup, ListItem, ScrollView, View, Button, Switch } from "tamagui";
import { Header } from "@react-navigation/elements/src/Header/Header";
import supabase from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { Text as HeaderText } from "@react-navigation/elements/src/Text";
import { getSavedFilters } from "@/utils/filterUtils";
import ToggleFilter from "./toggle";

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
      headerRightContainerStyle={{ paddingRight: 24 }}
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

  const fetchFilters = async () => {
    const { data, error } = await supabase.from("filters").select(
      `
        *,
        filter_registry (type)
      `
    );

    if (error) {
      console.error("Error fetching filters:", error);
      return [];
    }
    return (data ?? []) as Filter[];
  };

  const formatFilterDescriptions = useCallback(
    (filters: Filter[], savedData: Record<string, any>) => {
      return filters.map((filter: Filter) => {
        let description = "";

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
          } else if (filter.filter_registry.type === "toggle") {
            const value = savedData[filter.filter_key];
            const { data } = filter.options;
            description = value ? data[0] : data[1];
          } else if (filter.filter_registry.type === "location") {
            const value = savedData[filter.filter_key];
            console.log("Location value", value);
            // description = `${value.latitude}, ${value.longitude}`;
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

  // Refresh all data
  const refreshData = useCallback(async () => {
    setSavedFilterData(await getSavedFilters());
    setFilterData(await fetchFilters());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
      case "toggle":
        return <ToggleFilter item={item} />;
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

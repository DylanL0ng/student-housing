// import { CreationSlider } from "@/components/Inputs/Creation";
import { View } from "@tamagui/core";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";

import { ChevronRight } from "@tamagui/lucide-icons";

import { YGroup } from "@tamagui/group";
import { ListItem } from "@tamagui/list-item";
import { ScrollView } from "@tamagui/scroll-view";
import { H2, H4, H6 } from "@tamagui/text";
import supabase from "../lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

// const filters = [
//   [
//     "Filters",
//     [
//       {
//         type: "multiSelect",
//         title: "Gender",
//         filter: "gender",
//         options: {
//           items: [
//             { id: "1", label: "Female" },
//             { id: "2", label: "Male" },
//           ],
//           default: ["1"],
//           selected: [],
//         },
//       },
//       {
//         type: "slider",
//         title: "Distance",
//         filter: "distance",
//         options: {
//           default: 0,
//           range: [0, 100, 1],
//         },
//       },
//       {
//         type: "map",
//         title: "Location",
//         filter: "location",
//         options: {},
//       },
//       {
//         type: "slider",
//         title: "Age",
//         filter: "age",
//         options: {
//           default: 18,
//           range: [18, 100, 1],
//           returnRange: true, // if false it will return the value of the slider, if true it will return an array with the min and max values of the slider
//         },
//       },
//     ],
//   ],
// ];

interface Filter {
  id: number;
  filter_id: string;
  default: {
    data: any;
  };
  options: any;
  group?: string;
  label: string;
  filter_key: string;
  filter_table: string;
  filter_registry: {
    type: string;
  };
}

const FilterScreen = () => {
  const navigation = useNavigation();

  const [filterData, setFilterData] = useState<Filter[]>([]);

  const { filtersToSave } = useLocalSearchParams();
  const { session } = useAuth();

  // TODO: Save each filter locally, and then save them locally, to use whenever the user makes a query
  useEffect(() => {
    const fetchData = async () => {
      const data = await AsyncStorage.getItem("filters");
      const parsedData: { [key: string]: any } = data ? JSON.parse(data) : {};

      if (parsedData) {
        Object.entries(parsedData).forEach(([key, value]) => {
          if (!key) return;

          const filter = filterData.find(
            (filter, idx) => filter.filter_key === key
          );

          // const newFilterData = filterData[] = value
          // setFilterData((prev) => {
          //   const newFilter = { ...filter, default: { data: value } };
          //   return [...prev, newFilter];
          // })
          // }
        });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Filters",
    });
  }, [navigation]);

  // useEffect(() => {
  //   console.log("filtersToSave", filtersToSave);
  // }, [filtersToSave]);

  useEffect(() => {
    (async () => {
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

      data as Filter[];

      // const { data: personalFilters, error: personalError } = await supabase
      //   .from("profile_filters")
      //   .select(`*`)
      //   .eq("user_id", session?.user.id);

      // if (personalError) {
      //   console.error("Error fetching personal filters:", personalError);
      //   return;
      // }
      // if (!personalFilters) return;

      // console.log("personalFilters", personalFilters);

      setFilterData(data);
    })();
  }, []);

  const renderItem = (item: Filter) => {
    switch (item.filter_registry.type) {
      case "multiSelect":
        const { id, label, options: itemOptions, default: defaultItem } = item;
        const { values } = itemOptions;

        return (
          <ListItem
            key={id}
            title={label}
            pressTheme
            subTitle={defaultItem.data}
            onPress={() =>
              router.navigate({
                pathname: "/(filters)/multiSelect",
                params: { item: JSON.stringify(item) },
              })
            }
            iconAfter={ChevronRight}
          />
        );
      case "slider":
        const { options } = item;
        const { default: defaultValue, range, returnRange } = options;
        const [min, max] = range;

        const subTitle = returnRange
          ? `${defaultValue || min} - ${max}`
          : `${defaultValue || min}`;
        return (
          <ListItem
            title={item.title}
            subTitle={subTitle}
            pressTheme
            onPress={() =>
              router.navigate({
                pathname: "/(filters)/slider",
                params: { item: JSON.stringify(item) },
              })
            }
            iconAfter={ChevronRight}
          />
        );
      case "map":
        return (
          <ListItem
            title={item.title}
            subTitle={item.description}
            onPress={() =>
              router.navigate({
                pathname: "/(filters)/slider",
                params: { item: JSON.stringify(item) },
              })
            }
            iconAfter={ChevronRight}
          />
        );
      default:
        return (
          <ListItem
            title={item.title}
            subTitle={item.description}
            onPress={() =>
              router.navigate({
                pathname: "/(filters)/slider",
                params: { item: JSON.stringify(item) },
              })
            }
            iconAfter={ChevronRight}
          />
        );
    }
  };

  return (
    <ScrollView flex={1} bg={"$background"}>
      <View>
        <H6 paddingInline={"$4"} size={"$2"} color={"$color"}>
          {"Test"}
        </H6>
        <YGroup rowGap={"$0.5"}>
          {filterData.map((filter, index) => (
            <YGroup.Item key={index}>{renderItem(filter)}</YGroup.Item>
          ))}
        </YGroup>
      </View>
    </ScrollView>
  );
};

export default FilterScreen;

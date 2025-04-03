import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { Text, Slider, H2, H4, H6, XStack, YStack, View } from "tamagui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HeaderWithBack } from ".";
import { Filter } from "@/typings";

const FilterSlider: React.FC = () => {
  const { item } = useLocalSearchParams();
  if (!item) return null;

  const [filterData, setFilterData] = useState<Filter | null>(null);
  const [range, setRange] = useState<[number, number, number]>([0, 0, 0]);
  const [values, setValues] = useState<number[]>([]);

  // Parse the filter data from the route params
  useEffect(() => {
    // console.log("item", item);
    try {
      const parsedItem = JSON.parse(Array.isArray(item) ? item[0] : item);
      setFilterData(parsedItem);
      const { range: _range, default: defaultValue } = parsedItem.options;
      setRange(_range);

      // Set initial default values based on the filter options
      const initialState = parsedItem.options.returnRange
        ? [defaultValue || _range[0], _range[1]]
        : [defaultValue || _range[0]];
      setValues(initialState);
    } catch (err) {
      console.error("Failed to parse filter data");
    }
  }, [item]);

  // Load saved filters from AsyncStorage
  const getSavedFilter = useCallback(async () => {
    if (!filterData) return;

    try {
      const data = await AsyncStorage.getItem("filters");
      if (!data) return;

      const parsedData: { [key: string]: any } = JSON.parse(data);
      const savedValue = parsedData[filterData.filter_key];

      console.log("savedValue", savedValue);
      if (savedValue) {
        setValues(savedValue);
      }
    } catch (err) {
      console.error("Failed to load saved filters:", err);
    }
  }, [filterData]);

  useEffect(() => {
    if (filterData) {
      getSavedFilter();
    }
  }, [filterData, getSavedFilter]);

  const handleValueChange = async (newValues: number[]) => {
    if (filterData?.options.returnRange && newValues[1] < newValues[0]) {
      newValues[1] = newValues[0];
    }
    setValues(newValues);
  };

  const RenderThumb = React.memo(
    ({ returnRange = false }: { returnRange: boolean }) => {
      const value = returnRange
        ? values?.[1] ?? range[0]
        : values?.[0] ?? range[0];
      return (
        <Slider.Thumb
          key={returnRange ? 1 : 0}
          size={"$3"}
          elevate
          circular
          index={returnRange ? 1 : 0}
        >
          <Text
            fontSize="$4"
            fontWeight="bold"
            color={"white"}
            position="relative"
            y={-40}
          >
            {value}
          </Text>
        </Slider.Thumb>
      );
    }
  );

  if (!filterData) return <></>;

  return (
    <>
      <HeaderWithBack page={filterData.label} />
      <YStack paddingInline={"$4"} flex={1} bg={"$background"}>
        <XStack flex={1} items="center">
          <Slider
            position="relative"
            flex={1}
            size="$4"
            value={values}
            min={range[0]}
            max={range[1]}
            step={range[2]}
            onValueChange={handleValueChange}
            onSlideEnd={async () => {
              const data = await AsyncStorage.getItem("filters");
              const parsedData: { [key: string]: any } = data
                ? JSON.parse(data)
                : {};
              parsedData[filterData.filter_key] = values;
              AsyncStorage.setItem("filters", JSON.stringify(parsedData));
            }}
          >
            <Slider.Track>
              <Slider.TrackActive bg={"$yellow10"} />
            </Slider.Track>
            <RenderThumb returnRange={false} />
            {filterData.options.returnRange && <RenderThumb returnRange />}
          </Slider>
        </XStack>
      </YStack>
    </>
  );
};

export default FilterSlider;

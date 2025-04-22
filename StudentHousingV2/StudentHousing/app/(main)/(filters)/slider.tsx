import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Text, XStack, YStack } from "tamagui";
import { HeaderWithBack } from ".";
import { Filter } from "@/typings";
import { getSavedFilters, saveFilter } from "@/utils/filterUtils";
import { CreationSlider } from "@/components/Inputs/Slider";

const FilterSlider = () => {
  const { item } = useLocalSearchParams();
  if (!item) return null;

  const [filterData, setFilterData] = useState<Filter | null>(null);
  const [range, setRange] = useState<[number, number, number]>([0, 0, 0]);
  const [values, setValues] = useState<number[]>([]);

  // Parse the filter data from the route params
  useEffect(() => {
    try {
      const parsedItem = JSON.parse(
        Array.isArray(item) ? item[0] : item
      ) as Filter;
      setFilterData(parsedItem);

      if (!parsedItem.options.range) {
        console.error("Invalid filter options: range is required for slider");
        return;
      }

      const { range: _range, default: defaultValue } = parsedItem.options;
      setRange(_range);

      // Set initial default values based on the filter options
      const initialState = parsedItem.options.returnRange
        ? [defaultValue || _range[0], _range[1]]
        : [defaultValue || _range[0]];
      setValues(initialState);
    } catch (err) {
      console.error("Failed to parse filter data:", err);
    }
  }, [item]);

  // Load saved filters from AsyncStorage
  const getSavedFilter = useCallback(async () => {
    if (!filterData) return;

    try {
      const savedFilters = await getSavedFilters();
      const savedValue = savedFilters[filterData.filter_key];

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

  if (!filterData) return null;
  return (
    <>
      <HeaderWithBack page={filterData.label} />
      <YStack padding="$4" flex={1} bg="$background">
        <CreationSlider
          min={range[0]}
          max={range[1]}
          step={range[2]}
          value={
            filterData.options.returnRange ? [values[0], values[1]] : values[0]
          }
          prefix={filterData.options.prefix}
          onValueChange={(value) => {
            if (value === undefined) return;

            const valueArray = Array.isArray(value) ? value : [value];
            setValues(valueArray);
            saveFilter(
              filterData.filter_key,
              filterData.options.returnRange ? valueArray : value
            );
          }}
          range={filterData.options.returnRange}
        />
      </YStack>
    </>
  );
};

export default FilterSlider;

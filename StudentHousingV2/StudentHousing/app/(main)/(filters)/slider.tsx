import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Text, Slider, XStack, YStack } from "tamagui";
import { HeaderWithBack } from ".";
import { Filter } from "@/typings";
import { getSavedFilters, saveFilter } from "@/utils/filterUtils";

const FilterSlider: React.FC = () => {
  const { item } = useLocalSearchParams();
  if (!item) return null;

  const [filterData, setFilterData] = useState<Filter | null>(null);
  const [range, setRange] = useState<[number, number, number]>([0, 0, 0]);
  const [values, setValues] = useState<number[]>([]);
  const isMounted = useRef(true);
  const pendingSave = useRef<Promise<void> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

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
    if (!filterData || !isMounted.current) return;

    try {
      const savedFilters = await getSavedFilters();
      const savedValue = savedFilters[filterData.filter_key];

      if (savedValue && isMounted.current) {
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
    if (!isMounted.current) return;

    if (filterData?.options.returnRange && newValues[1] < newValues[0]) {
      newValues[1] = newValues[0];
    }
    setValues(newValues);
  };

  const handleSlideEnd = async () => {
    if (!filterData || !isMounted.current) return;

    // If there's a pending save, wait for it to complete
    if (pendingSave.current) {
      await pendingSave.current;
    }

    // Create a new save operation
    pendingSave.current = saveFilter(filterData.filter_key, values);
    await pendingSave.current;
    pendingSave.current = null;
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
            y={-50}
          >
            {value}
          </Text>
        </Slider.Thumb>
      );
    }
  );

  if (!filterData) return null;

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
            onSlideEnd={handleSlideEnd}
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

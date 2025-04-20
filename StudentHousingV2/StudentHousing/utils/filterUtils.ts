import AsyncStorage from "@react-native-async-storage/async-storage";
import { Filter, FilterState } from "@/typings";
import { useSearchMode } from "@/providers/ViewModeProvider";

// Track ongoing operations to prevent race conditions
const ongoingOperations = new Map<string, Promise<any>>();

// Helper to get the current search mode (for use outside React components)
const getCurrentSearchMode = async (): Promise<
  "flatmate" | "accommodation"
> => {
  try {
    const mode = await AsyncStorage.getItem("searchMode");
    return (mode as "flatmate" | "accommodation") || "flatmate";
  } catch (error) {
    console.error("Error getting search mode:", error);
    return "flatmate";
  }
};

// Get storage key based on search mode
const getFilterStorageKey = async (): Promise<string> => {
  const searchMode = await getCurrentSearchMode();
  return `filters_${searchMode}`;
};

export const getSavedFilters = async (): Promise<FilterState> => {
  const storageKey = await getFilterStorageKey();
  const operationKey = `getSavedFilters_${storageKey}`;

  // If there's an ongoing operation, wait for it to complete
  if (ongoingOperations.has(operationKey)) {
    return ongoingOperations.get(operationKey);
  }

  const operation = (async () => {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error(`Error getting saved filters for ${storageKey}:`, error);
      return {};
    } finally {
      ongoingOperations.delete(operationKey);
    }
  })();

  ongoingOperations.set(operationKey, operation);
  return operation;
};

export const getFilter = async (filter: string): Promise<Filter | null> => {
  try {
    const data = await getSavedFilters();
    return data[filter] || null;
  } catch (error) {
    console.error("Error getting saved filter:", error);
    return null;
  }
};

export const saveFilter = async (
  filterKey: string,
  value: any
): Promise<void> => {
  const storageKey = await getFilterStorageKey();
  const operationKey = `saveFilter-${storageKey}-${filterKey}`;

  // If there's an ongoing operation for this filter, wait for it to complete
  if (ongoingOperations.has(operationKey)) {
    await ongoingOperations.get(operationKey);
  }

  const operation = (async () => {
    try {
      const existingFilters = await getSavedFilters();
      const updatedFilters = {
        ...existingFilters,
        [filterKey]: value,
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedFilters));
    } catch (error) {
      console.error(`Error saving filter to ${storageKey}:`, error);
    } finally {
      ongoingOperations.delete(operationKey);
    }
  })();

  ongoingOperations.set(operationKey, operation);
  return operation;
};

// This function can be used in React components where hooks are available
export const useFiltersBySearchMode = () => {
  const { searchMode } = useSearchMode();

  const getFiltersForCurrentMode = async (): Promise<FilterState> => {
    const storageKey = `filters_${searchMode}`;
    try {
      const data = await AsyncStorage.getItem(storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error(`Error getting filters for ${searchMode}:`, error);
      return {};
    }
  };

  const saveFilterForCurrentMode = async (
    filterKey: string,
    value: any
  ): Promise<void> => {
    const storageKey = `filters_${searchMode}`;
    try {
      const existingFilters = await getFiltersForCurrentMode();
      const updatedFilters = {
        ...existingFilters,
        [filterKey]: value,
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedFilters));
    } catch (error) {
      console.error(`Error saving filter for ${searchMode}:`, error);
    }
  };

  return {
    getFilters: getFiltersForCurrentMode,
    saveFilter: saveFilterForCurrentMode,
    currentMode: searchMode,
  };
};

export const getFilterDescription = (
  filter: Filter,
  savedValue: any
): string => {
  if (savedValue === undefined) return filter.description;

  switch (filter.filter_registry?.type) {
    case "multiSelect":
      const values = Object.entries(savedValue);
      return values
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(", ");
    case "slider":
      return Array.isArray(savedValue)
        ? savedValue.join(" - ")
        : String(savedValue);
    default:
      return typeof savedValue === "object"
        ? Object.keys(savedValue).join(", ")
        : String(savedValue);
  }
};

// Legacy functions for view mode (kept for backward compatibility)
export const getLandlordMode = async (): Promise<boolean> => {
  try {
    const mode = await AsyncStorage.getItem("viewMode");
    return mode === "landlord";
  } catch (error) {
    console.error("Error getting view mode:", error);
    return false;
  }
};

export const setLandlordMode = async (mode: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem("viewMode", mode ? "landlord" : "flatmate");
  } catch (error) {
    console.error("Error setting view mode:", error);
  }
};

// Clear all filters for the current search mode
export const clearFilters = async (): Promise<void> => {
  try {
    const storageKey = await getFilterStorageKey();
    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Error clearing filters:", error);
  }
};

// Get all filters for all search modes (useful for debugging or data migration)
export const getAllFilters = async (): Promise<Record<string, FilterState>> => {
  try {
    const flatmateFilters = await AsyncStorage.getItem("filters_flatmate");
    const accommodationFilters = await AsyncStorage.getItem(
      "filters_accommodation"
    );

    return {
      flatmate: flatmateFilters ? JSON.parse(flatmateFilters) : {},
      accommodation: accommodationFilters
        ? JSON.parse(accommodationFilters)
        : {},
    };
  } catch (error) {
    console.error("Error getting all filters:", error);
    return { flatmate: {}, accommodation: {} };
  }
};

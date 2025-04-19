import AsyncStorage from "@react-native-async-storage/async-storage";
import { Filter, FilterState } from "@/typings";

// Track ongoing operations to prevent race conditions
const ongoingOperations = new Map<string, Promise<any>>();

export const getSavedFilters = async (): Promise<FilterState> => {
  const operationKey = "getSavedFilters";

  // If there's an ongoing operation, wait for it to complete
  if (ongoingOperations.has(operationKey)) {
    return ongoingOperations.get(operationKey);
  }

  const operation = (async () => {
    try {
      const data = await AsyncStorage.getItem("filters");
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Error getting saved filters:", error);
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
    console.error("Error getting saved filters:", error);
    return null;
  }
};

export const saveFilter = async (
  filterKey: string,
  value: any
): Promise<void> => {
  const operationKey = `saveFilter-${filterKey}`;

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
      await AsyncStorage.setItem("filters", JSON.stringify(updatedFilters));
    } catch (error) {
      console.error("Error saving filter:", error);
    } finally {
      ongoingOperations.delete(operationKey);
    }
  })();

  ongoingOperations.set(operationKey, operation);
  return operation;
};

export const getFilterDescription = (
  filter: Filter,
  savedValue: any
): string => {
  if (savedValue === undefined) return filter.description;

  switch (filter.filter_registry.type) {
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

export const getLandlordMode = async (): Promise<boolean> => {
  try {
    const mode = await AsyncStorage.getItem("landlordMode");
    return mode === "true";
  } catch (error) {
    console.error("Error getting landlord mode:", error);
    return false;
  }
};
export const setLandlordMode = async (mode: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem("landlordMode", `${mode}`);
  } catch (error) {
    console.error("Error setting landlord mode:", error);
  }
};

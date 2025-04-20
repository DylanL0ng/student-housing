import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define types for both contexts
type ViewMode = "flatmate" | "landlord";
type SearchMode = "flatmate" | "accommodation";

type ViewModeContextType = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => Promise<void>;
};

type SearchModeContextType = {
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => Promise<void>;
};

// Create a combined context type
type CombinedModeContextType = ViewModeContextType & SearchModeContextType;

// Create the context
const ModeContext = createContext<CombinedModeContextType | undefined>(
  undefined
);

// Custom hook to use the combined context
export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};

// For backward compatibility or specific use cases
export const useViewMode = () => {
  const { viewMode, setViewMode } = useMode();
  return { viewMode, setViewMode };
};

export const useSearchMode = () => {
  const { searchMode, setSearchMode } = useMode();
  return { searchMode, setSearchMode };
};

// Storage keys as constants for consistency
const STORAGE_KEYS = {
  VIEW_MODE: "viewMode",
  SEARCH_MODE: "searchMode",
};

// Generic function to load a value from storage
const loadFromStorage = async <T extends string>(
  key: string,
  defaultValue: T
): Promise<T> => {
  try {
    const storedValue = await AsyncStorage.getItem(key);
    return (storedValue as T) || defaultValue;
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    return defaultValue;
  }
};

// Generic function to save a value to storage
const saveToStorage = async <T extends string>(
  key: string,
  value: T
): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
};

// Combined provider component
export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [viewMode, setViewModeState] = useState<ViewMode>("flatmate");
  const [searchMode, setSearchModeState] = useState<SearchMode>("flatmate");

  // Load initial states from AsyncStorage
  useEffect(() => {
    const loadInitialStates = async () => {
      const storedViewMode = await loadFromStorage<ViewMode>(
        STORAGE_KEYS.VIEW_MODE,
        "flatmate"
      );
      const storedSearchMode = await loadFromStorage<SearchMode>(
        STORAGE_KEYS.SEARCH_MODE,
        "flatmate"
      );

      setViewModeState(storedViewMode);
      setSearchModeState(storedSearchMode);
    };

    loadInitialStates();
  }, []);

  // Functions to update modes
  const setViewMode = async (mode: ViewMode) => {
    await saveToStorage(STORAGE_KEYS.VIEW_MODE, mode);
    setViewModeState(mode);
  };

  const setSearchMode = async (mode: SearchMode) => {
    await saveToStorage(STORAGE_KEYS.SEARCH_MODE, mode);
    setSearchModeState(mode);
  };

  // Combined context value
  const contextValue: CombinedModeContextType = {
    viewMode,
    setViewMode,
    searchMode,
    setSearchMode,
  };

  return (
    <ModeContext.Provider value={contextValue}>{children}</ModeContext.Provider>
  );
};

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ViewMode = "flatmate" | "accommodation";
type SearchMode = "flatmate" | "accommodation";

type ViewModeContextType = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => Promise<void>;
};

type SearchModeContextType = {
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => Promise<void>;
};

type CombinedModeContextType = ViewModeContextType & SearchModeContextType;

const ModeContext = createContext<CombinedModeContextType | undefined>(
  undefined
);

const STORAGE_KEYS = {
  VIEW_MODE: "viewMode",
  SEARCH_MODE: "searchMode",
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};

export const useViewMode = () => {
  const { viewMode, setViewMode } = useMode();
  return { viewMode, setViewMode };
};

export const useSearchMode = () => {
  const { searchMode, setSearchMode } = useMode();
  return { searchMode, setSearchMode };
};

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

export const ModeProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewModeState] = useState<ViewMode>("flatmate");
  const [searchMode, setSearchModeState] = useState<SearchMode>("flatmate");

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const setViewMode = async (mode: ViewMode) => {
    await saveToStorage(STORAGE_KEYS.VIEW_MODE, mode);
    setViewModeState(mode);
  };

  const setSearchMode = async (mode: SearchMode) => {
    await saveToStorage(STORAGE_KEYS.SEARCH_MODE, mode);
    setSearchModeState(mode);
  };

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

import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { SplashScreen } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Alert, AppState } from "react-native";

import * as Location from "expo-location";
import { reducer, State } from "@/reducers/reducer";
import { Conversation } from "@/typings";

interface AuthContextValue {
  session: Session | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface StorageContextValue {
  interests: {};
  state: State;
  dispatch: React.Dispatch<any>;
}

const initialState: State = {
  swipedHistory: [],
  conversations: {},
  interests: [],
};

export const AuthContext = createContext<AuthContextValue | null>(null);
export const StorageContext = createContext<StorageContextValue | null>(null);

SplashScreen.preventAutoHideAsync();

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  // const [interests, setInterests] = useState<[]>([]);
  const [interests_g, setInterests_G] = useState<{}>({});

  // const storage = useContext(StorageContext)

  const [state, dispatch] = useReducer(reducer, initialState);

  const populateGlobalInterestsTable = async (_session: Session) => {
    try {
      if (!session);
      let interests_ = {};
      const { data, error, status } = await supabase
        .from("interests_registry")
        .select(`*`);
      if (error && status !== 406) throw error;
      data?.map((interest) => {
        interests_[interest.interest_id] = interest.label;
      });
      setInterests_G(interests_);
    } catch (error) {
      if (error instanceof Error) {
        // Alert.alert(error.message);
      }
    }
  };

  const getUserInterests = async (_session: Session) => {
    if (!_session) return;
    const { data, error, status } = await supabase
      .from("user_interests")
      .select("interest_id")
      .eq("user_id", _session.user.id);
    if (error && status !== 406) throw error;
    const _interests: string[] = data
      ? data?.map((row) => row.interest_id)
      : [];
    dispatch({ type: "SET_PERSONAL_INTERESTS", payload: _interests });
  };

  const updateLocation = async (_session: Session | null) => {
    if (!_session?.user) return;

    let data = await getCurrentLocation();
    let { longitude, latitude } = data?.coords;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          location: `POINT(${longitude} ${latitude})`,
        })
        .match({ user_id: _session.user.id });

      if (error) {
        throw error;
      }
    } catch (error) {}
  };

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    return location;
  }

  const fetchData = async (_session: Session) => {
    await Promise.all([
      getUserInterests(_session),
      populateGlobalInterestsTable(_session),
    ]);

    SplashScreen.hideAsync();
  };

  useEffect(() => {
    if (!session) return;
    fetchData(session);
    updateLocation(session);
  }, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: _session } }) => {
      setSession(_session);

      if (_session) fetchData(_session);
    });

    supabase.auth.onAuthStateChange((_event, _session) => {
      setSession(_session);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session }}>
      <StorageContext.Provider
        value={{ interests: interests_g, state, dispatch }}
      >
        {children}
      </StorageContext.Provider>
    </AuthContext.Provider>
  );
};

export default AuthProvider;

import supabase from "@/lib/supabase";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./AuthProvider";

type Location = {
  latitude: number;
  longitude: number;
  // range: number;
};

interface ProfileContextType {
  interests: string[];
  globalInterests: string[];
  addInterest: (interest: string) => void;
  removeInterest: (interest: string) => void;
  setInterests: (interestList: string[]) => void;
  getInterestName: (id: string) => string;
  location: Location | null;
  setLocation: (loc: Location) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [interests, _setInterests] = useState<string[]>([]);
  const [globalInterests, setGlobalInterests] = useState<string[]>([]);
  const [interestRegistery, setInterestRegistry] = useState<
    Record<string, string>
  >({});
  const [location, _setLocation] = useState<Location | null>(null);

  const { session } = useAuth();

  // Load interests and profile location
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("interest_registry")
        .select("*");
      if (error) {
        console.error("Error fetching interests:", error);
        return;
      }
      if (data) {
        const registry: Record<string, string> = {};
        data.forEach((interest) => {
          registry[interest.id] = interest.interest;
        });
        setInterestRegistry(registry);
        setGlobalInterests(data.map((interest) => interest.id));
      }

      if (!session?.user.id) return;

      // Load user interests
      const { data: userInterests, error: interestError } = await supabase
        .from("profile_interests")
        .select("interest_id")
        .eq("profile_id", session.user.id);
      if (interestError) {
        console.error("Error fetching user interests:", interestError);
        return;
      }
      if (userInterests) {
        const interestIds = userInterests.map(
          (interest) => interest.interest_id
        );
        _setInterests(interestIds);
      }

      // Load location
      // Load location
      const { data: profile, error: profileError } = await supabase
        .from("profile_locations")
        .select("point")
        .eq("profile_id", session.user.id)
        .single();

      if (!profile || profileError) {
        console.error("Error fetching profile location:", profileError);
        return;
      }

      const { point } = profile;
      const coordinates = point?.coordinates;

      if (
        Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        typeof coordinates[0] === "number" &&
        typeof coordinates[1] === "number"
      ) {
        _setLocation({
          latitude: coordinates[1],
          longitude: coordinates[0],
        });
      } else {
        console.warn("Invalid coordinates format:", coordinates);
      }
    })();
  }, [session?.user.id]);

  // Save interests when changed
  useEffect(() => {
    (async () => {
      if (!session?.user.id) return;

      await supabase
        .from("profile_interests")
        .delete()
        .eq("profile_id", session.user.id);

      await supabase.from("profile_interests").insert(
        interests.map((interest) => ({
          profile_id: session?.user.id,
          interest_id: interest,
        }))
      );
    })();
  }, [interests]);

  // Save location when changed
  useEffect(() => {
    if (!location || !session?.user.id) return;
    (async () => {
      const geoPoint = {
        type: "Point",
        coordinates: [location.longitude, location.latitude], // [lng, lat]
      };

      const { data, error } = await supabase
        .from("profile_locations")
        .update({ point: geoPoint })
        .eq("profile_id", session.user.id);
    })();
  }, [location]);

  // Interest handlers
  const addInterest = (interest: string) => {
    _setInterests((prev) => [...prev, interest]);
  };

  const removeInterest = (interest: string) => {
    _setInterests((prev) => prev.filter((i) => i !== interest));
  };

  const setInterests = (interestList: string[]) => {
    _setInterests(interestList);
  };

  const getInterestName = (id: string) => {
    return interestRegistery[id] || id;
  };

  // Location setter
  const setLocation = (loc: Location) => {
    _setLocation(loc);
  };

  return (
    <ProfileContext.Provider
      value={{
        interests,
        globalInterests,
        addInterest,
        removeInterest,
        setInterests,
        getInterestName,
        location,
        setLocation,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

import supabase from "@/lib/supabase";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./AuthProvider";
import { useViewMode } from "./ViewModeProvider";

type Location = {
  latitude: number;
  longitude: number;
  // range: number;
};

type ProfileType = "flatmate" | "accommodation";

interface ProfileContextType {
  interests: string[];
  globalInterests: string[];
  addInterest: (interest: string) => void;
  removeInterest: (interest: string) => void;
  setInterests: (interestList: string[]) => void;
  getInterestName: (id: string) => string;
  location: Location | null;
  setLocation: (loc: Location) => void;
  profileIds: Record<ProfileType, string>;
  activeProfileId: string | null;
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
  const [profileIds, setProfileIds] = useState<Record<ProfileType, string>>(
    {} as Record<ProfileType, string>
  );

  const [newAccount, setNewAccount] = useState(false);

  const { session } = useAuth();
  const { viewMode } = useViewMode();

  // Calculate the active profile ID based on the current view mode
  const activeProfileId = profileIds[viewMode as ProfileType] || null;

  // Load interests, profile location, and profile IDs
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

      const { data: userProfiles, error: userError } = await supabase
        .from("profile_mapping")
        .select("id, type, created")
        .eq("linked_profile", session.user.id);

      if (userError || !userProfiles || userProfiles.length === 0) {
        return console.error("Error fetching user profiles:", userError);
      }

      // Check if the user has created a profile
      const isNewAccount = userProfiles.some((profile) => !profile.created);

      // Convert the user profiles to object with type as key and id as value
      const profileMapping = userProfiles.reduce((acc, profile) => {
        acc[profile.type as ProfileType] = profile.id;
        return acc;
      }, {} as Record<ProfileType, string>);

      setNewAccount(isNewAccount);
      setProfileIds(profileMapping);
    })();
  }, [session?.user.id]);

  // Load profile data whenever the active profile changes
  useEffect(() => {
    if (!activeProfileId) return;
    if (newAccount) return;
    (async () => {
      // Load user interests for the active profile
      const { data: userInterests, error: interestError } = await supabase
        .from("profile_interests")
        .select("interest_id")
        .eq("profile_id", activeProfileId);

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

      // Load location for the active profile
      const { data: profile, error: profileError } = await supabase
        .from("profile_locations")
        .select("point")
        .eq("profile_id", activeProfileId)
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
  }, [activeProfileId, newAccount]);

  // Save location when changed
  useEffect(() => {
    if (!location || !activeProfileId) return;
    (async () => {
      const geoPoint = {
        type: "Point",
        coordinates: [location.longitude, location.latitude], // [lng, lat]
      };

      const { data, error } = await supabase
        .from("profile_locations")
        .update({ point: geoPoint })
        .eq("profile_id", activeProfileId);

      if (error) {
        console.error("Error updating location:", error);
      }
    })();
  }, [location, activeProfileId]);

  const saveInterests = async (_interests: string[]) => {
    await supabase
      .from("profile_interests")
      .delete()
      .eq("profile_id", activeProfileId);

    await supabase.from("profile_interests").insert(
      _interests.map((interest) => ({
        profile_id: activeProfileId,
        interest_id: interest,
      }))
    );
  };

  // Interest handlers
  const addInterest = (interest: string) => {
    const newInterests = [...interests, interest];
    _setInterests(newInterests);
    saveInterests(newInterests);
  };

  const removeInterest = (interest: string) => {
    const newInterests = interests.filter((i) => i !== interest);
    _setInterests(newInterests);
    saveInterests(newInterests);
  };

  const setInterests = (interestList: string[]) => {
    _setInterests(interestList);
    saveInterests(interestList);
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
        profileIds,
        activeProfileId,
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

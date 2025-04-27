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
import { useRouter } from "expo-router";

type Location = {
  latitude: number;
  longitude: number;
};

interface AmenityOption {
  id: string;
  label: string;
}

type ProfileType = "flatmate" | "accommodation";

interface ProfileContextType {
  interests: string[];
  globalInterests: string[];
  addInterest: (interest: string) => void;
  removeInterest: (interest: string) => void;
  setInterests: (interestList: string[]) => void;
  getInterestName: (id: string) => string;

  amenities: string[];
  globalAmenities: string[];
  addAmenity: (amenity: string) => void;
  removeAmenity: (amenity: string) => void;
  setAmenities: (amenityList: string[]) => void;
  getAmenityName: (id: string) => string;

  location: Location | null;
  setLocation: (loc: Location) => void;
  profileIds: Record<ProfileType, string>;
  activeProfileId: string | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [interests, _setInterests] = useState<string[]>([]);
  const [globalInterests, setGlobalInterests] = useState<string[]>([]);
  const [interestRegistery, setInterestRegistry] = useState<
    Record<string, string>
  >({});

  const [amenities, _setAmenities] = useState<string[]>([]);
  const [globalAmenities, setGlobalAmenities] = useState<string[]>([]);
  const [amenityRegistry, setAmenityRegistry] = useState<
    Record<string, string>
  >({});

  const [location, _setLocation] = useState<Location | null>(null);
  const [profileIds, setProfileIds] = useState<Record<ProfileType, string>>(
    {} as Record<ProfileType, string>
  );

  const [newAccount, setNewAccount] = useState(false);

  const { session } = useAuth();
  const { viewMode } = useViewMode();

  const activeProfileId = profileIds[viewMode as ProfileType] || null;

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("interest_registry")
        .select("*");

      if (error) {
        console.error("Error fetching interests:", error);
      } else if (data) {
        const registry = data.reduce((acc, interest) => {
          if (interest.interest) {
            acc[interest.id] = interest.interest;
          }
          return acc;
        }, {});

        setInterestRegistry(registry);
        setGlobalInterests(data.map((interest) => interest.id));
      }

      const { data: amenityData } = await supabase
        .from("filters")
        .select("*")
        .eq("filter_key", "amenities")
        .maybeSingle();

      if (amenityData) {
        const values = amenityData?.options?.values;

        const registry: Record<string, string> = values.reduce(
          (acc: Record<string, string>, amenity: AmenityOption) => {
            if (amenity.id) {
              acc[amenity.id] = amenity.label;
            }
            return acc;
          },
          {}
        );

        setAmenityRegistry(registry);
        setGlobalAmenities(values.map((amenity: AmenityOption) => amenity.id));
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
      const isNewAccount = userProfiles.filter(
        (profile) => profile.type === viewMode
      )[0]?.created;

      // Convert the user profiles to object with type as key and id as value
      const profileMapping = userProfiles.reduce<Record<ProfileType, string>>(
        (acc, profile) => {
          acc[profile.type as ProfileType] = profile.id;
          return acc;
        },
        {} as Record<ProfileType, string>
      );

      setNewAccount(isNewAccount);
      setProfileIds(profileMapping);
    })();
  }, [session?.user.id]);

  const router = useRouter();

  useEffect(() => {
    if (!activeProfileId) return;
    if (newAccount) return;

    (async () => {
      const { data: userInterests, error: interestError } = await supabase
        .from("profile_interests")
        .select("interest_id")
        .eq("profile_id", activeProfileId);

      if (interestError) {
        console.error("Error fetching user interests:", interestError);
      } else if (userInterests) {
        const interestIds = userInterests.map(
          (interest) => interest.interest_id
        );
        _setInterests(interestIds);
      }

      const { data: userAmenities, error: amenityError } = await supabase
        .from("profile_information")
        .select("value")
        .eq("profile_id", activeProfileId)
        .eq("filter_key", "amenities")
        .single();

      if (userAmenities) {
        const values = userAmenities.value?.data?.value || [];
        const amenityIds = values.map((amenity: AmenityOption) => amenity.id);

        _setAmenities(amenityIds);
      }

      const { data: profile, error: profileError } = await supabase
        .from("profile_locations")
        .select("point")
        .eq("profile_id", activeProfileId)
        .single();

      if (!profile) {
        return router.replace("/(auth)/creation");
      }

      if (profileError) {
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
  }, [activeProfileId, viewMode, newAccount]);

  useEffect(() => {
    if (!location || !activeProfileId) return;
    (async () => {
      const geoPoint = {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      };

      const { error } = await supabase
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

  const setInterests = (interestList: string[], save = true) => {
    _setInterests(interestList);

    if (save) saveInterests(interestList);
  };

  const getInterestName = (id: string) => {
    return interestRegistery[id] || id;
  };

  const saveAmenities = async (_amenities: string[]) => {
    await supabase.from("profile_information").upsert({
      profile_id: activeProfileId,
      key: "amenities",
      value: {
        data: {
          value: _amenities,
        },
      },
    });
  };

  const addAmenity = (amenity: string) => {
    const newAmenities = [...amenities, amenity];

    _setAmenities(newAmenities);
    saveAmenities(newAmenities);
  };

  const removeAmenity = (amenity: string) => {
    const newAmenities = amenities.filter((a) => a !== amenity);
    _setAmenities(newAmenities);
    saveAmenities(newAmenities);
  };

  const setAmenities = (amenityList: string[], save = true) => {
    _setAmenities(amenityList);

    if (save) saveAmenities(amenityList);
  };

  const getAmenityName = (id: string) => {
    return amenityRegistry[id] || id;
  };

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

        amenities,
        globalAmenities,
        addAmenity,
        removeAmenity,
        setAmenities,
        getAmenityName,

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

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

export interface User {
  id: string;
  name: string;
  date_of_birth: string;
  profile: Profile;
}

export interface Profile {
  id: string;
  type: string;
  title: string;
  interests: string[];
  location: string;
  media: string[];
  thumbnail?: string;
}

// Global interest registry cache
let GLOBAL_INTEREST_REGISTRY: Map<string, string> | null = null;

// Centralized client creation with memoization
const createSupabaseClient = (() => {
  let client: ReturnType<typeof createClient> | null = null;
  return () => {
    if (!client) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase credentials not configured");
      }
      client = createClient(supabaseUrl, supabaseAnonKey);
    }
    return client;
  };
})();

// Fetch and cache interest registry
async function getInterestRegistry(supabase): Promise<Map<string, string>> {
  // If already cached, return the cached version
  if (GLOBAL_INTEREST_REGISTRY) {
    return GLOBAL_INTEREST_REGISTRY;
  }

  // Fetch the entire interest registry
  const { data: registryData, error } = await supabase
    .from("interest_registry")
    .select("*");

  if (error) throw new Error(`Interest registry fetch error: ${error.message}`);

  // Create a map for efficient lookup
  GLOBAL_INTEREST_REGISTRY = new Map(
    registryData.map((interest) => [interest.id, interest.interest])
  );

  return GLOBAL_INTEREST_REGISTRY;
}

// Get users data
async function getUsersData(supabase, userIds: string[]) {
  if (!userIds.length) return [];

  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, date_of_birth")
    .in("id", userIds);

  if (error) throw new Error(`Users fetch error: ${error.message}`);
  return data || [];
}

// Batch fetch user profiles with all details
async function fetchUsersProfiles(
  supabase,
  userIds: string[]
): Promise<User[]> {
  if (!userIds || !userIds.length) {
    return [];
  }

  // Execute these fetch operations in parallel for better performance
  const [interestRegistry, profilesData, interestsData] = await Promise.all([
    getInterestRegistry(supabase),
    // Fetch all profiles
    supabase
      .from("profiles")
      .select("*")
      .in("id", userIds)
      .then((res) => {
        if (res.error)
          throw new Error(`Profiles fetch error: ${res.error.message}`);
        return res.data || [];
      }),
    // Batch fetch interests
    supabase
      .from("profile_interests")
      .select("user_id, interest_id")
      .in("user_id", userIds)
      .then((res) => {
        if (res.error)
          throw new Error(`Interests fetch error: ${res.error.message}`);
        return res.data || [];
      }),
    // Fetch user data
    // getUsersData(supabase, userIds),
  ]);

  // Group interests by user_id for efficient access
  const userInterests = interestsData.reduce((acc, interest) => {
    if (!acc[interest.user_id]) {
      acc[interest.user_id] = [];
    }
    const interestLabel = interestRegistry.get(interest.interest_id);
    if (interestLabel) {
      acc[interest.user_id].push(interestLabel);
    }
    return acc;
  }, {});

  // Create a map of profile data by ID
  const profileDataMap = profilesData.reduce((acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {});

  // Batch fetch media URLs (in parallel for each user)
  const mediaResults = await Promise.all(
    userIds.map(async (id) => {
      try {
        const { data: mediaData, error: mediaError } = await supabase.storage
          .from("profile-images")
          .list(id);

        if (mediaError) return { id, urls: [] };

        // Process all media URLs in parallel
        const urls = await Promise.all(
          (mediaData || []).map(async (media) => {
            const { data: publicData } = await supabase.storage
              .from("profile-images")
              .getPublicUrl(`${id}/${media.name}`);

            return publicData.publicUrl;
          })
        );

        return { id, urls };
      } catch (e) {
        console.error(`Error fetching media for user ${id}:`, e);
        return { id, urls: [] };
      }
    })
  );

  // Create a map of media URLs by user ID
  const mediaUrlsMap = mediaResults.reduce((acc, item) => {
    acc[item.id] = item.urls;
    return acc;
  }, {});

  // Construct the final user profiles
  const userProfiles = userIds
    .map((id) => {
      const profileData = profileDataMap[id];

      if (!profileData) {
        return null; // Skip users with missing data
      }

      return {
        id: id,
        name: profileData.full_name,
        profile: {
          id: id,
          type: profileData.type || "flatmate",
          title: profileData.full_name,
          interests: userInterests[id] || [],
          location: profileData.location || "",
          media: mediaUrlsMap[id] || [],
          thumbnail: profileData.thumbnail,
        },
      };
    })
    .filter(Boolean); // Remove null entries

  return userProfiles;
}

// Main request handler
Deno.serve(async (req) => {
  // CORS preflight handling
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const supabase = createSupabaseClient();

  try {
    // Validate request
    const { users } = await req.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Valid user IDs array is required",
          code: "INVALID_USER_IDS",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Fetch and return all user profiles
    const usersProfiles = await fetchUsersProfiles(supabase, users);

    return new Response(JSON.stringify(usersProfiles), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Profiles fetch error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        code: "PROFILES_FETCH_ERROR",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

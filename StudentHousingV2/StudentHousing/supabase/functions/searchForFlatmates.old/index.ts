import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

export interface User {
  id: string;
  name: string;
  date_of_birth: string;
  profile: Profile;
}

// missing data
// name
// dob
// profile -> title

export interface Profile {
  id: string;
  type: string;
  title: string;
  interests: string[];
  location: string;
  media: string[];
  thumbnail?: string;
}

// interface InterestRegistry {
//   id: string;
//   label: string;
// }

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

  // console.log("Interest registry loaded:");
  // console.log(GLOBAL_INTEREST_REGISTRY);

  return GLOBAL_INTEREST_REGISTRY;
}

// Batch fetch user profiles with all details
async function fetchAllUserProfiles(
  supabase,
  currentUserId: string
): Promise<User[]> {
  // Fetch interest registry
  const interestRegistry = await getInterestRegistry(supabase);

  // Fetch all profiles except the current user
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", currentUserId);

  if (profilesError)
    throw new Error(`Profiles fetch error: ${profilesError.message}`);

  // Batch fetch interests
  const { data: interestsData, error: interestsError } = await supabase
    .from("profile_interests")
    .select("user_id, interest_id")
    .in(
      "user_id",
      profilesData.map((profile) => profile.id)
    );

  if (interestsError)
    throw new Error(`Interests fetch error: ${interestsError.message}`);

  // Batch fetch media URLs
  const mediaResults = await Promise.all(
    profilesData.map(async (profile) => {
      const { data: mediaData, error: mediaError } = await supabase.storage
        .from("profile-images")
        .list(profile.id);

      if (mediaError) return { id: profile.id, urls: [] };

      const urls = await Promise.all(
        (mediaData || []).map(async (media) => {
          const { data: publicData, error: publicError } = supabase.storage
            .from("profile-images")
            .getPublicUrl(`${profile.id}/${media.name}`);

          return publicData.publicUrl;
        })
      );

      return { id: profile.id, urls };
    })
  );

  // console.log("Media results:");
  // console.log(mediaResults);
  // Construct user profiles
  const userProfiles = profilesData.map((profileData) => {
    // Process interests - map interest IDs to labels using the registry
    const interests = (interestsData || [])
      .filter((i) => i.user_id === profileData.id)
      .map((i) => interestRegistry.get(i.interest_id) || "");
    // .filter((label) => label !== "");
    // console.log("Interests for user", profileData.id, interests);

    // Find media URLs for this user
    const mediaUrls =
      mediaResults.find((m) => m.id === profileData.id)?.urls || [];

    // console.log("Media for user", profileData.id, mediaUrls);
    return {
      id: profileData.id,
      name: profileData.full_name,
      date_of_birth: profileData.date_of_birth,
      profile: {
        id: profileData.id,
        type: profileData.type || "flatmate",
        title: profileData.full_name,
        interests,
        location: profileData.location || "",
        media: mediaUrls,
        thumbnail: profileData.thumbnail,
      },
    };
  });

  // console.log("User profiles:");
  // console.log(userProfiles);
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
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const supabase = createSupabaseClient();

  try {
    // Validate request
    const { id } = await req.json();
    if (!id) {
      throw new Error("User ID is required");
    }

    // Fetch and return all user profiles except the current user
    const userProfiles = await fetchAllUserProfiles(supabase, id);

    return new Response(JSON.stringify(userProfiles), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        // "Cache-Control": "max-age=3600", // Optional: add caching
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
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

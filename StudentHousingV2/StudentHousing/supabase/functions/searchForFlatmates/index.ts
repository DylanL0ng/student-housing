import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface Profile {
  id: string;
  interests: string[];
  full_name: string;
  type: string;
  locations: {
    city: string;
    point: { coordinates: [number, number] };
    distance: number;
  }[];
}

let GLOBAL_INTEREST_REGISTRY: Map<string, string> | null = null;

// Centralized client creation with memoization
const createSupabaseClient = (() => {
  let client: any = null;
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
async function getInterestRegistry(supabase: any) {
  if (GLOBAL_INTEREST_REGISTRY) {
    return GLOBAL_INTEREST_REGISTRY;
  }

  const { data: registryData, error } = await supabase
    .from("interest_registry")
    .select("*");
  if (error) throw new Error(`Interest registry fetch error: ${error.message}`);

  GLOBAL_INTEREST_REGISTRY = new Map(
    registryData.map((interest: { id: string; interest: string }) => [
      interest.id,
      interest.interest,
    ])
  );
  return GLOBAL_INTEREST_REGISTRY;
}

// Batch fetch user profiles with all details
async function fetchAllUserProfiles(supabase: any, currentUserId: string) {
  const interestRegistry = await getInterestRegistry(supabase);

  // Fetch user profiles
  const { data: profilesData, error: profilesError } = await supabase.rpc(
    "fetchUserProfiles",
    {
      target_id: currentUserId,
    }
  );

  // console.log("Fetching profile data for user:", currentUserId, profilesData);

  if (profilesError) {
    console.error(`Profiles fetch error: ${profilesError.message}`);
    return []; // Return an empty array if there was an error fetching profiles
  }

  // Ensure profilesData is not null or undefined before proceeding
  if (!profilesData || profilesData.length === 0) {
    return []; // Return an empty array if no profiles data is available
  }

  // Batch fetch media URLs and filter users with no media
  const mediaResults = await Promise.all(
    profilesData.map(async (profile: { id: string }) => {
      const { data: mediaData, error: mediaError } = await supabase.storage
        .from("profile-images")
        .list(profile.id);

      if (mediaError || !mediaData || mediaData.length === 0) {
        return null; // Skip profiles with no media
      }

      const urls = await Promise.all(
        mediaData.map(async (media: { name: string }) => {
          const { data: publicData, error: publicError } =
            await supabase.storage
              .from("profile-images")
              .getPublicUrl(`${profile.id}/${media.name}`);
          if (publicError) {
            console.error(
              `Error fetching public URL for media: ${media.name}`,
              publicError
            );
            return null;
          }
          return publicData.publicUrl;
        })
      );

      if (urls.filter((url) => url !== null).length === 0) {
        return null; // Skip profile if no media URLs are found
      }

      return {
        id: profile.id,
        urls: urls.filter((url) => url !== null),
      };
    })
  );

  // Create a hashmap for faster access to media URLs
  const mediaMap = mediaResults.reduce((acc, result) => {
    if (result) {
      acc[result.id] = result.urls;
    }
    return acc;
  }, {});

  // Construct user profiles with interests and media data
  const userProfiles = profilesData
    .filter((profileData: Profile) => {
      // Only keep profiles that have media
      return mediaMap[profileData.id];
    })
    .map((profileData: Profile) => {
      // Map interests using the pre-built registry
      const interests = (profileData.interests || []).map(
        (interestId) => interestRegistry.get(interestId) || ""
      );

      // Get the media URLs for the user from the mediaMap
      const mediaUrls = mediaMap[profileData.id];

      return {
        id: profileData.id,
        name: profileData.full_name,
        profile: {
          id: profileData.id,
          type: profileData.type || "flatmate",
          title: profileData.full_name,
          interests,
          location: {
            city: profileData.locations[0].city || "unknown",
            point: {
              longitude: profileData.locations[0].point.coordinates[0] || 0,
              latitude: profileData.locations[0].point.coordinates[1] || 0,
            },
            distance: profileData.locations[0].distance || 0,
          },
          media: mediaUrls,
        },
      };
    });

  return userProfiles;
}

// Main request handler
Deno.serve(async (req: { method: string; json: () => { id: string } }) => {
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
    const { id } = await req.json();
    if (!id) {
      throw new Error("User ID is required");
    }

    const userProfiles = await fetchAllUserProfiles(supabase, id);
    return new Response(JSON.stringify(userProfiles), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: { message: string }) {
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

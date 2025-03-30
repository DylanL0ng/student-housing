import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

const getConnections = async (supabase, userId) => {
  const { data, error } = await supabase.rpc("get_matched_users", {
    input_user_id: userId,
  });

  if (error) {
    console.error("Error fetching connected profiles:", error);
    return;
  }
  if (!data) return;

  // Batch fetch media URLs and filter users with no media
  const mediaResults = await Promise.all(
    data.map(async (user: { user_id: string }) => {
      const { data: mediaData, error: mediaError } = await supabase.storage
        .from("profile-images")
        .list(user.user_id);

      console.log("Fetching media data for user:", user.user_id, mediaData);

      if (mediaError || !mediaData || mediaData.length === 0) {
        return null; // Skip profiles with no media
      }

      const urls = await Promise.all(
        mediaData.map(async (media: { name: string }) => {
          const { error: profileError, data: profileData } =
            await supabase.storage
              .from("profile-images")
              .getPublicUrl(`${user.user_id}/${media.name}`);

          if (profileError) {
            console.error(
              `Error fetching public URL for media: ${media.name}`,
              profileError
            );
            return null;
          }

          const publicUrl = profileData?.publicUrl;
          console.log("FOUND URL", publicUrl);

          return publicUrl;
        })
      );

      console.log("Fetched media URLs for user:", user.user_id, urls);
      return {
        id: user.user_id,
        urls: urls,
      };
    })
  );

  console.log("Full data:", data);
  console.log("Media results:", mediaResults);

  // Map over users to embed the media in the profile field
  const users = data.map((user) => ({
    ...user,
    profile: {
      ...user.profile, // Spread existing profile properties
      media:
        mediaResults.find((media) => media.id === user.user_id)?.urls || [], // Add media to the profile
    },
  }));

  console.log("FINAL USERS", users);

  return users;
};

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
    const { userId } = await req.json();

    const getConnectionsResult = await getConnections(supabase, userId);

    return new Response(JSON.stringify(getConnectionsResult), {
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

// // Main request handler
// Deno.serve(async (req) => {
//   // CORS preflight handling
//   if (req.method === "OPTIONS") {
//     return new Response("ok", {
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, Authorization",
//       },
//     });
//   }

//   const supabase = createSupabaseClient();

//   try {
//     // Validate request
//     const { users } = await req.json();

//     if (!users || !Array.isArray(users) || users.length === 0) {
//       return new Response(
//         JSON.stringify({
//           error: "Valid user IDs array is required",
//           code: "INVALID_USER_IDS",
//         }),
//         {
//           status: 400,
//           headers: {
//             "Content-Type": "application/json",
//             "Access-Control-Allow-Origin": "*",
//           },
//         }
//       );
//     }

//     // Fetch and return all user profiles
//     const usersProfiles = await fetchUsersProfiles(supabase, users);

//     return new Response(JSON.stringify(usersProfiles), {
//       headers: {
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": "*",
//         "Cache-Control": "max-age=300", // Cache for 5 minutes
//       },
//     });
//   } catch (error) {
//     console.error("Profiles fetch error:", error);
//     return new Response(
//       JSON.stringify({
//         error: error.message,
//         code: "PROFILES_FETCH_ERROR",
//       }),
//       {
//         status: 500,
//         headers: {
//           "Content-Type": "application/json",
//           "Access-Control-Allow-Origin": "*",
//         },
//       }
//     );
//   }
// });

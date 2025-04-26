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

    if (!userId) {
      throw new Error("User ID is required");
    }

    const { data: profileData, profileError } = await supabase.rpc(
      "get_profile_data",
      {
        profile_id: userId,
      }
    );
    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      return new Response(
        JSON.stringify({
          error: profileError.message,
          code: "PROFILE_DATA_ERROR",
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
    if (!profileData) {
      return new Response(
        JSON.stringify({
          error: "No profile data found",
          code: "NO_PROFILE_DATA",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const { data: mediaData, error: mediaError } = await supabase.storage
      .from("profile-images")
      .list(profileData.id);

    if (mediaError || !mediaData || mediaData.length === 0) {
      return null; // Skip profiles with no media
    }

    const urls = await Promise.all(
      mediaData.map(async (media: { name: string }) => {
        const { data: publicData, error: publicError } = await supabase.storage
          .from("profile-images")
          .getPublicUrl(`${profileData.id}/${media.name}`);
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

    if (!urls || urls.length === 0)
      return new Response(
        JSON.stringify({
          error: "No media URLs found",
          code: "NO_MEDIA_URLS",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

    const profileClass = {
      id: profileData.id,
      name: profileData.full_name,
      profile: {
        id: profileData.id,
        type: profileData.type || "flatmate",
        title: profileData.title,
        interests: profileData.interests || [],
        location: profileData.location || "",
        media: urls,
      },
    };

    return new Response(JSON.stringify(profileClass), {
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

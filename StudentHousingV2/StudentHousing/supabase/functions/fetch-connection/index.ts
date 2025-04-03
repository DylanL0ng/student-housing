import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

export interface Profile {
  id: string;
  type: string;
  title: string;
  interests: string[];
  location: {
    city: string;
    point: { longitude: number; latitude: number };
    distance?: number;
  };
  media: string[];
}
export interface Conversation {
  profile: Profile;
  id: string;
  latest_message: string;
  has_conversation: boolean;
  conversation_members: string[];
}

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

const getUserData = async (supabase, userId: string) => {
  const { data, error } = await supabase.rpc("get_user_data_by_id", {
    input_user_id: userId,
  });

  if (error) {
    console.error("Error fetching user data:", error);
    return;
  }
  return data;
};

const getMediaUrls = async (supabase, userId: string) => {
  const { data: mediaData, error: mediaError } = await supabase.storage
    .from("profile-images")
    .list(userId);

  if (mediaError || !mediaData || mediaData.length === 0) {
    return [];
  }

  const urls = await Promise.all(
    mediaData.map(async (media: { name: string }) => {
      const { error: profileError, data: profileData } = await supabase.storage
        .from("profile-images")
        .getPublicUrl(`${userId}/${media.name}`);

      if (profileError) {
        console.error(
          `Error fetching public URL for media: ${media.name}`,
          profileError
        );
        return null;
      }

      return profileData?.publicUrl;
    })
  );

  return urls.filter((url) => url !== null); // Filter out any null URLs
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

    const userDataResult = await getUserData(supabase, userId);
    // console.log("User data result:", userDataResult);
    const mediaUrls = await getMediaUrls(supabase, userId);

    // Map the response data to the desired structure
    const responseData: Conversation = {
      profile: {
        id: userDataResult.user_id,
        type: userDataResult.profile.type,
        title: userDataResult.profile.title,
        interests: userDataResult.profile.interests,
        location: {
          city: userDataResult.profile.city,
          point: {
            longitude: userDataResult.profile.point.coordinates[0],
            latitude: userDataResult.profile.point.coordinates[1],
          },
        },
        media: mediaUrls,
      },
      id: userDataResult.user_id,
      latest_message: userDataResult.latest_message,
      has_conversation: userDataResult.has_conversation,
      conversation_members: userDataResult.conversation_members,
    };

    // console.log("Response data:", responseData);

    return new Response(JSON.stringify(responseData), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("User data fetch error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        code: "USER_DATA_FETCH_ERROR",
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

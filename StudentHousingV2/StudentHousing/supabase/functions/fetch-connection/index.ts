import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
const createSupabaseClient = (()=>{
  let client = null;
  return ()=>{
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
const getUserData = async (supabase, userId)=>{
  const { data, error } = await supabase.rpc("getUserProfile", {
    user_id: userId
  });
  data.location = data.locations[0];
  if (error) {
    console.error("Error fetching user data:", error);
    return;
  }
  return data;
};
const getMediaUrls = async (supabase, userId)=>{
  const { data: mediaData, error: mediaError } = await supabase.storage.from("profile-images").list(userId);
  if (mediaError || !mediaData || mediaData.length === 0) {
    return [];
  }
  const urls = await Promise.all(mediaData.map(async (media)=>{
    const { error: profileError, data: profileData } = await supabase.storage.from("profile-images").getPublicUrl(`${userId}/${media.name}`);
    if (profileError) {
      console.error(`Error fetching public URL for media: ${media.name}`, profileError);
      return null;
    }
    return profileData?.publicUrl;
  }));
  return urls.filter((url)=>url !== null); // Filter out any null URLs
};
Deno.serve(async (req)=>{
  // CORS preflight handling
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  const supabase = createSupabaseClient();
  try {
    const { userId } = await req.json();
    const userDataResult = await getUserData(supabase, userId);
    const mediaUrls = await getMediaUrls(supabase, userId);
    // Map the response data to the desired structure
    const responseData = {
      profile: {
        id: userDataResult.id,
        type: userDataResult.type,
        title: userDataResult.title,
        interests: userDataResult.interests,
        information: userDataResult.profile_information,
        location: {
          city: userDataResult.location.city,
          point: {
            longitude: userDataResult.location.point.coordinates[0],
            latitude: userDataResult.location.point.coordinates[1]
          }
        },
        media: mediaUrls
      },
      id: userDataResult.id,
      latest_message: userDataResult.latest_message,
      has_conversation: userDataResult.has_conversation,
      conversation_members: userDataResult.conversation_members
    };
    console.log("Response data:", responseData);
    return new Response(JSON.stringify(responseData), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "max-age=300"
      }
    });
  } catch (error) {
    console.error("User data fetch error:", error);
    return new Response(JSON.stringify({
      error: error.message,
      code: "USER_DATA_FETCH_ERROR"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});

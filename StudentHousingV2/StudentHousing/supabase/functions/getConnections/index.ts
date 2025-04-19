import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getConnectedUsers } from "../_utils/supabase.ts";
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
  try {
    const { userId } = await req.json();
    const matchedUsersData = await getConnectedUsers(userId, {
      minimal: true
    });
    return new Response(JSON.stringify(matchedUsersData), {
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

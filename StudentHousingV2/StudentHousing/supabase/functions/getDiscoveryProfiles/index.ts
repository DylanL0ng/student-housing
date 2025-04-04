import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getDiscoveryProfiles } from "../_utils/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  try {
    const { id, filters } = await req.json();
    if (!id) {
      throw new Error("User ID is required");
    }

    const userProfiles = await getDiscoveryProfiles(id, filters);
    return new Response(JSON.stringify(userProfiles), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
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

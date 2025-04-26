import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getDiscoveryProfiles } from "../_utils/supabase.ts";

Deno.serve(async (req) => {
  try {
    const { sourceId, filters, type } = await req.json();
    if (!sourceId) {
      return new Response(
        JSON.stringify({ status: "error", response: "sourceId is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const { status, response } = await getDiscoveryProfiles(
      sourceId,
      filters,
      type
    );
    return new Response(JSON.stringify({ status, response }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ status: "error", response: "FETCH_PROFILE_ERROR" }),
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

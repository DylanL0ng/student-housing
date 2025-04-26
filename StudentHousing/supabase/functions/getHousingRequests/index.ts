import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getHousingRequests } from "../_utils/supabase.ts";

Deno.serve(async (req) => {
  try {
    const { sourceId } = await req.json();
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

    const { status, response } = await getHousingRequests(sourceId);
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

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getHousingRequests, createResponse } from "../_utils/supabase.ts";

Deno.serve(async (req) => {
  try {
    const { sourceId } = await req.json();

    // Validate input parameters
    if (!sourceId) {
      return createResponse("error", "sourceId is required");
    }

    const { status, response } = await getHousingRequests(sourceId);
    return createResponse(status === "success" ? "success" : "error", response);
  } catch (error) {
    return createResponse(
      "error",
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
});

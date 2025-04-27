import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getDiscoveryProfiles, createResponse } from "../_utils/supabase.ts";

Deno.serve(async (req) => {
  try {
    const { sourceId, filters, type } = await req.json();
    if (!sourceId) {
      return createResponse("error", "Source ID is required");
    }
    if (!type) {
      return createResponse("error", "Type is required");
    }

    const { status, response } = await getDiscoveryProfiles(
      sourceId,
      filters,
      type
    );

    return createResponse(status === "success" ? "success" : "error", response);
  } catch (error) {
    return createResponse(
      "error",
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
});

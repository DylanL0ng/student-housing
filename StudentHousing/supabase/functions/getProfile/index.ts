import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getUserData, createResponse } from "../_utils/supabase.ts";
Deno.serve(async (req) => {
  try {
    const { userId, sourceId, minimal, mode } = await req.json();

    // Validate input parameters
    if (!userId) {
      return createResponse("error", "User ID is required");
    }

    const userDataResult = await getUserData([userId], {
      minimal,
      sourceId,
      type: mode,
    });

    return createResponse("success", userDataResult);
  } catch (error) {
    return createResponse(
      "error",
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
});

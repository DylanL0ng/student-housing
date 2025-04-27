import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getConnectedUsers, createResponse } from "../_utils/supabase.ts";

Deno.serve(async (req) => {
  try {
    const { userId, mode } = await req.json();

    // Validate input parameters
    if (!userId) {
      return createResponse("error", "User ID is required");
    }

    // get the connected users
    const matchedUsersData = await getConnectedUsers(userId, {
      minimal: true,
      mode,
    });

    return createResponse(
      matchedUsersData?.status === "success" ? "success" : "error",
      matchedUsersData?.response
    );
  } catch (error) {
    return createResponse(
      "error",
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
});

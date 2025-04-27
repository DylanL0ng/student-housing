import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { likeUser, dislikeUser, createResponse } from "../_utils/supabase.ts";

Deno.serve(async (req) => {
  try {
    const { targetId, sourceId, type, mode } = await req.json();
    // Validate input parameters
    if (!targetId) {
      return createResponse("error", "User ID is required");
    }

    if (!sourceId) {
      return createResponse("error", "Source ID is required");
    }

    if (!type) {
      return createResponse("error", "Type is required");
    }

    if (!mode) {
      return createResponse("error", "Mode is required");
    }

    if (!["like", "dislike"].includes(type)) {
      return createResponse("error", "Type must be 'like' or 'dislike'");
    }

    let response;
    if (type === "like") {
      response = await likeUser(targetId, sourceId, mode);
    } else if (type === "dislike") {
      response = await dislikeUser(targetId, sourceId, mode);
    }

    return createResponse(
      response?.status === "success" ? "success" : "error",
      response?.response
    );
  } catch (error) {
    return createResponse(
      "error",
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
});

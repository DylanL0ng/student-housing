import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { likeUser, dislikeUser } from "../_utils/supabase.ts";

Deno.serve(async (req) => {
  try {
    const { targetId, sourceId, type } = await req.json();
    // console.log("Received interaction:", { targetId, sourceId, type });
    if (!targetId) {
      return new Response(
        JSON.stringify({ status: "error", response: "User ID is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (!sourceId) {
      return new Response(
        JSON.stringify({ status: "error", response: "Source is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (!type) {
      return new Response(
        JSON.stringify({ status: "error", response: "Type is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (!["like", "dislike"].includes(type)) {
      return new Response(
        JSON.stringify({ status: "error", response: "Invalid type" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // console.log("Processing interaction:", { targetId, sourceId, type });
    let response;
    if (type === "like") {
      response = await likeUser(targetId, sourceId);
    } else if (type === "dislike") {
      response = await dislikeUser(targetId, sourceId);
    }

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "max-age=300",
      },
    });
  } catch (error) {
    console.error("User data fetch error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        code: "USER_DATA_FETCH_ERROR",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

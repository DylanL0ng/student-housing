import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getUserData } from "../_utils/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { userId, minimal, mode } = await req.json();
    const userDataResult = await getUserData([userId], { minimal, mode });

    return new Response(JSON.stringify(userDataResult), {
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

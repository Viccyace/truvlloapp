import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveCorsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

const ADMIN_ID = "7ec55e7e-6270-436c-bfc9-323ea8971e7a";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = resolveCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user } = await requireAuth(req);
    if (user.id !== ADMIN_ID) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [
      plansRes,
      dailyRes,
      featuresRes,
      atRiskRes,
      categoriesRes,
      recentUsersRes,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("plan, trial_activated, whatsapp_number, created_at"),
      supabase
        .from("expenses")
        .select("user_id, created_at")
        .gte(
          "created_at",
          new Date(Date.now() - 14 * 86400000).toISOString(),
        ),
      supabase
        .from("expenses")
        .select("user_id, created_at")
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
      supabase
        .from("profiles")
        .select("id, email, first_name, trial_ends_at, whatsapp_number")
        .eq("plan", "trial")
        .lte(
          "trial_ends_at",
          new Date(Date.now() + 3 * 86400000).toISOString(),
        )
        .gte("trial_ends_at", new Date().toISOString()),
      supabase
        .from("expenses")
        .select("category")
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 86400000).toISOString(),
        ),
      supabase
        .from("profiles")
        .select("id, email, first_name, plan, created_at, trial_activated")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const error =
      plansRes.error ||
      dailyRes.error ||
      featuresRes.error ||
      atRiskRes.error ||
      categoriesRes.error ||
      recentUsersRes.error;

    if (error) {
      console.error("[admin-metrics] query error", error);
      return new Response(
        JSON.stringify({ error: error.message || "Query failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        plans: plansRes.data,
        daily: dailyRes.data,
        features: featuresRes.data,
        atRisk: atRiskRes.data,
        categories: categoriesRes.data,
        recentUsers: recentUsersRes.data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[admin-metrics] error", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

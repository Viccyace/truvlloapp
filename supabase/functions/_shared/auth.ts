// supabase/functions/_shared/auth.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

export async function requireAuth(req: Request, feature?: string) {
  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!jwt) {
    throw new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: CORS,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data, error } = await supabase.auth.getUser(jwt);
  if (error || !data.user) {
    throw new Response(
      JSON.stringify({ error: "Invalid or expired session" }),
      { status: 401, headers: CORS },
    );
  }

  const user = data.user;

  if (feature) {
    // Get user plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const plan = (profile?.plan ?? "free") as string;

    // Free users blocked entirely
    if (plan === "free") {
      throw new Response(
        JSON.stringify({
          error: "Upgrade to Premium to use AI features",
          upgrade: true,
        }),
        { status: 429, headers: CORS },
      );
    }

    // Trial users — check daily limit
    if (plan === "trial") {
      const limit =
        feature === "nl_entry"
          ? 10
          : feature === "smart_categorise"
            ? 20
            : feature === "bank_import"
              ? 999 // monthly handled separately
              : 5;

      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("ai_usage")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("feature", feature)
        .gte("created_at", dayStart.toISOString());

      if ((count ?? 0) >= limit) {
        throw new Response(
          JSON.stringify({
            error: `Daily limit reached (${count}/${limit}). Resets tomorrow.`,
          }),
          { status: 429, headers: CORS },
        );
      }
    }

    // Bank import monthly limit
    if (feature === "bank_import") {
      const monthlyLimit = plan === "premium" ? 20 : 3;
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("ai_usage")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("feature", feature)
        .gte("created_at", monthStart.toISOString());

      if ((count ?? 0) >= monthlyLimit) {
        throw new Response(
          JSON.stringify({
            error: `Monthly import limit reached (${count}/${monthlyLimit}).`,
          }),
          { status: 429, headers: CORS },
        );
      }
    }
  }

  return { user, supabase };
}

export async function logUsage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  feature: string,
) {
  await supabase
    .from("ai_usage")
    .insert({ user_id: userId, feature })
    .then(
      () => {},
      (e: unknown) => console.error("[logUsage]", e),
    );
}

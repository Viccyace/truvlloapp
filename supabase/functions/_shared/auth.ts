// supabase/functions/_shared/auth.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared auth + rate limiting for all AI Edge Functions.
//
// Usage in any Edge Function:
//   const { user, supabase } = await requireAuth(req, "spending_analyst");
//
// This single call:
//   1. Verifies the JWT
//   2. Checks plan-based rate limits
//   3. Returns 429 with a clear message if over limit
//   4. Call logUsage(supabase, user.id, feature) after successful Claude call
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Plan limits ───────────────────────────────────────────────────────────────
const PLAN_LIMITS: Record<
  string,
  Record<string, { daily: number | null; monthly: number | null }>
> = {
  free: {
    spending_analyst: { daily: 0, monthly: 0 },
    savings_coach: { daily: 0, monthly: 0 },
    nl_entry: { daily: 0, monthly: 0 },
    smart_categorise: { daily: 0, monthly: 0 },
    budget_advisor: { daily: 0, monthly: 0 },
    overspend_explainer: { daily: 0, monthly: 0 },
    bank_import: { daily: 0, monthly: 0 },
  },
  trial: {
    spending_analyst: { daily: 5, monthly: null },
    savings_coach: { daily: 5, monthly: null },
    nl_entry: { daily: 10, monthly: null },
    smart_categorise: { daily: 20, monthly: null },
    budget_advisor: { daily: 3, monthly: null },
    overspend_explainer: { daily: 5, monthly: null },
    bank_import: { daily: null, monthly: 3 },
  },
  premium: {
    spending_analyst: { daily: null, monthly: null },
    savings_coach: { daily: null, monthly: null },
    nl_entry: { daily: null, monthly: null },
    smart_categorise: { daily: null, monthly: null },
    budget_advisor: { daily: null, monthly: null },
    overspend_explainer: { daily: null, monthly: null },
    bank_import: { daily: null, monthly: 20 },
  },
};

// ── requireAuth ───────────────────────────────────────────────────────────────
export async function requireAuth(req: Request, feature?: string) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!jwt)
    throw new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: corsHeaders,
    });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(jwt);
  if (error || !user)
    throw new Response(
      JSON.stringify({
        error: "Invalid or expired session. Please log in again.",
      }),
      { status: 401, headers: corsHeaders },
    );

  // ── Rate limit check ──────────────────────────────────────────────────────
  if (feature) {
    const limitResult = await checkRateLimit(supabase, user.id, feature);
    if (!limitResult.allowed) {
      throw new Response(
        JSON.stringify({
          error: limitResult.reason,
          upgrade: limitResult.upgrade ?? false,
          limits: limitResult.limits,
        }),
        { status: 429, headers: corsHeaders },
      );
    }
  }

  return { user, supabase };
}

// ── checkRateLimit ────────────────────────────────────────────────────────────
async function checkRateLimit(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string,
  feature: string,
): Promise<{
  allowed: boolean;
  reason?: string;
  upgrade?: boolean;
  limits?: object;
}> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const plan = profile?.plan ?? "free";
  const limits =
    PLAN_LIMITS[plan]?.[feature] ??
    PLAN_LIMITS.free[feature as keyof typeof PLAN_LIMITS.free];

  if (!limits) return { allowed: true };

  // Blocked entirely
  if (limits.daily === 0 || limits.monthly === 0) {
    return {
      allowed: false,
      reason: "Upgrade to Premium to use AI features",
      upgrade: true,
      limits: { daily_limit: 0, monthly_limit: 0 },
    };
  }

  const now = new Date();
  const dayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  // Check daily limit
  if (limits.daily !== null) {
    const { count: dailyCount } = await supabase
      .from("ai_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("feature", feature)
      .gte("created_at", dayStart);

    if ((dailyCount ?? 0) >= limits.daily) {
      return {
        allowed: false,
        reason: `Daily limit reached (${dailyCount}/${limits.daily}). Resets tomorrow.`,
        limits: { daily_count: dailyCount, daily_limit: limits.daily },
      };
    }
  }

  // Check monthly limit
  if (limits.monthly !== null) {
    const { count: monthlyCount } = await supabase
      .from("ai_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("feature", feature)
      .gte("created_at", monthStart);

    if ((monthlyCount ?? 0) >= limits.monthly) {
      return {
        allowed: false,
        reason: `Monthly limit reached (${monthlyCount}/${limits.monthly}). Resets next month.`,
        limits: { monthly_count: monthlyCount, monthly_limit: limits.monthly },
      };
    }
  }

  return { allowed: true };
}

// ── logUsage — call AFTER successful Claude call ──────────────────────────────
export async function logUsage(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string,
  feature: string,
): Promise<void> {
  const { error } = await supabase
    .from("ai_usage")
    .insert({ user_id: userId, feature });

  if (error) console.error("[logUsage] Failed:", error.message);
}

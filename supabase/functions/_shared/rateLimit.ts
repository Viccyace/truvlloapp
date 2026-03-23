// supabase/functions/_shared/rateLimit.ts
// Import this in every AI Edge Function to enforce plan limits

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  upgrade?: boolean;
  daily_count?: number;
  daily_limit?: number;
  monthly_count?: number;
  monthly_limit?: number;
}

/**
 * Check if a user is within their AI usage limits.
 * Call this BEFORE making any Anthropic API call.
 *
 * @param userId  - Supabase user ID (from JWT)
 * @param feature - Feature name: 'bank_import' | 'spending_analyst' | 'savings_coach' | 'nl_entry' | 'budget_advisor' | 'smart_categorise'
 * @param jwt     - User's JWT token (from Authorization header)
 */
export async function checkRateLimit(
  userId: string,
  feature: string,
  jwt: string,
): Promise<RateLimitResult> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceKey);

  // Get user's plan from profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return {
      allowed: false,
      reason: "Could not verify your account. Please log in again.",
    };
  }

  const plan = profile.plan || "free"; // 'free' | 'trial' | 'premium'

  // Check limit via DB function
  const { data, error } = await supabase.rpc("check_ai_limit", {
    p_user_id: userId,
    p_feature: feature,
    p_plan: plan,
  });

  if (error) {
    console.error("check_ai_limit error:", error);
    // Fail open — don't block users if the check itself fails
    return { allowed: true };
  }

  return data as RateLimitResult;
}

/**
 * Log a successful AI usage event.
 * Call this AFTER a successful Anthropic API call.
 */
export async function logUsage(userId: string, feature: string): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceKey);

  const { error } = await supabase.rpc("log_ai_usage", {
    p_user_id: userId,
    p_feature: feature,
  });

  if (error) {
    console.error("log_ai_usage error:", error);
    // Non-fatal — don't crash the request if logging fails
  }
}

/**
 * Extract user ID from Authorization header JWT.
 */
export async function getUserFromJWT(
  authHeader: string | null,
): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const jwt = authHeader.replace("Bearer ", "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceKey);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(jwt);

  if (error || !user) return null;
  return user.id;
}

/**
 * Standard rate-limit error response.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: result.reason || "AI usage limit reached",
      upgrade: result.upgrade || false,
      limits: {
        daily_count: result.daily_count,
        daily_limit: result.daily_limit,
        monthly_count: result.monthly_count,
        monthly_limit: result.monthly_limit,
      },
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    },
  );
}

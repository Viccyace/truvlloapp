// supabase/functions/flutterwave-init/index.ts
// Initialises a Flutterwave v3 payment and returns a hosted payment URL
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MONTHLY_NGN = 6500;
const ANNUAL_NGN = 4875 * 12; // 58_500

// ── Flutterwave error-code → user-friendly messages ──────────────────────────
const FLW_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS:
    "Payment service is misconfigured. Please contact support.",
  DUPLICATE_TX_REF:
    "A payment with this reference already exists. Please refresh and try again.",
  INVALID_AMOUNT: "The payment amount is invalid. Please contact support.",
  INVALID_CURRENCY: "This currency is not supported. Please contact support.",
  INVALID_EMAIL: "Your account email is invalid. Please update it in Settings.",
  RATE_LIMITED: "Too many payment attempts. Please wait a moment and retry.",
  INVALID_PAYMENT: "The payment details are invalid. Please try again.",
  AUTHORIZATION_REUSED:
    "This payment authorization has already been used. Please start again.",
  EXPIRED_TRANSACTION:
    "This payment session has expired. Refresh the page and try again.",
  INVALID_CARD: "Your card was declined. Please use another card or payment method.",
  INACTIVE_ACCOUNT:
    "Payment service is unavailable. Please contact support.",
};

function flwErrorMessage(code?: string, fallback?: string): string {
  if (code && FLW_ERROR_MESSAGES[code]) return FLW_ERROR_MESSAGES[code];
  return fallback || "Could not initialise payment. Please try again.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const FLW_SECRET = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    const SITE_URL = Deno.env.get("SITE_URL") || "https://www.truvllo.app";

    // ── Guard: secret key must exist ─────────────────────────────────────────
    if (!FLW_SECRET) {
      console.error("[flw-init] FLUTTERWAVE_SECRET_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Payment service is not configured." }),
        {
          status: 503,
          headers: { ...CORS, "Content-Type": "application/json" },
        },
      );
    }

    // ── Authenticate user via JWT ─────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(token);

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    if (!user.email) {
      return new Response(
        JSON.stringify({ error: "Authenticated user has no email address." }),
        {
          status: 400,
          headers: { ...CORS, "Content-Type": "application/json" },
        },
      );
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    const { billingCycle = "monthly" } = await req.json();
    const isAnnual = billingCycle === "annual";
    const amount = isAnnual ? ANNUAL_NGN : MONTHLY_NGN;
    const plan: string = isAnnual ? "annual" : "monthly";

    // ── Idempotency: stable tx_ref tied to user + timestamp ───────────────────
    // Using Date.now() gives a unique ref per attempt; the webhook uses this
    // ref as the idempotency key to prevent double-activation.
    const txRef = `TRV-FLW-${Date.now()}-${user.id.slice(0, 8)}`;

    // ── Fetch user profile for display name ───────────────────────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .maybeSingle();

    const firstName = profile?.first_name ?? "";
    const lastName = profile?.last_name ?? "";
    const name = `${firstName} ${lastName}`.trim() || "Truvllo User";

    // ── Call Flutterwave v3 /payments ─────────────────────────────────────────
    const flwRes = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FLW_SECRET}`,
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount,
        currency: "NGN",
        payment_options: "card,banktransfer,ussd",
        redirect_url: `${SITE_URL}/upgrade?upgrade=success&provider=flutterwave&ref=${txRef}`,
        customer: {
          email: user.email,
          name,
        },
        customizations: {
          title: "Truvllo Premium",
          description: `${isAnnual ? "Annual" : "Monthly"} Premium subscription`,
          logo: `${SITE_URL}/icons/icon-192x192.png`,
        },
        meta: {
          user_id: user.id,
          plan,
        },
      }),
    });

    const flwData = await flwRes.json();

    // ── Handle Flutterwave error codes ────────────────────────────────────────
    if (!flwRes.ok || flwData.status !== "success") {
      const errorCode: string | undefined =
        flwData?.code ?? flwData?.error_code;
      const message = flwErrorMessage(errorCode, flwData?.message);
      console.error("[flw-init] Flutterwave error:", {
        status: flwRes.status,
        code: errorCode,
        raw: flwData,
      });
      return new Response(JSON.stringify({ error: message, code: errorCode }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    console.log("[flw-init] Payment initialised:", { txRef, plan, amount });

    return new Response(
      JSON.stringify({ payment_url: flwData.data.link, reference: txRef }),
      {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("[flw-init] Unexpected error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please retry." }),
      {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      },
    );
  }
});

/**
 * paystack-init/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates a Paystack transaction and returns a payment URL.
 * Called from the frontend when the user clicks "Upgrade".
 *
 * POST body: { plan: "monthly" | "annual" }
 * Returns:   { payment_url: string, reference: string }
 *
 * Deploy:
 *   supabase functions deploy paystack-init
 *
 * Secrets needed:
 *   supabase secrets set PAYSTACK_SECRET_KEY=sk_live_...
 *   supabase secrets set SITE_URL=https://truvllo.vercel.app
 */

import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

// Plan definitions — amounts in kobo (Paystack uses smallest currency unit)
const PLANS = {
  monthly: {
    amount:      650000,   // ₦6,500 in kobo
    label:       "Truvllo Premium — Monthly",
    interval:    "monthly",
  },
  annual: {
    amount:      5850000,  // ₦58,500 in kobo (₦4,875 × 12)
    label:       "Truvllo Premium — Annual (Save 25%)",
    interval:    "annually",
  },
};

function generateReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random    = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TRV-${timestamp}-${random}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { user } = await requireAuth(req);
    const { plan = "monthly" } = await req.json();

    const planConfig = PLANS[plan as keyof typeof PLANS] ?? PLANS.monthly;
    const reference  = generateReference();
    const siteUrl    = Deno.env.get("SITE_URL") ?? "http://localhost:5173";
    const secretKey  = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY not set");

    // Initialise transaction with Paystack
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        email:        user.email,
        amount:       planConfig.amount,
        reference,
        currency:     "NGN",
        callback_url: `${siteUrl}/dashboard?upgrade=success&ref=${reference}`,
        cancel_url:   `${siteUrl}/upgrade`,
        metadata: {
          user_id:    user.id,
          plan,
          custom_fields: [
            { display_name: "Plan",    variable_name: "plan",    value: plan    },
            { display_name: "User ID", variable_name: "user_id", value: user.id },
          ],
        },
        channels: ["card", "bank", "ussd", "qr", "bank_transfer"],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Paystack error ${res.status}: ${err}`);
    }

    const data = await res.json();

    if (!data.status || !data.data?.authorization_url) {
      throw new Error("Paystack did not return a payment URL");
    }

    // Store pending transaction reference in DB so webhook can match it
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("payment_transactions").insert({
      user_id:   user.id,
      reference,
      plan,
      amount:    planConfig.amount / 100, // store in naira
      status:    "pending",
      created_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        payment_url: data.data.authorization_url,
        reference,
        access_code: data.data.access_code,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[paystack-init]", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

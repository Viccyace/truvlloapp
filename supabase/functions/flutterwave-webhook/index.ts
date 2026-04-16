// supabase/functions/flutterwave-webhook/index.ts
// Handles Flutterwave v3 payment webhooks to activate Premium
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, verif-hash",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    // ── 1. Pull required secrets ──────────────────────────────────────────────
    const FLW_SECRET = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    const WEBHOOK_HASH = Deno.env.get("FLUTTERWAVE_WEBHOOK_HASH");

    // Both secrets are mandatory. Fail hard if either is missing.
    if (!FLW_SECRET || !WEBHOOK_HASH) {
      console.error(
        "[flw-webhook] Missing FLUTTERWAVE_SECRET_KEY or FLUTTERWAVE_WEBHOOK_HASH env vars",
      );
      return new Response("Service misconfigured", { status: 503 });
    }

    // ── 2. Verify verif-hash (hard check — no bypass) ─────────────────────────
    // Flutterwave sends the exact string you set as your webhook hash.
    // Reject immediately if it's absent or wrong.
    const signature = req.headers.get("verif-hash");
    if (!signature || signature !== WEBHOOK_HASH) {
      console.error("[flw-webhook] Invalid or missing verif-hash signature");
      return new Response("Unauthorized", { status: 401 });
    }

    // ── 3. Parse event body ───────────────────────────────────────────────────
    const body = await req.json();
    const event: string = body?.event;

    // Only process successful charge completions
    if (event !== "charge.completed") {
      console.log("[flw-webhook] Ignored event:", event);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const data = body?.data;

    if (data?.status !== "successful") {
      console.log("[flw-webhook] Non-successful charge status:", data?.status);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── 4. Extract metadata ───────────────────────────────────────────────────
    const txRef: string = data?.tx_ref ?? "";
    const userId: string | undefined = data?.meta?.user_id;
    const plan: string = data?.meta?.plan ?? "monthly";
    const amount: number = data?.amount ?? 0;
    const flwTransactionId = Number(data?.id);

    if (!userId) {
      console.error("[flw-webhook] No user_id in meta — cannot activate");
      return new Response("Missing user_id", { status: 400 });
    }

    if (!txRef) {
      console.error("[flw-webhook] No tx_ref in payload");
      return new Response(
        JSON.stringify({ error: "Missing tx_ref" }),
        {
          status: 400,
          headers: { ...CORS, "Content-Type": "application/json" },
        },
      );
    }

    if (!flwTransactionId) {
      console.error("[flw-webhook] No Flutterwave transaction id in payload");
      return new Response(
        JSON.stringify({ error: "Missing transaction id" }),
        {
          status: 400,
          headers: { ...CORS, "Content-Type": "application/json" },
        },
      );
    }

    // ── 5. Re-verify transaction with Flutterwave (server-to-server) ──────────
    const verifyRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${flwTransactionId}/verify`,
      {
        headers: { Authorization: `Bearer ${FLW_SECRET}` },
      },
    );
    const verified = await verifyRes.json();

    if (verified?.data?.status !== "successful") {
      console.error(
        "[flw-webhook] Server-side re-verification failed:",
        verified,
      );
      return new Response("Verification failed", { status: 400 });
    }

    // ── 6. Idempotency guard — skip if tx_ref already processed ───────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: existing } = await supabase
      .from("payment_transactions")
      .select("id, status")
      .eq("reference", txRef)
      .maybeSingle();

    if (existing) {
      // Transaction already recorded — return 200 so Flutterwave stops retrying
      console.log(
        "[flw-webhook] Duplicate webhook for tx_ref:",
        txRef,
        "— skipping",
      );
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── 7. Calculate subscription end date ────────────────────────────────────
    const endsAt = new Date();
    if (plan === "annual") {
      endsAt.setFullYear(endsAt.getFullYear() + 1);
    } else {
      endsAt.setMonth(endsAt.getMonth() + 1);
    }

    // ── 8. Activate Premium on the user profile ───────────────────────────────
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        plan: "premium",
        subscription_ends_at: endsAt.toISOString(),
        subscribed_at: new Date().toISOString(),
        subscription_cancelled: false,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("[flw-webhook] Profile update failed:", profileError);
      // Return 500 so Flutterwave retries — we haven't logged the tx yet
      throw profileError;
    }

    // ── 9. Log transaction (insert after profile update succeeds) ─────────────
    const { error: txError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: userId,
        reference: txRef,
        plan,
        amount,
        amount_paid: amount,
        status: "completed",
        completed_at: new Date().toISOString(),
      });

    if (txError) {
      // Non-fatal: Premium is already active. Log and continue.
      console.error("[flw-webhook] Transaction log insert failed:", txError);
    }

    console.log("[flw-webhook] Premium activated for user:", userId, {
      txRef,
      plan,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[flw-webhook] Unexpected error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

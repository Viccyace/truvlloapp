/**
 * paystack-webhook/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Receives Paystack webhook events, verifies the HMAC signature,
 * and upgrades the user's plan in the database on successful payment.
 *
 * Configure in Paystack Dashboard:
 *   Webhook URL: https://<project-ref>.supabase.co/functions/v1/paystack-webhook
 *   Events:      charge.success, subscription.create, subscription.disable
 *
 * Deploy:
 *   supabase functions deploy paystack-webhook
 *
 * Secrets needed:
 *   supabase secrets set PAYSTACK_SECRET_KEY=sk_live_...
 *   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── HMAC signature verification ───────────────────────────────────────────────
async function verifyPaystackSignature(
  body: string,
  signature: string,
  secretKey: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const msgData = encoder.encode(body);

  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyData,
    { name: "HMAC", hash: "SHA-512" },
    false, ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const computedHash   = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHash === signature;
}

// ── Plan → subscription end date ─────────────────────────────────────────────
function getSubscriptionEndDate(plan: string): string {
  const now = new Date();
  if (plan === "annual") {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString();
}

Deno.serve(async (req) => {
  // Paystack only sends POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!secretKey) {
    console.error("[paystack-webhook] PAYSTACK_SECRET_KEY not set");
    return new Response("Server misconfigured", { status: 500 });
  }

  // Read raw body for signature verification
  const rawBody  = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  // ── Verify signature ────────────────────────────────────────────────────────
  const isValid = await verifyPaystackSignature(rawBody, signature, secretKey);
  if (!isValid) {
    console.warn("[paystack-webhook] Invalid signature — possible spoofed request");
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  console.log(`[paystack-webhook] Event: ${event.event}`);

  // ── Handle events ───────────────────────────────────────────────────────────
  switch (event.event) {

    // ── Successful one-time or recurring charge ──────────────────────────────
    case "charge.success": {
      const data      = event.data as Record<string, unknown>;
      const reference = data.reference as string;
      const metadata  = data.metadata as Record<string, unknown> ?? {};
      const status    = data.status as string;
      const amount    = data.amount as number; // in kobo

      if (status !== "success") break;

      // Look up transaction to get user_id and plan
      const { data: txn, error: txnErr } = await supabase
        .from("payment_transactions")
        .select("user_id, plan")
        .eq("reference", reference)
        .single();

      if (txnErr || !txn) {
        // Fallback: try metadata
        const userId = metadata.user_id as string | undefined;
        const plan   = metadata.plan   as string | undefined ?? "monthly";
        if (!userId) {
          console.error("[paystack-webhook] Cannot find user for reference:", reference);
          break;
        }
        await upgradeUser(supabase, userId, plan, reference, amount);
      } else {
        await upgradeUser(supabase, txn.user_id, txn.plan, reference, amount);
      }
      break;
    }

    // ── Subscription created (recurring billing activated) ───────────────────
    case "subscription.create": {
      const data   = event.data as Record<string, unknown>;
      const custObj = data.customer as Record<string, unknown> ?? {};
      const email  = custObj.email as string | undefined;
      if (!email) break;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profile?.id) {
        await supabase.from("profiles").update({
          plan:             "premium",
          subscription_id:  data.subscription_code as string,
          subscribed_at:    new Date().toISOString(),
        }).eq("id", profile.id);
      }
      break;
    }

    // ── Subscription cancelled ───────────────────────────────────────────────
    case "subscription.disable": {
      const data    = event.data as Record<string, unknown>;
      const custObj = data.customer as Record<string, unknown> ?? {};
      const email   = custObj.email as string | undefined;
      if (!email) break;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, subscription_ends_at")
        .eq("email", email)
        .single();

      if (profile?.id) {
        // Don't downgrade immediately — let them keep access until period end
        await supabase.from("profiles").update({
          subscription_cancelled: true,
        }).eq("id", profile.id);

        console.log(`[paystack-webhook] Subscription cancelled for ${email} — access until ${profile.subscription_ends_at}`);
      }
      break;
    }

    default:
      console.log(`[paystack-webhook] Unhandled event: ${event.event}`);
  }

  // Always return 200 to acknowledge receipt
  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

// ── Helper: upgrade user profile ─────────────────────────────────────────────
async function upgradeUser(
  supabase: ReturnType<typeof createClient>,
  userId:    string,
  plan:      string,
  reference: string,
  amountKobo: number
) {
  const subscriptionEndsAt = getSubscriptionEndDate(plan);

  // 1. Upgrade profile
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      plan:                   "premium",
      subscription_ends_at:   subscriptionEndsAt,
      trial_ends_at:          null,   // clear trial
      trial_activated:        true,
      subscription_cancelled: false,
    })
    .eq("id", userId);

  if (profileErr) {
    console.error("[paystack-webhook] Failed to upgrade profile:", profileErr.message);
    return;
  }

  // 2. Mark transaction as completed
  await supabase
    .from("payment_transactions")
    .update({
      status:       "completed",
      completed_at: new Date().toISOString(),
      amount_paid:  amountKobo / 100, // convert kobo → naira
    })
    .eq("reference", reference);

  console.log(`[paystack-webhook] ✓ Upgraded user ${userId} to premium (${plan}) until ${subscriptionEndsAt}`);
}

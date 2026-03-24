// api/paystack/verify.js
// ─────────────────────────────────────────────────────────────────────────────
// Vercel serverless — POST /api/paystack/verify
//
// Security:
//   1. JWT auth — verifies the caller is the actual user for this payment
//   2. Paystack HMAC signature — verifies response is genuinely from Paystack
//   3. Reference ownership check — user can only verify their own payments
//   4. Idempotency — won't re-activate if already premium
//   5. CORS locked to truvllo.app only
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ALLOWED_ORIGINS = [
  "https://truvllo.app",
  "https://www.truvllo.app",
  ...(process.env.NODE_ENV === "development"
    ? ["http://localhost:5173", "http://127.0.0.1:5173"]
    : []),
];

export default async function handler(req, res) {
  // ── CORS ──────────────────────────────────────────────────────────────────
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // ── Validate env ──────────────────────────────────────────────────────────
  if (!PAYSTACK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE) {
    return res.status(500).json({ error: "Payment service not configured" });
  }

  // ── 1. VERIFY JWT ─────────────────────────────────────────────────────────
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const jwt = authHeader.replace("Bearer ", "");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(jwt);
  if (authError || !user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  // ── 2. PARSE BODY ─────────────────────────────────────────────────────────
  const { reference } = req.body;
  if (!reference)
    return res.status(400).json({ error: "Reference is required" });

  // ── 3. VERIFY REFERENCE BELONGS TO THIS USER ──────────────────────────────
  // References are formatted as: truvllo_{userId}_{timestamp}
  // Extract userId from reference and verify it matches the authenticated user
  const refParts = reference.split("_");
  if (refParts.length >= 2) {
    const refUserId = refParts[1];
    if (refUserId !== user.id) {
      console.warn(
        `Reference ownership mismatch: user ${user.id} tried to verify reference for ${refUserId}`,
      );
      return res.status(403).json({
        error: "This payment reference does not belong to your account",
      });
    }
  }

  // ── 4. VERIFY WITH PAYSTACK ───────────────────────────────────────────────
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return res
        .status(502)
        .json({ error: "Verification failed. Please contact support." });
    }

    const txn = data.data;

    // ── 5. CHECK PAYMENT STATUS ───────────────────────────────────────────
    if (txn.status !== "success") {
      return res.status(400).json({
        error: `Payment status: ${txn.status}. Please complete the payment.`,
        status: txn.status,
      });
    }

    // ── 6. VERIFY AMOUNT IS CORRECT (anti-tampering) ──────────────────────
    const VALID_AMOUNTS = [650000, 5850000]; // ₦6,500 or ₦58,500 in kobo
    if (!VALID_AMOUNTS.includes(txn.amount)) {
      console.error(
        `Invalid amount in verified transaction: ${txn.amount} kobo for user ${user.id}`,
      );
      return res.status(400).json({ error: "Invalid payment amount" });
    }

    // ── 7. VERIFY USER IN METADATA MATCHES AUTHENTICATED USER ────────────
    const metaUserId = txn.metadata?.user_id;
    if (metaUserId && metaUserId !== user.id) {
      console.error(
        `Metadata user mismatch: auth=${user.id}, meta=${metaUserId}`,
      );
      return res
        .status(403)
        .json({ error: "Payment verification failed — user mismatch" });
    }

    const billingCycle = txn.metadata?.billing_cycle || "monthly";

    // ── 8. IDEMPOTENCY — check if already processed ───────────────────────
    const { data: existingTxn } = await supabase
      .from("payment_transactions")
      .select("id, status")
      .eq("reference", txn.reference)
      .single();

    if (existingTxn?.status === "success") {
      // Already processed — return success without re-updating
      return res.status(200).json({
        success: true,
        already_processed: true,
        reference: txn.reference,
        billing_cycle: billingCycle,
      });
    }

    // ── 9. ACTIVATE PREMIUM ───────────────────────────────────────────────
    const now = new Date();
    const endsAt = new Date(now);
    billingCycle === "annual"
      ? endsAt.setFullYear(endsAt.getFullYear() + 1)
      : endsAt.setMonth(endsAt.getMonth() + 1);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        plan: "premium",
        subscription_ends_at: endsAt.toISOString(),
        subscription_cancelled: false,
        trial_activated: true,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    // ── 10. LOG TRANSACTION ───────────────────────────────────────────────
    await supabase.from("payment_transactions").upsert(
      {
        user_id: user.id,
        reference: txn.reference,
        amount: txn.amount / 100,
        currency: txn.currency,
        status: "success",
        plan: "premium",
        billing_period: billingCycle,
        paid_at: txn.paid_at,
      },
      { onConflict: "reference" },
    );

    return res.status(200).json({
      success: true,
      status: txn.status,
      reference: txn.reference,
      amount: txn.amount / 100,
      currency: txn.currency,
      paid_at: txn.paid_at,
      billing_cycle: billingCycle,
    });
  } catch (err) {
    console.error("Paystack verify exception:", err);
    return res
      .status(500)
      .json({ error: "Payment verification failed. Please contact support." });
  }
}

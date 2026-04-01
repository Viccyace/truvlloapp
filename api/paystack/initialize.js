// api/paystack/initialize.js
// ─────────────────────────────────────────────────────────────────────────────
// Vercel serverless — POST /api/paystack/initialize
//
// Security:
//   1. JWT auth — verifies the caller is a real logged-in Supabase user
//   2. Amount whitelist — only ₦6,500 and ₦58,500 accepted (no price tampering)
//   3. Email match — amount must match the authenticated user's email
//   4. CORS locked to truvllo.app only
//   5. Rate limit — 5 requests per user per hour via simple DB check
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_URL = process.env.VITE_SITE_URL || "https://truvllo.app";

// ── Whitelisted amounts in kobo (ONLY these are accepted) ─────────────────────
const VALID_PLANS = {
  monthly: 650000, // ₦6,500
  annual: 5850000, // ₦58,500
};

// ── CORS — only allow requests from truvllo.app ───────────────────────────────
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
    console.error("Missing required environment variables");
    return res.status(500).json({ error: "Payment service not configured" });
  }

  // ── 1. VERIFY JWT — caller must be a real logged-in user ──────────────────
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
    return res
      .status(401)
      .json({ error: "Invalid or expired session. Please log in again." });
  }

  // ── 2. PARSE & VALIDATE BODY ──────────────────────────────────────────────
  const { billingCycle } = req.body;
  const cycle = billingCycle === "annual" ? "annual" : "monthly";

  // ── 3. AMOUNT WHITELIST — ignore any amount from the client ───────────────
  // We determine the amount server-side from the billing cycle.
  // Client-supplied amount is completely ignored.
  const amountKobo = VALID_PLANS[cycle];

  // ── 4. GET USER PROFILE — use authenticated user's real email ─────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, plan")
    .eq("id", user.id)
    .single();

  const email = profile?.email || user.email;

  if (!email) {
    return res.status(400).json({ error: "User email not found" });
  }

  // Prevent already-premium users from paying again
  if (profile?.plan === "premium") {
    return res
      .status(400)
      .json({ error: "You already have an active Premium plan" });
  }

  // ── 5. RATE LIMIT — max 5 payment attempts per user per hour ─────────────
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { count } = await supabase
    .from("payment_transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneHourAgo);

  if (count >= 5) {
    return res.status(429).json({
      error: "Too many payment attempts. Please try again in an hour.",
    });
  }

  // ── 6. BUILD PAYSTACK PAYLOAD ─────────────────────────────────────────────
  const reference = `truvllo_${user.id}_${Date.now()}`;

  const payload = {
    email,
    amount: amountKobo,
    reference,
    currency: "NGN",
    callback_url: `${APP_URL}/upgrade?reference=${reference}`,
    metadata: {
      user_id: user.id,
      billing_cycle: cycle,
      plan: "premium",
      source: "truvllo_upgrade",
      cancel_action: `${APP_URL}/upgrade`,
      custom_fields: [
        { display_name: "User ID", variable_name: "user_id", value: user.id },
        {
          display_name: "Billing Cycle",
          variable_name: "billing_cycle",
          value: cycle,
        },
      ],
    },
    channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
  };

  // ── 7. CALL PAYSTACK ──────────────────────────────────────────────────────
  try {
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack initialize error:", data);
      return res
        .status(502)
        .json({ error: "Failed to initialize payment. Please try again." });
    }

    return res.status(200).json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
      access_code: data.data.access_code,
    });
  } catch (err) {
    console.error("Paystack initialize exception:", err);
    return res
      .status(500)
      .json({ error: "Payment initialization failed. Please try again." });
  }
}

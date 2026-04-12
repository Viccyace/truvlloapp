/**
 * usePaystack.js  —  src/hooks/usePaystack.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles the full Paystack upgrade flow from the frontend.
 *
 * Flow:
 *   1. User clicks "Upgrade" → calls paystack-init Edge Function
 *   2. Edge Function creates transaction → returns { payment_url, reference }
 *   3. We redirect the user to Paystack's hosted payment page
 *   4. Paystack redirects back to /dashboard?upgrade=success&ref=TRV-...
 *   5. We verify payment server-side in the webhook (already handled)
 *   6. useUpgradeSuccess() detects the query param and refreshes auth profile
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// ── usePaystack ───────────────────────────────────────────────────────────────
export function usePaystack() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initialise a Paystack payment and redirect the user.
   * @param {("monthly"|"annual")} plan
   */
  const initiatePayment = useCallback(async (plan = "monthly") => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not logged in");

      // Call the Edge Function
      const { data, error: fnErr } = await supabase.functions.invoke(
        "paystack-init",
        {
          body: { plan },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (fnErr) throw new Error(fnErr.message);
      if (!data?.payment_url) throw new Error("No payment URL returned");

      // Store reference in sessionStorage so we can verify on return
      sessionStorage.setItem("paystack_ref", data.reference);
      sessionStorage.setItem("paystack_plan", plan);

      // Redirect to Paystack hosted payment page
      window.location.href = data.payment_url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
    // Note: don't setLoading(false) on success — page will redirect away
  }, []);

  return { initiatePayment, loading, error };
}

// ── useUpgradeSuccess ─────────────────────────────────────────────────────────
/**
 * Call this on the Dashboard page (or any post-payment landing page).
 * It detects the ?upgrade=success query param, clears the cache,
 * and triggers a profile refresh so the UI shows Premium status immediately.
 *
 * Usage in Dashboard.jsx:
 *   useUpgradeSuccess();
 */
export function useUpgradeSuccess() {
  const { refreshProfile } = useAuth(); // from AuthProvider

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgraded = params.get("upgrade") === "success";
    const ref = params.get("ref");

    if (!upgraded || !ref) return;

    // Clean up the URL without a full reload
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);

    // Clear sessionStorage flags
    sessionStorage.removeItem("paystack_ref");
    sessionStorage.removeItem("paystack_plan");

    // Force a fresh profile fetch — webhook may have already upgraded the user
    // by the time they land back here
    const verifyAndRefresh = async () => {
      // Small delay to give the webhook time to process
      await new Promise((r) => setTimeout(r, 1500));
      await refreshProfile?.(); // re-fetch from Supabase, update localStorage cache
    };

    verifyAndRefresh();
  }, [refreshProfile]);
}

// ── refreshProfile implementation for AuthProvider ────────────────────────────
/*
  Add this to AuthProvider.jsx inside the AuthProvider component:

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    profileFetchedRef.current = false; // allow re-fetch
    await fetchProfile(user.id);
  }, [user?.id, fetchProfile]);

  // Add refreshProfile to the context value:
  const value = {
    ...existingValues,
    refreshProfile,
  };
*/

// ═════════════════════════════════════════════════════════════════════════════
// SQL SCHEMA — run in Supabase SQL editor
// ═════════════════════════════════════════════════════════════════════════════
export const PAYMENT_SQL = `

-- payment_transactions table
-- Tracks every Paystack transaction attempt
CREATE TABLE public.payment_transactions (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference     text         NOT NULL UNIQUE,
  plan          text         NOT NULL,       -- 'monthly' | 'annual'
  amount        numeric(12,2) NOT NULL,      -- in Naira
  amount_paid   numeric(12,2),              -- filled in by webhook on success
  status        text         NOT NULL DEFAULT 'pending',  -- 'pending' | 'completed' | 'failed'
  completed_at  timestamptz,
  created_at    timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own transactions
CREATE POLICY "Own transactions"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (done by Edge Functions)
-- No INSERT/UPDATE policy for authenticated users intentionally.


-- Add subscription fields to profiles (if not already present)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_ends_at    timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_id         text,
  ADD COLUMN IF NOT EXISTS subscribed_at           timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_cancelled  boolean NOT NULL DEFAULT false;


-- Helper function: check if a user currently has an active premium subscription
CREATE OR REPLACE FUNCTION public.is_premium(user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
      AND plan = 'premium'
      AND (subscription_ends_at IS NULL OR subscription_ends_at > now())
  );
$$;


-- Auto-downgrade expired premium users (run as a cron job via pg_cron)
-- Install pg_cron via Supabase Dashboard → Database → Extensions
-- Then schedule:
/*
SELECT cron.schedule(
  'downgrade-expired-premium',
  '0 2 * * *',   -- runs at 2am UTC daily
  $$
    UPDATE public.profiles
    SET plan = 'basic'
    WHERE plan = 'premium'
      AND subscription_ends_at IS NOT NULL
      AND subscription_ends_at < now();
  $$
);
*/
`;

// ═════════════════════════════════════════════════════════════════════════════
// WIRING — How to connect everything
// ═════════════════════════════════════════════════════════════════════════════
export const WIRING_GUIDE = `

/* ── UpgradePage.jsx ───────────────────────────────────────────────────────── */

import { usePaystack } from "../hooks/usePaystack";

const { initiatePayment, loading, error } = usePaystack();

// Replace the mock handlePaystack with:
const handleUpgrade = (plan) => initiatePayment(plan);

// Button:
<button onClick={() => handleUpgrade("monthly")} disabled={loading}>
  {loading ? "Redirecting to Paystack…" : "Upgrade — ₦6,500/mo"}
</button>

{error && <p style={{ color: "red", fontSize: "0.8rem" }}>{error}</p>}


/* ── Dashboard.jsx ─────────────────────────────────────────────────────────── */

import { useUpgradeSuccess } from "../hooks/usePaystack";

// Add at the top of the Dashboard component:
useUpgradeSuccess(); // detects ?upgrade=success, refreshes profile, cleans URL


/* ── Settings.jsx — plan card ──────────────────────────────────────────────── */

import { usePaystack } from "../hooks/usePaystack";
const { initiatePayment, loading } = usePaystack();

<button onClick={() => initiatePayment("monthly")} disabled={loading}>
  {loading ? "Redirecting…" : "Upgrade to Premium — ₦6,500/mo"}
</button>


/* ── Paystack Dashboard setup ──────────────────────────────────────────────── */
// 1. Log in at dashboard.paystack.com
// 2. Settings → API Keys & Webhooks
// 3. Webhook URL: https://<project-ref>.supabase.co/functions/v1/paystack-webhook
// 4. Enable events: charge.success, subscription.create, subscription.disable
// 5. Copy your Secret Key and run:
//    supabase secrets set PAYSTACK_SECRET_KEY=sk_live_...


/* ── Deploy commands ───────────────────────────────────────────────────────── */
// supabase functions deploy paystack-init
// supabase functions deploy paystack-webhook
// supabase secrets set PAYSTACK_SECRET_KEY=sk_live_...
// supabase secrets set SITE_URL=https://truvllo.vercel.app
`;

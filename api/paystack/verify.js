import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secretKey) {
      return res.status(500).json({ error: "Missing PAYSTACK_SECRET_KEY" });
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return res
        .status(500)
        .json({ error: "Missing Supabase server environment variables" });
    }

    const { reference } = req.body || {};

    if (!reference) {
      return res.status(400).json({ error: "Missing payment reference" });
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    const result = await paystackRes.json();

    if (!paystackRes.ok || !result?.status) {
      return res.status(400).json({
        error: result?.message || "Could not verify Paystack transaction",
      });
    }

    const payment = result.data;

    if (payment?.status !== "success") {
      return res.status(400).json({
        error: `Payment not successful. Status: ${payment?.status || "unknown"}`,
      });
    }

    const metadata = payment?.metadata || {};
    const userId = metadata?.user_id;
    const billingCycle = metadata?.billing_cycle || "monthly";

    if (!userId) {
      return res
        .status(400)
        .json({ error: "Missing user ID in payment metadata" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const now = new Date();
    const subscriptionEndsAt = new Date(now);

    if (billingCycle === "annual") {
      subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);
    } else {
      subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan: "premium",
        trial_activated: false,
        trial_ends_at: null,
        subscription_ends_at: subscriptionEndsAt.toISOString(),
        subscription_cancelled: false,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Supabase premium update error:", updateError);
      return res
        .status(500)
        .json({ error: "Payment verified, but profile update failed" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and premium activated",
    });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return res.status(500).json({ error: "Server error during verification" });
  }
}

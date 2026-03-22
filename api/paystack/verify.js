import { createClient } from "@supabase/supabase-js";

const PLAN_AMOUNTS = {
  monthly: 650000, // ₦6,500 in kobo
  annual: 6500000, // change if your annual amount is different
};

function addSubscriptionDuration(fromDate, billingCycle) {
  const next = new Date(fromDate);

  if (billingCycle === "annual") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }

  return next.toISOString();
}

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

    const { reference, userId } = req.body || {};

    if (!reference || !userId) {
      return res.status(400).json({ error: "Missing reference or userId" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Check if this exact payment reference was already processed
    const { data: existingPayment, error: existingPaymentError } =
      await supabase
        .from("payments")
        .select("id, status, user_id, reference")
        .eq("reference", reference)
        .maybeSingle();

    if (existingPaymentError) {
      console.error("Verify payment lookup error:", existingPaymentError);
      return res.status(500).json({ error: "Could not check payment record" });
    }

    // If this reference was already processed successfully, do not process again
    if (existingPayment?.status === "success") {
      if (existingPayment.user_id !== userId) {
        return res
          .status(403)
          .json({ error: "Payment does not belong to this user" });
      }

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        already_processed: true,
        reference,
      });
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
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
    const metadata = payment?.metadata || {};

    // 1. Payment must be successful
    if (payment?.status !== "success") {
      return res.status(400).json({
        error: `Payment not successful. Status: ${payment?.status || "unknown"}`,
      });
    }

    const metadataUserId = metadata?.user_id;
    const billingCycle = metadata?.billing_cycle;
    const plan = metadata?.plan;
    const source = metadata?.source;
    const emailFromMetadata = metadata?.email || null;

    // 2. Reference must be valid
    if (!payment?.reference || payment.reference !== reference) {
      return res.status(400).json({ error: "Invalid payment reference" });
    }

    if (!metadataUserId) {
      return res
        .status(400)
        .json({ error: "Missing user ID in payment metadata" });
    }

    if (!["monthly", "annual"].includes(billingCycle)) {
      return res
        .status(400)
        .json({ error: "Invalid billing cycle in payment metadata" });
    }

    if (plan !== "premium") {
      return res.status(400).json({ error: "Invalid plan metadata" });
    }

    if (source !== "truvllo_upgrade") {
      return res.status(400).json({ error: "Invalid payment source" });
    }

    // 3. Customer must match current user
    if (metadataUserId !== userId) {
      return res
        .status(403)
        .json({ error: "Payment does not belong to this user" });
    }

    // 4. Amount must match expected plan
    const expectedAmount = PLAN_AMOUNTS[billingCycle];
    const paidAmount = Number(payment?.amount);

    if (payment?.currency !== "NGN") {
      return res.status(400).json({ error: "Invalid payment currency" });
    }

    if (!Number.isFinite(paidAmount) || paidAmount !== expectedAmount) {
      return res.status(400).json({ error: "Amount mismatch" });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, subscription_ends_at")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Verify profile fetch error:", profileError);
      return res.status(500).json({ error: "Could not fetch profile" });
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Optional extra email consistency check if you store email in metadata
    if (
      emailFromMetadata &&
      profile.email &&
      emailFromMetadata !== profile.email
    ) {
      return res
        .status(403)
        .json({ error: "Customer email does not match profile" });
    }

    const now = new Date();
    const currentSubscriptionEnd = profile.subscription_ends_at
      ? new Date(profile.subscription_ends_at)
      : null;

    const baseDate =
      currentSubscriptionEnd && currentSubscriptionEnd > now
        ? currentSubscriptionEnd
        : now;

    const subscriptionEndsAt = addSubscriptionDuration(baseDate, billingCycle);

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({
        plan: "premium",
        trial_activated: false,
        trial_ends_at: null,
        subscription_ends_at: subscriptionEndsAt,
        subscription_cancelled: false,
      })
      .eq("id", userId);

    if (updateProfileError) {
      console.error("Verify profile update error:", updateProfileError);
      return res
        .status(500)
        .json({ error: "Payment verified, but profile update failed" });
    }

    const paymentRecord = {
      user_id: userId,
      reference,
      amount: paidAmount,
      currency: payment.currency,
      status: payment.status,
      plan,
      billing_cycle: billingCycle,
      paid_at: payment.paid_at || new Date().toISOString(),
      channel: payment.channel || null,
      gateway_response: payment.gateway_response || null,
      raw_response: payment,
    };

    let paymentSaveError = null;

    if (existingPayment) {
      const { error } = await supabase
        .from("payments")
        .update(paymentRecord)
        .eq("reference", reference);

      paymentSaveError = error;
    } else {
      const { error } = await supabase.from("payments").insert(paymentRecord);

      paymentSaveError = error;
    }

    if (paymentSaveError) {
      console.error("Verify payment save error:", paymentSaveError);
      return res.status(500).json({
        error: "Payment verified, but payment record could not be saved",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and premium activated",
      reference,
      subscription_ends_at: subscriptionEndsAt,
    });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return res.status(500).json({ error: "Server error during verification" });
  }
}

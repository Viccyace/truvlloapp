import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const PLAN_AMOUNTS = {
  monthly: 650000, // ₦6,500 in kobo
  annual: 5850000, // ₦58,500 in kobo
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

async function getRawBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!paystackSecret) {
      return res.status(500).json({ error: "Missing PAYSTACK_SECRET_KEY" });
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return res
        .status(500)
        .json({ error: "Missing Supabase server environment variables" });
    }

    const rawBodyBuffer = await getRawBody(req);
    const rawBody = rawBodyBuffer.toString("utf8");
    const signature = req.headers["x-paystack-signature"];

    const hash = crypto
      .createHmac("sha512", paystackSecret)
      .update(rawBodyBuffer)
      .digest("hex");

    if (!signature || hash !== signature) {
      return res.status(401).json({ error: "Invalid Paystack signature" });
    }

    const event = JSON.parse(rawBody);

    // Ignore unrelated events
    if (event?.event !== "charge.success") {
      return res.status(200).json({ received: true, ignored: true });
    }

    const payment = event.data || {};
    const metadata = payment.metadata || {};

    const userId = metadata.user_id;
    const billingCycle = metadata.billing_cycle;
    const plan = metadata.plan;
    const source = metadata.source;
    const reference = payment.reference;
    const paidAmount = Number(payment.amount);
    const currency = payment.currency || "NGN";

    if (!userId || !reference) {
      return res
        .status(400)
        .json({ error: "Missing required payment metadata" });
    }

    if (!["monthly", "annual"].includes(billingCycle)) {
      return res.status(400).json({ error: "Invalid billing cycle" });
    }

    if (plan !== "premium") {
      return res.status(400).json({ error: "Invalid plan metadata" });
    }

    if (source !== "truvllo_upgrade") {
      return res.status(400).json({ error: "Invalid payment source" });
    }

    if (payment.status !== "success") {
      return res.status(400).json({ error: "Payment status is not success" });
    }

    if (currency !== "NGN") {
      return res.status(400).json({ error: "Invalid payment currency" });
    }

    const expectedAmount = PLAN_AMOUNTS[billingCycle];

    if (!Number.isFinite(paidAmount) || paidAmount !== expectedAmount) {
      return res.status(400).json({ error: "Amount mismatch" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: existingPayment, error: existingPaymentError } =
      await supabase
        .from("payments")
        .select("id, status, reference")
        .eq("reference", reference)
        .maybeSingle();

    if (existingPaymentError) {
      console.error("Webhook payment lookup error:", existingPaymentError);
      return res.status(500).json({ error: "Could not check payment record" });
    }

    if (existingPayment?.status === "success") {
      return res.status(200).json({
        received: true,
        already_processed: true,
        reference,
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, subscription_ends_at")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Webhook profile fetch error:", profileError);
      return res.status(500).json({ error: "Could not fetch profile" });
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
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

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan: "premium",
        trial_activated: false,
        trial_ends_at: null,
        subscription_ends_at: subscriptionEndsAt,
        subscription_cancelled: false,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Webhook profile update error:", updateError);
      return res.status(500).json({ error: "Profile update failed" });
    }

    const paymentRecord = {
      user_id: userId,
      reference,
      amount: paidAmount,
      currency,
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
      console.error("Webhook payment save error:", paymentSaveError);
      return res.status(500).json({
        error: "Premium activated, but payment record save failed",
      });
    }

    return res.status(200).json({
      received: true,
      processed: true,
      reference,
      subscription_ends_at: subscriptionEndsAt,
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}

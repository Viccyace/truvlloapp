const PLAN_AMOUNTS = {
  monthly: 650000, // ₦6,500 in kobo
  annual: 6500000, // change if your annual price is different
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const appUrl =
      process.env.APP_URL ||
      process.env.VITE_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

    if (!secretKey) {
      return res.status(500).json({ error: "Missing PAYSTACK_SECRET_KEY" });
    }

    if (!appUrl) {
      return res.status(500).json({ error: "Missing APP_URL" });
    }

    const { email, userId, billingCycle } = req.body || {};

    if (!email || !userId || !billingCycle) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["monthly", "annual"].includes(billingCycle)) {
      return res.status(400).json({ error: "Invalid billing cycle" });
    }

    const amount = PLAN_AMOUNTS[billingCycle];

    if (!amount) {
      return res.status(400).json({ error: "Invalid plan amount" });
    }

    const reference = `truvllo_${billingCycle}_${userId}_${Date.now()}`;
    const callback_url = `${appUrl}/upgrade`;

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount,
          currency: "NGN",
          reference,
          callback_url,
          metadata: {
            user_id: userId,
            billing_cycle: billingCycle,
            plan: "premium",
            source: "truvllo_upgrade",
            email,
          },
        }),
      },
    );

    const data = await paystackRes.json();

    if (!paystackRes.ok || !data?.status || !data?.data?.authorization_url) {
      console.error("Paystack initialize failed:", data);
      return res.status(400).json({
        error: data?.message || "Could not initialize Paystack transaction",
      });
    }

    return res.status(200).json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error("Paystack initialize error:", error);
    return res
      .status(500)
      .json({ error: "Server error during initialization" });
  }
}

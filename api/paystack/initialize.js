export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const appUrl =
      process.env.VITE_APP_URL ||
      process.env.APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

    if (!secretKey) {
      return res.status(500).json({ error: "Missing PAYSTACK_SECRET_KEY" });
    }

    if (!appUrl) {
      return res.status(500).json({ error: "Missing app URL env" });
    }

    const { email, userId, billingCycle, amount } = req.body || {};

    if (!email || !userId || !billingCycle || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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
          callback_url,
          metadata: {
            user_id: userId,
            billing_cycle: billingCycle,
            plan: "premium",
          },
        }),
      },
    );

    const data = await paystackRes.json();

    if (!paystackRes.ok || !data?.status) {
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

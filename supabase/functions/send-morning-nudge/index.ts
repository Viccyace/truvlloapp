/**
 * send-morning-nudge/index.ts
 * Cron: 0 7 * * * (7am UTC = 8am WAT)
 * Sends daily safe-to-spend push notification + WhatsApp to active users
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const TWILIO_FROM =
    Deno.env.get("TWILIO_WHATSAPP_FROM") ?? "whatsapp:+14155238886";
  const SYMBOLS: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
    KES: "KSh",
    GHS: "₵",
  };

  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "id, first_name, full_name, currency, whatsapp_number, whatsapp_active, plan",
    )
    .in("plan", ["premium", "trial"]);

  if (!profiles?.length)
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });

  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  let waSent = 0,
    pushSent = 0;

  for (const profile of profiles) {
    try {
      const sym = SYMBOLS[profile.currency] ?? "₦";
      const name =
        profile.first_name || profile.full_name?.split(" ")[0] || "there";

      const [budgetRes, expensesRes] = await Promise.all([
        supabase
          .from("budgets")
          .select("*")
          .eq("user_id", profile.id)
          .eq("is_active", true)
          .single(),
        supabase
          .from("expenses")
          .select("amount")
          .eq("user_id", profile.id)
          .gte("date", monthStart),
      ]);

      const budget = budgetRes.data;
      const expenses = expensesRes.data ?? [];
      if (!budget) continue;

      const totalBudget = Number(budget.total_amount || budget.amount || 0);
      const totalSpent = expenses.reduce(
        (s: number, e: any) => s + Number(e.amount || 0),
        0,
      );
      const remaining = Math.max(0, totalBudget - totalSpent);
      const daysLeft = Math.max(
        1,
        Math.ceil(
          (new Date(budget.end_date).getTime() - Date.now()) / 86400000,
        ),
      );
      const safeToday = Math.round(remaining / daysLeft);
      const pct =
        totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
      const emoji = pct >= 90 ? "🔴" : pct >= 70 ? "🟡" : "🟢";

      // Push notification via DB
      await supabase.from("notifications").insert({
        user_id: profile.id,
        type: "daily_nudge",
        title: `${emoji} Today you can spend ${sym}${safeToday.toLocaleString()}`,
        body: `${pct}% of budget used · ${daysLeft} days left this month`,
        read: false,
      });
      pushSent++;

      // WhatsApp nudge
      if (profile.whatsapp_active && profile.whatsapp_number) {
        const to = profile.whatsapp_number.startsWith("whatsapp:")
          ? profile.whatsapp_number
          : `whatsapp:+${profile.whatsapp_number.replace(/^\+/, "")}`;

        const msg =
          `☀️ Good morning ${name}!\n\n` +
          `${emoji} *Safe to spend today: ${sym}${safeToday.toLocaleString()}*\n\n` +
          `📊 ${sym}${totalSpent.toLocaleString()} spent of ${sym}${totalBudget.toLocaleString()} (${pct}%)\n` +
          `📅 ${daysLeft} days left\n\n` +
          `Reply *TODAY* for breakdown or log an expense anytime`;

        const r = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: "Basic " + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              From: TWILIO_FROM,
              To: to,
              Body: msg,
            }).toString(),
          },
        );
        if (r.ok) waSent++;
      }
    } catch (e) {
      console.error(`[morning-nudge] ${profile.id}:`, e);
    }
  }

  return new Response(
    JSON.stringify({ wa_sent: waSent, push_sent: pushSent }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
});

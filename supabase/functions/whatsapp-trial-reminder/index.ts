// supabase/functions/whatsapp-trial-reminder/index.ts
// Called by Supabase cron daily at 10am WAT
// Sends trial expiry warnings + welcome messages

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWhatsApp } from "../_shared/twilio.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    let sent = 0;

    // ── 1. Welcome messages — trial just activated + whatsapp_active just set true ──
    // Find users whose trial started today with WhatsApp connected
    const { data: newTrialUsers } = await supabase
      .from("profiles")
      .select("id, first_name, full_name, whatsapp_number, trial_ends_at")
      .not("whatsapp_number", "is", null)
      .eq("whatsapp_active", true)
      .eq("plan", "trial")
      .gte("trial_started_at", `${todayStr}T00:00:00`)
      .lte("trial_started_at", `${todayStr}T23:59:59`);

    for (const profile of newTrialUsers || []) {
      const name =
        profile.first_name || profile.full_name?.split(" ")[0] || "there";
      const endsAt = new Date(profile.trial_ends_at);
      const daysLeft = Math.ceil((endsAt.getTime() - now.getTime()) / 86400000);

      await sendWhatsApp(
        profile.whatsapp_number,
        `🎉 *Welcome to Truvllo Premium, ${name}!*\n\n` +
          `Your 7-day free trial is now active.\n\n` +
          `Here's what you can do:\n` +
          `📊 *BALANCE* — Budget summary\n` +
          `💸 *TODAY* — Today's spending\n` +
          `📄 Send a PDF — Import bank statement\n` +
          `💬 Log expenses by chat\n\n` +
          `Trial ends in ${daysLeft} days. Enjoy! 🚀`,
      );
      sent++;
      await new Promise((r) => setTimeout(r, 200));
    }

    // ── 2. Trial expiry warnings ──────────────────────────────────────────────
    const { data: trialUsers } = await supabase
      .from("profiles")
      .select("id, first_name, full_name, whatsapp_number, trial_ends_at")
      .not("whatsapp_number", "is", null)
      .eq("whatsapp_active", true)
      .eq("plan", "trial")
      .not("trial_ends_at", "is", null);

    for (const profile of trialUsers || []) {
      const name =
        profile.first_name || profile.full_name?.split(" ")[0] || "there";
      const endsAt = new Date(profile.trial_ends_at);
      const daysLeft = Math.ceil((endsAt.getTime() - now.getTime()) / 86400000);

      if (daysLeft === 3) {
        await sendWhatsApp(
          profile.whatsapp_number,
          `⏰ *3 days left on your trial, ${name}*\n\n` +
            `Your Premium trial expires in 3 days. After that, AI features and WhatsApp access will be paused.\n\n` +
            `Upgrade now to keep everything:\n` +
            `👉 truvllo.app/upgrade\n\n` +
            `Monthly: ₦6,500 · Annual: ₦58,500 (save 25%)`,
        );
        sent++;
      } else if (daysLeft === 1) {
        await sendWhatsApp(
          profile.whatsapp_number,
          `🚨 *Last day of your trial, ${name}!*\n\n` +
            `Your Premium trial expires *tomorrow*. Don't lose access to:\n` +
            `✅ AI Spending Analyst\n` +
            `✅ AI Savings Coach\n` +
            `✅ WhatsApp agent\n` +
            `✅ Bank statement import\n\n` +
            `Upgrade in 2 minutes:\n` +
            `👉 truvllo.app/upgrade`,
        );
        sent++;
      } else if (daysLeft <= 0) {
        // Trial expired — send one final message
        await sendWhatsApp(
          profile.whatsapp_number,
          `😢 *Your trial has ended, ${name}*\n\n` +
            `Your 7-day Premium trial is over. Your budget data is safe — we've just paused the AI features.\n\n` +
            `Upgrade anytime to reactivate:\n` +
            `👉 truvllo.app/upgrade\n\n` +
            `Monthly: ₦6,500 · Annual: ₦58,500`,
        );
        sent++;

        // Update profile to free plan
        await supabase
          .from("profiles")
          .update({ plan: "free", whatsapp_active: false })
          .eq("id", profile.id);
      }

      await new Promise((r) => setTimeout(r, 200));
    }

    return new Response(
      JSON.stringify({ sent, timestamp: now.toISOString() }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[whatsapp-trial-reminder]", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

// supabase/functions/whatsapp-daily-summary/index.ts
// Called by Supabase cron at 9pm WAT daily
// Sends spending summary to all active WhatsApp users

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWhatsApp, formatNaira } from "../_shared/twilio.ts";

Deno.serve(async (req) => {
  // Allow cron + manual trigger
  if (req.method === "OPTIONS") return new Response("ok");

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const today = new Date().toISOString().split("T")[0];
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    )
      .toISOString()
      .split("T")[0];

    // Get all users with active WhatsApp + trial/premium plan
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, full_name, whatsapp_number, plan")
      .not("whatsapp_number", "is", null)
      .eq("whatsapp_active", true)
      .in("plan", ["trial", "premium"]);

    if (!profiles?.length) return new Response("no users", { status: 200 });

    let sent = 0;
    const errors: string[] = [];

    for (const profile of profiles) {
      try {
        const name =
          profile.first_name || profile.full_name?.split(" ")[0] || "there";
        const userId = profile.id;
        const phone = profile.whatsapp_number;

        // Get today's expenses
        const { data: todayExpenses } = await supabase
          .from("expenses")
          .select("amount, category, description")
          .eq("user_id", userId)
          .eq("date", today);

        // Get active budget + month total
        const [budgetRes, monthExpenses] = await Promise.all([
          supabase
            .from("budgets")
            .select("*")
            .eq("user_id", userId)
            .eq("is_active", true)
            .single(),
          supabase
            .from("expenses")
            .select("amount")
            .eq("user_id", userId)
            .gte("date", monthStart),
        ]);

        const budget = budgetRes.data;
        const todayTotal = (todayExpenses || []).reduce(
          (s, e) => s + Number(e.amount),
          0,
        );
        const monthTotal = (monthExpenses.data || []).reduce(
          (s, e) => s + Number(e.amount),
          0,
        );
        const totalBudget = Number(budget?.total_amount || budget?.amount || 0);
        const remaining = Math.max(0, totalBudget - monthTotal);
        const pct =
          totalBudget > 0 ? Math.round((monthTotal / totalBudget) * 100) : 0;
        const daysLeft = budget
          ? Math.ceil(
              (new Date(budget.end_date).getTime() - Date.now()) / 86400000,
            )
          : 0;
        const safeToday = daysLeft > 0 ? Math.round(remaining / daysLeft) : 0;

        const paceEmoji = pct >= 100 ? "🔴" : pct >= 80 ? "🟡" : "🟢";

        // Top category today
        const catMap: Record<string, number> = {};
        (todayExpenses || []).forEach((e) => {
          catMap[e.category] = (catMap[e.category] ?? 0) + Number(e.amount);
        });
        const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

        let message = `📊 *Daily summary, ${name}*\n\n`;

        if (todayTotal === 0) {
          message += `Nothing logged today 👍\n\n`;
        } else {
          message += `💸 Today: *${formatNaira(todayTotal)}*`;
          if (topCat) message += ` (mostly ${topCat[0]})`;
          message += `\n`;
          if (todayExpenses && todayExpenses.length > 0) {
            const lines = todayExpenses
              .slice(0, 3)
              .map(
                (e) => `  • ${e.description}: ${formatNaira(Number(e.amount))}`,
              )
              .join("\n");
            message += `${lines}\n`;
            if (todayExpenses.length > 3)
              message += `  ...+${todayExpenses.length - 3} more\n`;
          }
          message += `\n`;
        }

        if (budget) {
          message += `${paceEmoji} Month: ${formatNaira(monthTotal)} / ${formatNaira(totalBudget)} (${pct}%)\n`;
          message += `💰 Remaining: ${formatNaira(remaining)}\n`;
          message += `✅ Safe tomorrow: ${formatNaira(safeToday)}\n`;
          if (daysLeft > 0) message += `📅 ${daysLeft} days left in budget`;
        }

        await sendWhatsApp(phone, message);
        sent++;

        // Small delay to avoid Twilio rate limits
        await new Promise((r) => setTimeout(r, 200));
      } catch (e) {
        errors.push(`${profile.id}: ${e}`);
        console.error(`[daily-summary] Error for ${profile.id}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ sent, errors: errors.length, details: errors }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[whatsapp-daily-summary]", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

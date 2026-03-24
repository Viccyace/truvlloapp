import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth, logUsage } from "../_shared/auth.ts";
import { callClaude, fmtCurrency } from "../_shared/claude.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const { user, supabase } = await requireAuth(req, "savings_coach");
    const { expenses, budget, currency = "NGN" } = await req.json();

    const catTotals: Record<string, number> = {};
    for (const e of expenses) {
      catTotals[e.category] = (catTotals[e.category] ?? 0) + e.amount;
    }
    const totalSpent = Object.values(catTotals).reduce(
      (s: number, v: number) => s + v,
      0,
    );
    const remaining = Math.max(0, budget.amount - totalSpent);
    const topCat = Object.entries(catTotals).sort(
      (a, b) => (b[1] as number) - (a[1] as number),
    )[0];

    const tip = await callClaude({
      system: `You are a savings coach for a Nigerian budgeting app called Truvllo.
Give ONE specific, actionable savings tip based on the user's actual data.
- Reference a real number (e.g. "Cutting Bolt usage by half saves you ₦X").
- 1-2 sentences. No fluff. No bullet points.
- Speak like an encouraging smart friend. Second person.`,
      user: `Budget: ${fmtCurrency(budget.amount, currency)}
Spent: ${fmtCurrency(totalSpent, currency)} | Remaining: ${fmtCurrency(remaining, currency)}
Top category: ${topCat?.[0]} at ${fmtCurrency((topCat?.[1] as number) ?? 0, currency)}

All categories:
${Object.entries(catTotals)
  .map(([c, a]) => `  ${c}: ${fmtCurrency(a as number, currency)}`)
  .join("\n")}

Give one specific savings tip.`,
      maxTokens: 160,
    });

    return new Response(JSON.stringify({ tip }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

logUsage("savings_coach");

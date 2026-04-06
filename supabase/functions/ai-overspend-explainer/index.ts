import { resolveCorsHeaders } from "../_shared/cors.ts";
import { requireAuth, logUsage } from "../_shared/auth.ts";
import { callClaude, parseJSON, fmtCurrency } from "../_shared/claude.ts";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = resolveCorsHeaders(origin);
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const { user, supabase } = await requireAuth(req, "overspend_explainer");
    const {
      expenses,
      budget,
      expectedSpend,
      currency = "NGN",
    } = await req.json();

    const catTotals: Record<string, number> = {};
    for (const e of expenses) {
      catTotals[e.category] = (catTotals[e.category] ?? 0) + e.amount;
    }
    const totalSpent = Object.values(catTotals).reduce(
      (s: number, v: number) => s + v,
      0,
    );
    const overAmount = totalSpent - expectedSpend;
    const overPct = Math.round((overAmount / expectedSpend) * 100);

    const raw = await callClaude({
      system: `You are a budget coach for a Nigerian app. The user is over spending pace.
Explain WHY and give 2-3 SPECIFIC suggested cuts with exact savings amounts.

Return ONLY JSON:
{
  "explanation": "1-2 sentence plain English explanation referencing specific categories",
  "cuts": [
    { "category": "food", "action": "Skip one takeout order", "saving": 5000 },
    { "category": "transport", "action": "Use public transport twice this week", "saving": 3500 }
  ]
}

Be specific with amounts. Reference actual categories from their data.`,
      user: `Budget: ${fmtCurrency(budget.amount, currency)}
Expected by today: ${fmtCurrency(expectedSpend, currency)}
Actually spent: ${fmtCurrency(totalSpent, currency)}
Over by: ${fmtCurrency(overAmount, currency)} (${overPct}% over pace)

Categories:
${Object.entries(catTotals)
  .map(([c, a]) => `  ${c}: ${fmtCurrency(a as number, currency)}`)
  .join("\n")}

Explain overspend and suggest cuts.`,
      maxTokens: 400,
      json: true,
    });

    const parsed = parseJSON<{ explanation: string; cuts: unknown[] }>(raw);

    return new Response(JSON.stringify(parsed), {
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

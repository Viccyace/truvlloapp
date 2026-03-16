import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { callClaude, parseJSON, fmtCurrency } from "../_shared/claude.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    await requireAuth(req);
    const { income, goal, currency = "NGN", dependents = 0 } = await req.json();

    if (!income || income <= 0) {
      return new Response(JSON.stringify({ error: "income is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = await callClaude({
      system: `You are a personal finance advisor for Nigeria. Help young professionals 22-35 build realistic monthly budgets.

Context:
- Nigerian cost of living: Lagos is expensive, other cities less so
- Common fixed costs: rent, DSTV/Netflix, data bundles, transport
- Nigerians often have family obligations
- Goal: realistic, achievable budgets — not perfect theoretical ones

Return ONLY JSON:
{
  "breakdown": [
    { "category": "food", "amount": 40000, "pct": 22, "note": "Brief tip" },
    ... (8 categories: food, transport, bills, shopping, health, airtime, savings, entertainment)
  ],
  "savings_amount": 30000,
  "advice": "2-3 sentence personalised advice referencing their goal"
}

All amounts must sum to the exact income amount.`,
      user: `Income: ${fmtCurrency(income, currency)}
Goal: ${goal || "general savings"}
Dependents: ${dependents}
Currency: ${currency}

Suggest a realistic monthly budget breakdown.`,
      maxTokens: 700,
      json: true,
    });

    const parsed = parseJSON<{ breakdown: unknown[]; savings_amount: number; advice: string }>(raw);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

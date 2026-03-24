import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth, logUsage } from "../_shared/auth.ts";
import { callClaude, fmtCurrency } from "../_shared/claude.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const { user, supabase } = await requireAuth(req, "spending_analyst");
    const { expenses, budget, currency = "NGN" } = await req.json();

    const catTotals: Record<string, number> = {};
    for (const e of expenses) {
      catTotals[e.category] = (catTotals[e.category] ?? 0) + e.amount;
    }
    const totalSpent = Object.values(catTotals).reduce(
      (s: number, v: number) => s + v,
      0,
    );
    const sortedCats = Object.entries(catTotals)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .map(
        ([cat, amt]) =>
          `  ${cat}: ${fmtCurrency(amt as number, currency)} (${Math.round(((amt as number) / totalSpent) * 100)}%)`,
      )
      .join("\n");

    const system = `You are a personal finance analyst for a Nigerian budgeting app called Truvllo.
Give a SHORT (2-3 sentences), plain-English, specific insight about the user's spending.
- Be direct and data-driven. Reference actual numbers.
- Mention the top spending category and whether it's healthy.
- Avoid generic advice. Speak like a smart friend who knows money.
- Write in second person. No bullet points.`;

    const insight = await callClaude({
      system,
      user: `Budget: ${fmtCurrency(budget.amount, currency)}
Total spent: ${fmtCurrency(totalSpent, currency)} (${Math.round((totalSpent / budget.amount) * 100)}% of budget)
Transactions: ${expenses.length}

By category:
${sortedCats}

Write a 2-3 sentence spending insight.`,
      maxTokens: 200,
    });

    return new Response(JSON.stringify({ insight }), {
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

logUsage("spending_analyst");

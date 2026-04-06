import { resolveCorsHeaders } from "../_shared/cors.ts";
import { requireAuth, logUsage } from "../_shared/auth.ts";
import { callClaude, parseJSON } from "../_shared/claude.ts";

const VALID_CATEGORIES = [
  "food",
  "transport",
  "bills",
  "shopping",
  "health",
  "airtime",
  "entertainment",
  "other",
];

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
    const { user, supabase } = await requireAuth(req, "nl_entry");
    const { text, currency = "NGN" } = await req.json();

    if (!text?.trim()) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const raw = await callClaude({
      model: "claude-haiku-4-5-20251001",
      system: `You are an expense parser for a Nigerian budgeting app.
Parse natural language expense descriptions into structured JSON.

Valid categories: food, transport, bills, shopping, health, airtime, entertainment, other

Rules:
- amount: extract the number (remove commas, currency symbols). Return 0 if not found.
- category: infer from context. "lunch/food/suya/chicken republic" → food. "bolt/uber/bus" → transport. "netflix/cinema" → entertainment. "airtime/data/mtn/airtel" → airtime.
- description: clean, concise description. Remove amount and currency symbols.
- date: use today unless user says "yesterday" or gives a specific date. Format YYYY-MM-DD.
- confidence: 0.0 to 1.0.

Return ONLY JSON: { description, amount, category, date, confidence }`,
      user: `Today: ${today}\nParse: "${text}"`,
      maxTokens: 200,
      json: true,
    });

    const parsed = parseJSON<{
      description: string;
      amount: number;
      category: string;
      date: string;
      confidence: number;
    }>(raw);

    return new Response(
      JSON.stringify({
        description: String(parsed.description ?? text).slice(0, 200),
        amount: Math.max(0, Number(parsed.amount ?? 0)),
        category: VALID_CATEGORIES.includes(parsed.category)
          ? parsed.category
          : "other",
        date: /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : today,
        confidence: Math.min(1, Math.max(0, Number(parsed.confidence ?? 0.8))),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

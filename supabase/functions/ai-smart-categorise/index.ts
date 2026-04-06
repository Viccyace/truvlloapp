import { resolveCorsHeaders } from "../_shared/cors.ts";
import { requireAuth, logUsage } from "../_shared/auth.ts";
import { callClaude, parseJSON } from "../_shared/claude.ts";

const VALID = [
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
    const { user, supabase } = await requireAuth(req, "smart_categorise");
    const { description } = await req.json();

    if (!description?.trim()) {
      return new Response(
        JSON.stringify({
          category: "other",
          confidence: 0.5,
          alternatives: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const raw = await callClaude({
      model: "claude-haiku-4-5-20251001",
      system: `You are an expense categoriser for a Nigerian budgeting app.
Categorise into one of: food, transport, bills, shopping, health, airtime, entertainment, other

- food: restaurants, fast food, groceries, suya, chicken republic, shoprite food
- transport: bolt, uber, danfo, BRT, keke, petrol, car maintenance
- bills: EKEDC, rent, water, wifi, spectranet, smile internet
- shopping: clothes, shoes, electronics, jumia, konga
- health: pharmacy, hospital, gym, medication
- airtime: MTN, Airtel, Glo, 9mobile, data bundle, recharge
- entertainment: netflix, showmax, dstv, gotv, cinema, spotify
- other: anything else

Return ONLY JSON: { category, confidence (0-1), alternatives (2 other possible categories) }`,
      user: `Categorise: "${description}"`,
      maxTokens: 100,
      json: true,
    });

    const parsed = parseJSON<{
      category: string;
      confidence: number;
      alternatives: string[];
    }>(raw);

    return new Response(
      JSON.stringify({
        category: VALID.includes(parsed.category) ? parsed.category : "other",
        confidence: Math.min(1, Math.max(0, Number(parsed.confidence ?? 0.8))),
        alternatives: (parsed.alternatives ?? [])
          .filter((a: string) => VALID.includes(a))
          .slice(0, 2),
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

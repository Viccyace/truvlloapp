// supabase/functions/ai-import-statement/index.ts
// Accepts a PDF or CSV bank statement, parses it with Claude AI,
// returns structured transaction data for user review before import.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { callClaude, parseJSON } from "../_shared/claude.ts";

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const user = await requireAuth(req);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const currency = (formData.get("currency") as string) || "NGN";
    const budgetId = formData.get("budget_id") as string;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith(".csv");
    const isPDF = fileName.endsWith(".pdf");

    if (!isCSV && !isPDF) {
      return new Response(
        JSON.stringify({ error: "Only PDF and CSV files are supported" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let transactions: Transaction[] = [];

    // ── CSV parsing ────────────────────────────────────────────────────────
    if (isCSV) {
      const text = await file.text();
      transactions = await parseCSVWithClaude(text, currency);
    }

    // ── PDF parsing ────────────────────────────────────────────────────────
    if (isPDF) {
      const bytes = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
      transactions = await parsePDFWithClaude(base64, currency);
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: transactions.length,
        transactions,
        user_id: user.id,
        budget_id: budgetId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("ai-import-statement error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── Types ──────────────────────────────────────────────────────────────────
interface Transaction {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  description: string;
  amount: number; // always positive — direction determined by type
  type: "debit" | "credit";
  category: string;
  confidence: number; // 0-1 how confident Claude is in the category
  raw: string; // original line from statement
}

// ── CSV parser ─────────────────────────────────────────────────────────────
async function parseCSVWithClaude(
  csvText: string,
  currency: string,
): Promise<Transaction[]> {
  // Limit to first 200 rows to avoid token limits
  const lines = csvText.split("\n").slice(0, 200).join("\n");

  const prompt = `You are a bank statement parser. Parse this CSV bank statement and extract all transactions.

CSV content:
${lines}

Return ONLY a JSON array of transactions. Each transaction must have:
- date: ISO date string (YYYY-MM-DD)
- description: cleaned merchant/description text (remove reference numbers, codes)
- amount: positive number (no currency symbol)
- type: "debit" (money out) or "credit" (money in)
- category: one of: Food, Transport, Shopping, Bills, Health, Entertainment, Airtime, Savings, Income, Transfer, Other
- confidence: 0.0-1.0 how confident you are in the category

Rules:
- Only include debits (money going OUT) — skip credits/income unless they look like refunds
- Skip balance-only rows, headers, totals
- Clean up descriptions — remove transaction IDs, dates embedded in description
- Infer category from merchant name intelligently
- Currency is ${currency}

Return ONLY the JSON array, no explanation, no markdown.`;

  const response = await callClaude(prompt);
  const raw = parseJSON<Transaction[]>(response);

  return (raw || []).map((t, i) => ({
    ...t,
    id: `import_${Date.now()}_${i}`,
    raw: t.description,
  }));
}

// ── PDF parser ─────────────────────────────────────────────────────────────
async function parsePDFWithClaude(
  base64PDF: string,
  currency: string,
): Promise<Transaction[]> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64PDF,
              },
            },
            {
              type: "text",
              text: `Parse this bank statement PDF and extract all debit transactions (money going out).

Return ONLY a JSON array. Each item must have:
- date: ISO date string (YYYY-MM-DD)  
- description: cleaned merchant name (remove codes, reference numbers)
- amount: positive number only (no currency symbols)
- type: "debit" (money out) or "credit" (money in — only include if it's a refund)
- category: one of: Food, Transport, Shopping, Bills, Health, Entertainment, Airtime, Savings, Income, Transfer, Other
- confidence: 0.0-1.0 confidence in category

Rules:
- Skip credits/income, balance rows, headers, opening/closing balances
- Infer category intelligently from merchant name
- Currency is ${currency}
- Return ONLY the JSON array, no markdown, no explanation`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${err}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "[]";
  const cleaned = text.replace(/```json|```/g, "").trim();

  let parsed: Transaction[] = [];
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    parsed = [];
  }

  return parsed.map((t, i) => ({
    ...t,
    id: `import_${Date.now()}_${i}`,
    raw: t.description,
  }));
}

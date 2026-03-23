// supabase/functions/ai-import-statement/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY not set");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const currency = (formData.get("currency") as string) || "NGN";

    if (!file) throw new Error("No file provided");

    const fileName = file.name.toLowerCase();
    const isPDF = fileName.endsWith(".pdf");
    const isCSV =
      fileName.endsWith(".csv") ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".txt");

    if (!isPDF && !isCSV) {
      throw new Error(
        "Unsupported file type. Please upload a PDF or CSV bank statement.",
      );
    }

    const PROMPT = `Extract all transactions from this bank statement.
Return ONLY a JSON array with NO markdown, NO backticks, NO explanation — just the raw JSON array.

Each transaction object must have exactly these fields:
- id: unique string like "txn_1", "txn_2" etc
- date: ISO date string YYYY-MM-DD
- description: the merchant name or transaction description
- amount: positive number (no currency symbols)
- type: exactly "debit" or "credit"
- category: exactly one of: food, transport, bills, shopping, health, airtime, entertainment, other

Currency context: ${currency}

Example output:
[{"id":"txn_1","date":"2026-03-01","description":"Shoprite Supermarket","amount":5200,"type":"debit","category":"food"},{"id":"txn_2","date":"2026-03-02","description":"Bolt Technologies","amount":1800,"type":"debit","category":"transport"}]`;

    let jsonText = "";

    if (isPDF) {
      // Send PDF as base64 document to Claude
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++)
        binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64,
                  },
                },
                { type: "text", text: PROMPT },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(
          `AI service error: ${res.status} — ${body.slice(0, 200)}`,
        );
      }

      const data = await res.json();
      jsonText = data.content?.[0]?.text ?? "";
    } else {
      // CSV/TXT — read as text
      const csvText = await file.text();

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: `${PROMPT}\n\nBank statement content:\n${csvText.slice(0, 10000)}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(
          `AI service error: ${res.status} — ${body.slice(0, 200)}`,
        );
      }

      const data = await res.json();
      jsonText = data.content?.[0]?.text ?? "";
    }

    // Strip markdown if Claude added any
    const clean = jsonText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let transactions;
    try {
      transactions = JSON.parse(clean);
    } catch {
      throw new Error(
        "Could not parse transactions from this statement. Try a different file format.",
      );
    }

    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new Error(
        "No transactions found. Make sure this is a bank statement with transaction data.",
      );
    }

    return new Response(
      JSON.stringify({ transactions, count: transactions.length }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[ai-import-statement]", err);
    return new Response(
      JSON.stringify({
        error: (err as Error).message || "Failed to parse statement",
      }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }
});

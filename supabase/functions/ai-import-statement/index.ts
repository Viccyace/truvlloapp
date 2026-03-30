import Anthropic from "npm:@anthropic-ai/sdk";
import {
  checkRateLimit,
  logUsage,
  getUserFromJWT,
  rateLimitResponse,
} from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FEATURE = "bank_import";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    const userId = await getUserFromJWT(authHeader);
    if (!userId)
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please log in again." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );

    // ── Rate limit check ──────────────────────────────────────────────────────
    const limitCheck = await checkRateLimit(userId, FEATURE, authHeader!);
    if (!limitCheck.allowed) return rateLimitResponse(limitCheck);

    // ── Parse form ────────────────────────────────────────────────────────────
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const currency = (form.get("currency") as string) || "NGN";
    const budgetId = (form.get("budget_id") as string) || null;

    if (!file)
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const name = file.name.toLowerCase();
    const isPDF = name.endsWith(".pdf");
    if (
      !isPDF &&
      !name.endsWith(".csv") &&
      !name.endsWith(".xlsx") &&
      !name.endsWith(".xls")
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Unsupported file type. Upload a PDF, CSV, or Excel bank statement.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ── Build Claude message ──────────────────────────────────────────────────
    const anthropic = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
    });
    let messageContent: Anthropic.MessageParam["content"];

    if (isPDF) {
      const base64 = btoa(
        String.fromCharCode(...new Uint8Array(await file.arrayBuffer())),
      );
      messageContent = [
        {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: base64,
          },
        },
        { type: "text", text: buildPrompt(currency) },
      ];
    } else {
      messageContent = [
        {
          type: "text",
          text: `Bank statement:\n\n${await file.text()}\n\n${buildPrompt(currency)}`,
        },
      ];
    }

    // ── Call Haiku ────────────────────────────────────────────────────────────
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: messageContent }],
    });

    const rawText = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);

    if (!jsonMatch)
      return new Response(
        JSON.stringify({
          error:
            "No transactions found in this file. Make sure it is a real bank statement.",
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );

    interface Transaction {
      date?: string;
      description?: string;
      desc?: string;
      amount: number;
      type?: string;
      category?: string;
    }
    let transactions: Transaction[];
    try {
      transactions = JSON.parse(jsonMatch[0]);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response. Please try again.",
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const cleaned = transactions
      .filter((t) => t.amount && t.amount > 0)
      .map((t, i) => ({
        id: `txn_${i}_${Date.now()}`,
        date: t.date || new Date().toISOString().split("T")[0],
        description: t.description || t.desc || "Transaction",
        amount: Math.abs(Number(t.amount)),
        type: t.type || "debit",
        category: t.category || inferCategory(t.description || ""),
        budget_id: budgetId,
      }));

    // ── Log usage after success ───────────────────────────────────────────────
    await logUsage(userId, FEATURE);

    return new Response(
      JSON.stringify({
        transactions: cleaned,
        total: cleaned.length,
        usage: {
          monthly_count: (limitCheck.monthly_count ?? 0) + 1,
          monthly_limit: limitCheck.monthly_limit,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const friendly = msg.includes("credit balance")
      ? "API credits exhausted. Please contact support."
      : `AI service error — ${msg}`;
    return new Response(JSON.stringify({ error: friendly }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildPrompt(currency: string): string {
  return `Parse this bank statement. Return ONLY a JSON array, no markdown, no explanation.
Each object: { date: "YYYY-MM-DD", description: "clean name", amount: number (positive), type: "debit"|"credit", category: "food"|"transport"|"bills"|"shopping"|"health"|"airtime"|"entertainment"|"other" }
Currency: ${currency}. Skip balance rows and headers. Return array now:`;
}

function inferCategory(desc: string): string {
  const d = desc.toLowerCase();
  if (/uber|bolt|fuel|petrol|bus|transport|ride/.test(d)) return "transport";
  if (/shoprite|spar|grocery|food|restaurant|eat|lunch/.test(d)) return "food";
  if (/mtn|airtel|glo|airtime|data|dstv|electricity|nepa/.test(d))
    return "bills";
  if (/netflix|spotify|showmax|gaming|prime/.test(d)) return "entertainment";
  if (/hospital|pharmacy|clinic|medical|health/.test(d)) return "health";
  if (/jumia|konga|shop|store|mall|fashion/.test(d)) return "shopping";
  return "other";
}

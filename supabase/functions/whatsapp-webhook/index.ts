// supabase/functions/whatsapp-webhook/index.ts
// Receives incoming WhatsApp messages from Twilio and routes them

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWhatsApp, formatNaira } from "../_shared/twilio.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ok = (msg = "ok") => new Response(msg, { status: 200, headers: CORS });
const err = (msg: string, status = 400) =>
  new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return ok();

  try {
    // Parse Twilio form body
    const text = await req.text();
    const params = new URLSearchParams(text);
    const from = params.get("From") ?? ""; // "whatsapp:+2348123456789"
    const body = (params.get("Body") ?? "").trim();
    const numMedia = parseInt(params.get("NumMedia") ?? "0");
    const mediaUrl = params.get("MediaUrl0") ?? "";
    const mediaType = params.get("MediaContentType0") ?? "";

    if (!from) return err("No sender");

    // Extract phone number — strip "whatsapp:+234" prefix
    const rawPhone = from
      .replace("whatsapp:", "")
      .replace("+234", "")
      .replace("+", "");

    // Init Supabase with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Look up user by WhatsApp number
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "id, full_name, first_name, plan, whatsapp_active, whatsapp_number",
      )
      .or(
        `whatsapp_number.eq.${rawPhone},whatsapp_number.eq.0${rawPhone},whatsapp_number.eq.+234${rawPhone}`,
      )
      .single();

    if (!profile) {
      await sendWhatsApp(
        from,
        `👋 Hi! I don't recognise this number.\n\nTo use Truvllo on WhatsApp, go to your dashboard and connect your WhatsApp number.\n\n👉 truvllo.app/dashboard`,
      );
      return ok();
    }

    const name =
      profile.first_name || profile.full_name?.split(" ")[0] || "there";
    const userId = profile.id;

    // Check plan — must be trial or premium
    if (profile.plan === "free" || !profile.whatsapp_active) {
      await sendWhatsApp(
        from,
        `👋 Hi ${name}! Your WhatsApp agent isn't active yet.\n\nLog your first expense on Truvllo to activate your 7-day free trial.\n\n👉 truvllo.app/dashboard`,
      );
      return ok();
    }

    // ── Route by message type ─────────────────────────────────────────────────

    // PDF received — bank statement import
    if (numMedia > 0 && mediaType.includes("pdf")) {
      await handlePDFImport(supabase, userId, from, name, mediaUrl);
      return ok();
    }

    const cmd = body.toLowerCase().trim();

    // YES/NO confirmation for pending import
    if (cmd === "yes" || cmd === "y") {
      await handleImportConfirm(supabase, userId, from, name);
      return ok();
    }
    if (cmd === "no" || cmd === "n") {
      await supabase.from("whatsapp_pending").delete().eq("user_id", userId);
      await sendWhatsApp(
        from,
        "❌ Import cancelled. Send another PDF anytime.",
      );
      return ok();
    }

    // Balance / budget check
    if (cmd.includes("balance") || cmd.includes("budget") || cmd === "b") {
      await handleBalance(supabase, userId, from, name);
      return ok();
    }

    // Today's spending
    if (cmd.includes("today") || cmd.includes("spent today")) {
      await handleToday(supabase, userId, from);
      return ok();
    }

    // Help / start
    if (
      cmd === "start" ||
      cmd === "help" ||
      cmd === "hi" ||
      cmd === "hello" ||
      cmd === "menu"
    ) {
      await sendWhatsApp(
        from,
        `👋 Hi ${name}! I'm your Truvllo budget agent.\n\n` +
          `Here's what I can do:\n\n` +
          `📊 *BALANCE* — Your budget summary\n` +
          `💸 *TODAY* — What you spent today\n` +
          `📄 Send a *PDF* — Import bank statement\n\n` +
          `Or just ask me anything about your budget! 💬`,
      );
      return ok();
    }

    // Expense logging — "spent X on Y" or "X for Y"
    if (isExpenseMessage(cmd)) {
      await handleLogExpense(supabase, userId, from, name, body);
      return ok();
    }

    // Default — AI response
    await handleAIChat(supabase, userId, from, name, body);
    return ok();
  } catch (e) {
    console.error("[whatsapp-webhook] Error:", e);
    return ok(); // Always return 200 to Twilio
  }
});

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleBalance(
  supabase: any,
  userId: string,
  from: string,
  name: string,
) {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const [budgetRes, expensesRes] = await Promise.all([
    supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single(),
    supabase
      .from("expenses")
      .select("amount, category")
      .eq("user_id", userId)
      .gte("date", monthStart),
  ]);

  const budget = budgetRes.data;
  const expenses = expensesRes.data ?? [];

  if (!budget) {
    await sendWhatsApp(
      from,
      `📊 No active budget found. Set one up at truvllo.app/budget`,
    );
    return;
  }

  const totalBudget = Number(budget.total_amount || budget.amount || 0);
  const totalSpent = expenses.reduce(
    (s: number, e: any) => s + Number(e.amount || 0),
    0,
  );
  const remaining = Math.max(0, totalBudget - totalSpent);
  const pct =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const daysLeft = Math.ceil(
    (new Date(budget.end_date).getTime() - Date.now()) / 86400000,
  );
  const safeToday = daysLeft > 0 ? Math.round(remaining / daysLeft) : 0;
  const emoji = pct >= 100 ? "🔴" : pct >= 80 ? "🟡" : "🟢";

  await sendWhatsApp(
    from,
    `📊 *${budget.name}*\n\n` +
      `${emoji} Spent: ${formatNaira(totalSpent)} / ${formatNaira(totalBudget)} (${pct}%)\n` +
      `💰 Remaining: ${formatNaira(remaining)}\n` +
      `📅 Days left: ${daysLeft}\n` +
      `✅ Safe to spend today: ${formatNaira(safeToday)}\n\n` +
      `Reply *TODAY* for today's breakdown`,
  );
}

async function handleToday(supabase: any, userId: string, from: string) {
  const today = new Date().toISOString().split("T")[0];

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, category, description")
    .eq("user_id", userId)
    .eq("date", today)
    .order("created_at", { ascending: false });

  if (!expenses?.length) {
    await sendWhatsApp(
      from,
      `💸 No expenses logged today yet.\n\nSend a PDF or log at truvllo.app/expenses`,
    );
    return;
  }

  const total = expenses.reduce(
    (s: number, e: any) => s + Number(e.amount || 0),
    0,
  );
  const lines = expenses
    .slice(0, 5)
    .map((e: any) => `• ${e.description}: ${formatNaira(Number(e.amount))}`)
    .join("\n");

  await sendWhatsApp(
    from,
    `💸 *Today's spending*\n\n${lines}${expenses.length > 5 ? `\n...and ${expenses.length - 5} more` : ""}\n\n` +
      `*Total: ${formatNaira(total)}*\n\nReply *BALANCE* for full budget summary`,
  );
}

async function handlePDFImport(
  supabase: any,
  userId: string,
  from: string,
  name: string,
  mediaUrl: string,
) {
  await sendWhatsApp(
    from,
    `📄 Got your statement! Analysing transactions...\n\nThis takes about 10-15 seconds ⏳`,
  );

  try {
    // Download PDF from Twilio
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const pdfRes = await fetch(mediaUrl, {
      headers: { Authorization: "Basic " + btoa(`${accountSid}:${authToken}`) },
    });
    const pdfBlob = await pdfRes.blob();

    // Get user's currency
    const { data: profile } = await supabase
      .from("profiles")
      .select("currency")
      .eq("id", userId)
      .single();
    const currency = profile?.currency || "NGN";

    // Get active budget
    const { data: budget } = await supabase
      .from("budgets")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    // Call ai-import-statement Edge Function
    const form = new FormData();
    form.append("file", pdfBlob, "statement.pdf");
    form.append("currency", currency);
    form.append("budget_id", budget?.id ?? "");
    form.append("user_id", userId); // Pass user_id directly — no JWT needed

    const importRes = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-import-statement`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: form,
      },
    );

    const importData = await importRes.json();

    if (!importRes.ok || !importData.transactions?.length) {
      await sendWhatsApp(
        from,
        `❌ Couldn't extract transactions. Make sure it's a bank statement PDF.\n\nTry again or import at truvllo.app/expenses`,
      );
      return;
    }

    const txns = importData.transactions;
    const total = txns.reduce(
      (s: number, t: any) => s + Number(t.amount || 0),
      0,
    );

    // Save pending import to DB for YES confirmation
    await supabase.from("whatsapp_pending").upsert({
      user_id: userId,
      transactions: txns,
      budget_id: budget?.id,
      created_at: new Date().toISOString(),
    });

    // Category summary
    const cats: Record<string, number> = {};
    txns.forEach((t: any) => {
      cats[t.category] = (cats[t.category] ?? 0) + Number(t.amount);
    });
    const catLines = Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat, amt]) => `  • ${cat}: ${formatNaira(amt as number)}`)
      .join("\n");

    await sendWhatsApp(
      from,
      `✅ Found *${txns.length} transactions* totalling ${formatNaira(total)}\n\n` +
        `Top categories:\n${catLines}\n\n` +
        `Import all to your Truvllo budget?\n\n` +
        `Reply *YES* to import or *NO* to cancel`,
    );
  } catch (e) {
    console.error("[PDF Import]", e);
    await sendWhatsApp(
      from,
      `❌ Something went wrong analysing your statement. Please try again.`,
    );
  }
}

async function handleImportConfirm(
  supabase: any,
  userId: string,
  from: string,
  name: string,
) {
  const { data: pending } = await supabase
    .from("whatsapp_pending")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!pending) {
    await sendWhatsApp(
      from,
      `No pending import found. Send a PDF bank statement to get started.`,
    );
    return;
  }

  const txns = pending.transactions;
  const today = new Date().toISOString().split("T")[0];

  // Insert all transactions
  const rows = txns.map((t: any) => ({
    user_id: userId,
    budget_id: pending.budget_id,
    description: t.description,
    amount: Number(t.amount),
    category: t.category,
    date: t.date || today,
    notes: "Imported via WhatsApp",
  }));

  const { error } = await supabase.from("expenses").insert(rows);

  if (error) {
    await sendWhatsApp(
      from,
      `❌ Import failed. Please try again or import at truvllo.app/expenses`,
    );
    return;
  }

  // Clean up pending
  await supabase.from("whatsapp_pending").delete().eq("user_id", userId);

  const total = rows.reduce((s: number, r: any) => s + r.amount, 0);

  await sendWhatsApp(
    from,
    `✅ *${rows.length} expenses imported!*\n\n` +
      `Total: ${formatNaira(total)}\n\n` +
      `Your dashboard is updated. Reply *BALANCE* to see your new budget summary.`,
  );
}

async function handleAIChat(
  supabase: any,
  userId: string,
  from: string,
  name: string,
  message: string,
) {
  // Get budget context
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];
  const [budgetRes, expensesRes] = await Promise.all([
    supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single(),
    supabase
      .from("expenses")
      .select("amount,category")
      .eq("user_id", userId)
      .gte("date", monthStart),
  ]);

  const budget = budgetRes.data;
  const expenses = expensesRes.data ?? [];
  const totalSpent = expenses.reduce(
    (s: number, e: any) => s + Number(e.amount || 0),
    0,
  );
  const totalBudget = Number(budget?.total_amount || budget?.amount || 0);

  const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_KEY) {
    await sendWhatsApp(
      from,
      `Sorry, AI chat is temporarily unavailable. Use BALANCE or TODAY for your budget info.`,
    );
    return;
  }

  const context = budget
    ? `User budget: ${formatNaira(totalBudget)}, spent: ${formatNaira(totalSpent)}, remaining: ${formatNaira(Math.max(0, totalBudget - totalSpent))}`
    : "No active budget";

  const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system: `You are a friendly budget assistant for ${name} on Truvllo, a Nigerian budgeting app. 
Keep responses SHORT (under 150 words), conversational, and helpful. 
Use ₦ for amounts. Context: ${context}
Never use markdown headers. Use emojis sparingly.`,
      messages: [{ role: "user", content: message }],
    }),
  });

  const aiData = await aiRes.json();
  const reply =
    aiData.content?.[0]?.text ||
    "Sorry, I couldn't process that. Try BALANCE or TODAY.";

  await sendWhatsApp(from, reply);
}

// ── Expense detection ─────────────────────────────────────────────────────────
function isExpenseMessage(msg: string): boolean {
  const patterns = [
    /spent\s+[\d,]+/i,
    /paid\s+[\d,]+/i,
    /bought\s+.+\s+for\s+[\d,]+/i,
    /[\d,]+\s+for\s+\w+/i,
    /[\d,]+\s+on\s+\w+/i,
    /used\s+[\d,]+/i,
  ];
  return patterns.some((p) => p.test(msg));
}

async function handleLogExpense(
  supabase: any,
  userId: string,
  from: string,
  name: string,
  message: string,
) {
  // Get user context
  const [profileRes, budgetRes] = await Promise.all([
    supabase.from("profiles").select("currency").eq("id", userId).single(),
    supabase
      .from("budgets")
      .select("id, total_amount, amount")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single(),
  ]);

  const currency = profileRes.data?.currency || "NGN";
  const budget = budgetRes.data;

  // Use Claude to parse the expense
  const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_KEY) {
    await sendWhatsApp(
      from,
      "❌ AI parsing unavailable. Log at truvllo.app/expenses",
    );
    return;
  }

  const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      system: `Extract expense from message. Reply ONLY with JSON: {"amount": number, "description": "string", "category": "food|transport|bills|shopping|health|airtime|entertainment|other"}. No markdown, no explanation.`,
      messages: [{ role: "user", content: message }],
    }),
  });

  const aiData = await aiRes.json();
  const rawText = aiData.content?.[0]?.text?.trim() || "";

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    await sendWhatsApp(
      from,
      `❌ Couldn't parse that. Try: "spent 4500 on lunch"`,
    );
    return;
  }

  if (!parsed.amount || parsed.amount < 1) {
    await sendWhatsApp(
      from,
      `❌ Couldn't find an amount. Try: "spent 4500 on lunch"`,
    );
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  // Save expense
  const { error } = await supabase.from("expenses").insert({
    user_id: userId,
    budget_id: budget?.id || null,
    description: parsed.description,
    amount: parsed.amount,
    category: parsed.category || "other",
    date: today,
    notes: "Logged via WhatsApp",
  });

  if (error) {
    await sendWhatsApp(from, `❌ Failed to save expense. Try again.`);
    return;
  }

  // Get updated remaining
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];
  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount")
    .eq("user_id", userId)
    .gte("date", monthStart);

  const totalSpent = (expenses || []).reduce(
    (s: number, e: any) => s + Number(e.amount),
    0,
  );
  const totalBudget = Number(budget?.total_amount || budget?.amount || 0);
  const remaining = Math.max(0, totalBudget - totalSpent);

  await sendWhatsApp(
    from,
    `✅ *${formatNaira(parsed.amount)}* logged under *${parsed.category}*

` +
      `📝 ${parsed.description}
` +
      (totalBudget > 0
        ? `💰 Budget remaining: ${formatNaira(remaining)}`
        : `
Reply *BALANCE* for budget summary`),
  );
}

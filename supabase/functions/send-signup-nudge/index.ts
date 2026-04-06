/**
 * send-signup-nudge/index.ts
 * Called from Auth.jsx 2 hours after signup via scheduled DB trigger or cron
 * Sends WhatsApp message to new users: "what did you spend today?"
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const TWILIO_FROM =
    Deno.env.get("TWILIO_WHATSAPP_FROM") ?? "whatsapp:+14155238886";

  // Find users who signed up 2-3 hours ago with WhatsApp connected but 0 expenses
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "id, first_name, full_name, whatsapp_number, whatsapp_active, created_at",
    )
    .gte("created_at", threeHoursAgo)
    .lte("created_at", twoHoursAgo)
    .eq("whatsapp_active", true);

  if (!profiles?.length)
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });

  let sent = 0;

  for (const profile of profiles) {
    // Check if they have any expenses
    const { count } = await supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id);

    if ((count ?? 0) > 0) continue; // Already logging — skip

    const name =
      profile.first_name || profile.full_name?.split(" ")[0] || "there";
    const to = profile.whatsapp_number.startsWith("whatsapp:")
      ? profile.whatsapp_number
      : `whatsapp:+${profile.whatsapp_number.replace(/^\+/, "")}`;

    const msg =
      `👋 Hey ${name}! It's Truvllo.\n\n` +
      `What have you spent money on today?\n\n` +
      `Just reply with the amount and what it was:\n` +
      `*"3500 for lunch"* or *"paid 1200 for transport"*\n\n` +
      `I'll log it instantly 🚀`;

    const r = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_FROM,
          To: to,
          Body: msg,
        }).toString(),
      },
    );
    if (r.ok) sent++;
  }

  return new Response(JSON.stringify({ sent }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

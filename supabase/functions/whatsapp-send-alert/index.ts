// supabase/functions/whatsapp-send-alert/index.ts
// Called by BudgetProvider when a cap/pace threshold is crossed
// Also triggered by the notifications system

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWhatsApp, formatNaira } from "../_shared/twilio.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { user_id, type, title, body } = await req.json();

    if (!user_id || !type) {
      return new Response(
        JSON.stringify({ error: "Missing user_id or type" }),
        { status: 400, headers: CORS },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Get user's WhatsApp number
    const { data: profile } = await supabase
      .from("profiles")
      .select("whatsapp_number, whatsapp_active, first_name, full_name, plan")
      .eq("id", user_id)
      .single();

    if (!profile?.whatsapp_number || !profile?.whatsapp_active)
      return new Response("no whatsapp", { status: 200, headers: CORS });
    if (profile.plan === "free")
      return new Response("free plan", { headers: CORS });

    const name =
      profile.first_name || profile.full_name?.split(" ")[0] || "there";
    const phone = profile.whatsapp_number;

    // Format message based on type
    let message = "";
    switch (type) {
      case "pace_alert":
        message = `⚠️ *Budget alert, ${name}!*\n\n${body}\n\nReply *BALANCE* to see your full summary.`;
        break;
      case "cap_alert":
        message = `🎯 *Category cap alert!*\n\n${body}\n\nReply *BALANCE* to check your budget.`;
        break;
      case "trial":
        message = `⏰ *${title}*\n\n${body}\n\nUpgrade now to keep all features:\n👉 truvllo.app/upgrade`;
        break;
      case "milestone":
        message = `🎉 *${title}*\n\n${body}`;
        break;
      default:
        message = `🔔 *${title}*\n\n${body}`;
    }

    await sendWhatsApp(phone, message);
    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[whatsapp-send-alert]", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: CORS,
    });
  }
});

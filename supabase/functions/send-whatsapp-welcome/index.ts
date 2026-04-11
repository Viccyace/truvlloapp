// supabase/functions/send-whatsapp-welcome/index.ts
// Fires immediately after onboarding when user saves WhatsApp number
// Uses approved WhatsApp template for first outbound message

import { sendWhatsAppTemplate, sendWhatsApp } from "../_shared/twilio.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { whatsapp_number, first_name } = await req.json();

    if (!whatsapp_number) {
      return new Response(
        JSON.stringify({ error: "whatsapp_number required" }),
        {
          status: 400,
          headers: { ...CORS, "Content-Type": "application/json" },
        },
      );
    }

    const name = first_name || "there";
    const templateSid = Deno.env.get("TWILIO_WELCOME_TEMPLATE_SID");

    if (templateSid) {
      // Use approved template (required for first outbound message)
      await sendWhatsAppTemplate(whatsapp_number, templateSid, [name]);
    } else {
      // Fallback: freeform (only works if user messaged you in last 24h)
      await sendWhatsApp(
        whatsapp_number,
        `👋 Hey ${name}, welcome to Truvllo!\n\n` +
          `Your WhatsApp is connected. Log an expense to unlock your 14-day AI trial:\n\n` +
          `💬 Type: "spent 3500 on lunch"\n` +
          `📊 Type: BALANCE — budget summary\n` +
          `💰 Type: TODAY — today's spending\n\n` +
          `No card needed. Reply with any question 🚀`,
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[send-whatsapp-welcome]", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

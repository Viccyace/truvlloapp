// supabase/functions/send-whatsapp-welcome/index.ts
// Fires immediately after onboarding when user saves WhatsApp number
// Sends an instant welcome message regardless of trial status

import { sendWhatsApp } from "../_shared/twilio.ts";

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

    await sendWhatsApp(
      whatsapp_number,
      `👋 *Hey ${name}, welcome to Truvllo!*\n\n` +
        `Your WhatsApp is now connected. Here's what you can do:\n\n` +
        `💬 *Log an expense* — just type:\n` +
        `_"spent 3500 on lunch"_ or _"4500 transport"_\n\n` +
        `📊 *Check your balance* — type *BALANCE*\n` +
        `💰 *Today's spending* — type *TODAY*\n` +
        `📄 *Import bank statement* — send a PDF\n\n` +
        `Log your first expense to unlock your *14-day AI trial* automatically — no card needed.\n\n` +
        `_Reply with any question or just start logging_ 🚀`,
    );

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

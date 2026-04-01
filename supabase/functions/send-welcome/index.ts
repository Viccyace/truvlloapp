// supabase/functions/send-welcome/index.ts
// Called by a Supabase DB webhook on INSERT to the profiles table.
// Payload format: { type: "INSERT", record: { id, email, first_name, ... } }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { isAllowedOrigin, resolveCorsHeaders } from "../_shared/cors.ts";
import { sendEmail, emailBase, btn, divider } from "../_shared/resend.ts";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = resolveCorsHeaders(origin);

  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Support both DB webhook payload and direct call
    const record = body.record ?? body;
    const email = record.email;
    const name = record.first_name || email?.split("@")[0] || "there";

    if (!email) {
      return new Response(JSON.stringify({ error: "No email in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email in payload" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await sendEmail({
      to: email,
      subject: `Welcome to Truvllo, ${name} 🎉`,
      html: emailBase(`
        <h2 style="font-size:1.4rem;font-weight:700;margin:0 0 16px;">Welcome aboard, ${name}! 🎉</h2>
        <p style="font-size:0.95rem;color:#3A3A3A;line-height:1.7;margin:0 0 20px;">
          You've just joined thousands of people using Truvllo to take control of their money. We're glad you're here.
        </p>

        <div style="background:#D8F3DC;border-radius:14px;padding:24px;margin-bottom:24px;">
          <p style="font-size:0.9rem;font-weight:700;color:#1B4332;margin:0 0 14px;">Get started in 3 steps:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;vertical-align:top;">
                <span style="display:inline-block;width:24px;height:24px;background:#1B4332;border-radius:50%;text-align:center;line-height:24px;font-size:0.75rem;font-weight:700;color:#FFFFFF;margin-right:12px;">1</span>
                <span style="font-size:0.9rem;color:#2D6A4F;font-weight:600;">Set your first budget</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;vertical-align:top;">
                <span style="display:inline-block;width:24px;height:24px;background:#1B4332;border-radius:50%;text-align:center;line-height:24px;font-size:0.75rem;font-weight:700;color:#FFFFFF;margin-right:12px;">2</span>
                <span style="font-size:0.9rem;color:#2D6A4F;font-weight:600;">Log your first expense — this activates your free trial</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;vertical-align:top;">
                <span style="display:inline-block;width:24px;height:24px;background:#1B4332;border-radius:50%;text-align:center;line-height:24px;font-size:0.75rem;font-weight:700;color:#FFFFFF;margin-right:12px;">3</span>
                <span style="font-size:0.9rem;color:#2D6A4F;font-weight:600;">Check your Safe-to-Spend number every morning</span>
              </td>
            </tr>
          </table>
        </div>

        <div style="background:#FAF8F3;border-radius:12px;padding:16px 20px;margin-bottom:24px;border-left:3px solid #D4A017;">
          <p style="font-size:0.85rem;color:#3A3A3A;margin:0;line-height:1.6;">
            <strong style="color:#0A0A0A;">💡 Pro tip:</strong> Log your very first expense and you'll automatically unlock a <strong>7-day Premium trial</strong> — all AI features, no credit card required.
          </p>
        </div>

        ${btn("Go to my dashboard →", "https://truvlloapp.vercel.app/dashboard")}
        ${divider()}
        <p style="font-size:0.85rem;color:#6B6B6B;line-height:1.6;margin:0;">
          Questions? Just reply to this email — we read and respond to everything.<br/>
          <strong style="color:#3A3A3A;">The Truvllo Team</strong>
        </p>
      `),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-welcome error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

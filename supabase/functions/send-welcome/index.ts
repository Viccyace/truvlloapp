// supabase/functions/send-trial-activated/index.ts
// Triggered by a Supabase DB webhook on the profiles table
// when plan changes from 'free' to 'trial'

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail, emailBase, btn, divider } from "../_shared/resend.ts";

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    // Called by Supabase DB webhook — payload contains the updated profile row
    const payload = await req.json();
    const record = payload.record ?? payload; // handle both webhook and direct call
    const { email, first_name, trial_ends_at } = record;

    if (!email)
      return new Response(JSON.stringify({ error: "No email in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const name = first_name || email.split("@")[0];
    const trialEnd = trial_ends_at
      ? new Date(trial_ends_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "in 7 days";

    await sendEmail({
      to: email,
      subject: "Your 7-day Premium trial is now active ✨",
      html: emailBase(`
        <h2 style="font-size:1.4rem;font-weight:700;margin:0 0 16px;">Your Premium trial just activated, ${name}! ✨</h2>
        <p style="font-size:0.95rem;color:#3A3A3A;line-height:1.7;margin:0 0 20px;">
          You logged your first expense and unlocked all of Truvllo's AI features — automatically, no credit card needed.
        </p>

        <div style="background:#1B4332;border-radius:14px;padding:24px;margin-bottom:24px;">
          <p style="font-size:0.82rem;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">What's now unlocked</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${[
              [
                "🔍",
                "AI Spending Analyst",
                "Weekly breakdown of your spending patterns",
              ],
              [
                "💬",
                "Natural Language Entry",
                'Type "spent 45 on lunch" — Truvllo logs it',
              ],
              [
                "🎯",
                "AI Savings Coach",
                "One actionable tip per week to save more",
              ],
              [
                "🏷️",
                "Smart Categorisation",
                "Auto-suggests the right category for every expense",
              ],
              [
                "📁",
                "Category Caps",
                "Set limits per category, get warned before you overshoot",
              ],
              [
                "📊",
                "Advanced Charts",
                "Trend lines, breakdowns, and month-over-month comparisons",
              ],
            ]
              .map(
                ([icon, title, desc]) => `
              <tr>
                <td style="padding:7px 0;vertical-align:top;width:28px;font-size:1rem;">${icon}</td>
                <td style="padding:7px 0;vertical-align:top;">
                  <span style="font-size:0.88rem;font-weight:700;color:#FFFFFF;">${title}</span>
                  <span style="font-size:0.8rem;color:rgba(255,255,255,0.5);display:block;">${desc}</span>
                </td>
              </tr>
            `,
              )
              .join("")}
          </table>
        </div>

        <div style="background:#FFF8E7;border-radius:12px;padding:16px 20px;margin-bottom:24px;border-left:3px solid #D4A017;">
          <p style="font-size:0.88rem;color:#3A3A3A;margin:0;line-height:1.6;">
            <strong>⏰ Trial ends ${trialEnd}.</strong> After that, you can upgrade to keep all AI features for just ₦6,500/month — or continue on the free plan with core features.
          </p>
        </div>

        ${btn("Explore Premium features →", "https://truvlloapp.vercel.app/dashboard")}
        ${divider()}
        <p style="font-size:0.82rem;color:#6B6B6B;margin:0;">The Truvllo Team · Reply to this email with any questions.</p>
      `),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

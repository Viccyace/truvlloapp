// supabase/functions/send-careers-waitlist/index.ts
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
    const { email } = await req.json();
    if (!email)
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (!isValidEmail(email) || email.length > 254) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Notify team
    await sendEmail({
      to: "hello@truvlloapp.vercel.app",
      subject: `New careers waitlist signup: ${email}`,
      html: emailBase(`
        <h2 style="font-size:1.2rem;font-weight:700;margin:0 0 12px;">New careers waitlist signup</h2>
        <p style="font-size:0.95rem;color:#3A3A3A;margin:0;"><strong>${email}</strong> wants to know when you're hiring.</p>
      `),
    });

    // 2. Confirmation to signup
    await sendEmail({
      to: email,
      subject: "You're on the Truvllo careers list 🚀",
      html: emailBase(`
        <h2 style="font-size:1.3rem;font-weight:700;margin:0 0 12px;">You're on the list!</h2>
        <p style="font-size:0.95rem;color:#3A3A3A;line-height:1.7;margin:0 0 20px;">
          Thanks for your interest in joining Truvllo. We're building something we're genuinely proud of — and we'll be looking for people who share that energy.
        </p>
        <div style="background:#D8F3DC;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
          <p style="font-size:0.9rem;color:#1B4332;font-weight:600;margin:0 0 6px;">What to expect</p>
          <p style="font-size:0.85rem;color:#2D6A4F;line-height:1.6;margin:0;">
            When we open roles in engineering, design, or growth — you'll be the first to know. We'll send one email with the details and a direct link to apply.
          </p>
        </div>
        <p style="font-size:0.9rem;color:#3A3A3A;line-height:1.7;margin:0 0 20px;">
          In the meantime, try the product — it'll give you a great feel for what we're building and the problems we're solving.
        </p>
        ${btn("Try Truvllo free", "https://truvlloapp.vercel.app")}
        ${divider()}
        <p style="font-size:0.82rem;color:#6B6B6B;margin:0;">The Truvllo Team</p>
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

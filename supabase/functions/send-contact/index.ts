// supabase/functions/send-contact/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { isAllowedOrigin, resolveCorsHeaders } from "../_shared/cors.ts";
import { sendEmail, emailBase, divider } from "../_shared/resend.ts";

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
    const { name, email, topic, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      name.length > 120 ||
      (topic?.length ?? 0) > 140 ||
      message.length > 4000
    ) {
      return new Response(JSON.stringify({ error: "Input too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Notify your team
    await sendEmail({
      to: "hello@truvlloapp.vercel.app",
      subject: `New contact form: ${topic || "General"} from ${name}`,
      replyTo: email,
      html: emailBase(`
        <h2 style="font-size:1.3rem;font-weight:700;margin:0 0 20px;">New message from ${name}</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3EE;border-radius:12px;padding:20px;margin-bottom:20px;">
          <tr><td style="padding:6px 0;font-size:0.85rem;color:#6B6B6B;width:100px;">From</td><td style="font-size:0.9rem;font-weight:600;">${name}</td></tr>
          <tr><td style="padding:6px 0;font-size:0.85rem;color:#6B6B6B;">Email</td><td style="font-size:0.9rem;"><a href="mailto:${email}" style="color:#40916C;">${email}</a></td></tr>
          <tr><td style="padding:6px 0;font-size:0.85rem;color:#6B6B6B;">Topic</td><td style="font-size:0.9rem;font-weight:600;">${topic || "Not specified"}</td></tr>
        </table>
        ${divider()}
        <p style="font-size:0.85rem;color:#6B6B6B;margin:0 0 8px;">Message:</p>
        <p style="font-size:0.95rem;color:#3A3A3A;line-height:1.7;white-space:pre-wrap;">${message}</p>
        ${divider()}
        <p style="font-size:0.82rem;color:#6B6B6B;margin:0;">Reply directly to this email to respond to ${name}.</p>
      `),
    });

    // 2. Confirmation to the sender
    await sendEmail({
      to: email,
      subject: "We got your message — Truvllo",
      html: emailBase(`
        <h2 style="font-size:1.3rem;font-weight:700;margin:0 0 12px;">Thanks for reaching out, ${name} 👋</h2>
        <p style="font-size:0.95rem;color:#3A3A3A;line-height:1.7;margin:0 0 16px;">
          We've received your message and will get back to you within <strong>24–48 hours</strong> on business days.
        </p>
        <div style="background:#F5F3EE;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
          <p style="font-size:0.82rem;color:#6B6B6B;margin:0 0 6px;">Your message:</p>
          <p style="font-size:0.88rem;color:#3A3A3A;line-height:1.6;margin:0;font-style:italic;">"${message.slice(0, 200)}${message.length > 200 ? "..." : ""}"</p>
        </div>
        <p style="font-size:0.9rem;color:#3A3A3A;line-height:1.7;margin:0;">
          While you wait, feel free to explore Truvllo and start tracking your spending.
        </p>
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

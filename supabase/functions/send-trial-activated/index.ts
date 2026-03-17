// supabase/functions/send-trial-expiry/index.ts
// Called by a pg_cron job that runs daily and finds trials expiring tomorrow

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail, emailBase, btn, divider } from "../_shared/resend.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    // This function is called by pg_cron — verify the service role key
    const authHeader = req.headers.get("Authorization");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find all trials expiring in the next 24 hours (day 6 = 1 day before end)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const { data: expiringUsers, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, trial_ends_at")
      .eq("plan", "trial")
      .gte("trial_ends_at", tomorrowStart.toISOString())
      .lte("trial_ends_at", tomorrowEnd.toISOString());

    if (error) throw error;
    if (!expiringUsers?.length) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No trials expiring tomorrow" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Send reminder to each expiring user
    const results = await Promise.allSettled(
      expiringUsers.map(async (user) => {
        const name = user.first_name || user.email.split("@")[0];
        await sendEmail({
          to: user.email,
          subject: "Your Truvllo Premium trial ends tomorrow ⏰",
          html: emailBase(`
            <h2 style="font-size:1.3rem;font-weight:700;margin:0 0 16px;">Your trial ends tomorrow, ${name}</h2>
            <p style="font-size:0.95rem;color:#3A3A3A;line-height:1.7;margin:0 0 20px;">
              Your 7-day Premium trial is expiring. After tomorrow, you'll move to the free plan unless you upgrade.
            </p>

            <div style="background:#FAF8F3;border-radius:14px;padding:20px 24px;margin-bottom:20px;border:1.5px solid rgba(10,10,10,0.08);">
              <p style="font-size:0.88rem;font-weight:700;color:#0A0A0A;margin:0 0 12px;">You'll lose access to:</p>
              ${[
                "All 6 AI features",
                "Category spending caps",
                "Advanced charts & trends",
                "CSV export",
                "Habit streak tracking",
              ]
                .map(
                  (f) => `
                <p style="font-size:0.875rem;color:#6B6B6B;margin:0 0 6px;">✕ &nbsp;${f}</p>
              `,
                )
                .join("")}
            </div>

            <div style="background:#D8F3DC;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
              <p style="font-size:1.1rem;font-weight:900;color:#1B4332;margin:0 0 4px;">₦6,500 <span style="font-size:0.85rem;font-weight:500;color:#2D6A4F;">/month</span></p>
              <p style="font-size:0.82rem;color:#2D6A4F;margin:0;">or ₦4,875/month billed annually (save 25%)</p>
              <p style="font-size:0.8rem;color:#40916C;margin:8px 0 0;">Cancel any time. No hidden fees.</p>
            </div>

            ${btn("Upgrade now — keep all AI features", "https://truvlloapp.vercel.app/upgrade")}

            <div style="background:#FFF8E7;border-radius:10px;padding:14px 18px;margin-bottom:8px;border-left:3px solid #D4A017;">
              <p style="font-size:0.85rem;color:#3A3A3A;margin:0;line-height:1.6;">
                If you don't upgrade, you'll keep all your expense history and budget data. You'll just lose access to AI features.
              </p>
            </div>
            ${divider()}
            <p style="font-size:0.82rem;color:#6B6B6B;margin:0;">The Truvllo Team · Questions? Reply to this email.</p>
          `),
        });
      }),
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(JSON.stringify({ sent, failed }), {
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

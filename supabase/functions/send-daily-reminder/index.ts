// supabase/functions/send-daily-reminder/index.ts
// Runs every minute via pg_cron.
// Finds all users whose reminder_time matches now (in their timezone)
// and sends them a push notification + in-app notification.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    // Verify caller is the cron job
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${serviceKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date();
    const currentHour = now.getUTCHours().toString().padStart(2, "0");
    const currentMinute = now.getUTCMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}:00`;

    // Find subscriptions where reminder_time matches current UTC time
    // (simplified — in production you'd convert per timezone)
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*, profiles:user_id(email, first_name)")
      .eq("active", true)
      .eq("reminder_time", currentTime);

    if (error) throw error;
    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;

    for (const sub of subscriptions) {
      const name = sub.profiles?.first_name || "there";

      // Create in-app notification
      await supabase.from("notifications").insert({
        user_id: sub.user_id,
        type: "daily_reminder",
        title: "Log today's spending",
        body: `Hey ${name}, don't forget to log your expenses for today. It only takes a minute.`,
        action_url: "/expenses",
      });

      // Send push notification if they have a valid subscription
      if (sub.endpoint && sub.p256dh && sub.auth_key) {
        try {
          await sendPushNotification({
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth_key,
            title: "Time to log your spending 💰",
            body: `Hey ${name}! Add today's expenses to keep your budget on track.`,
            url: "/expenses",
          });
          sent++;
        } catch (pushErr) {
          console.error("Push failed for", sub.user_id, pushErr.message);
          // If push subscription is invalid, deactivate it
          if (
            pushErr.message?.includes("410") ||
            pushErr.message?.includes("404")
          ) {
            await supabase
              .from("push_subscriptions")
              .update({ active: false })
              .eq("id", sub.id);
          }
        }
      }
    }

    return new Response(JSON.stringify({ sent, total: subscriptions.length }), {
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

// ── Web Push helper ───────────────────────────────────────────────────────────
async function sendPushNotification({
  endpoint,
  p256dh,
  auth,
  title,
  body,
  url,
}: {
  endpoint: string;
  p256dh: string;
  auth: string;
  title: string;
  body: string;
  url: string;
}) {
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error("VAPID keys not configured");
  }

  const payload = JSON.stringify({
    title,
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/pwa-64x64.png",
    url,
    data: { url },
  });

  // Use the web-push library via esm.sh
  const webpush = await import("https://esm.sh/web-push@3.6.7");

  webpush.setVapidDetails(
    "mailto:hello@truvllo.app",
    vapidPublicKey,
    vapidPrivateKey,
  );

  await webpush.sendNotification({ endpoint, keys: { p256dh, auth } }, payload);
}

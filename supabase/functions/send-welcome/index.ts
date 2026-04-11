// supabase/functions/send-welcome/index.ts
// Sends branded welcome email via Resend after signup

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendEmail } from "../_shared/resend.ts";

const WELCOME_HTML = (firstName: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Welcome to Truvllo</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:48px 16px 64px;">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

    <tr>
      <td style="padding:0 0 40px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:900;color:#FAF8F3;letter-spacing:-0.03em;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#D4A017;margin-right:7px;vertical-align:middle;"></span>Truvllo</span></td>
          <td align="right"><span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:600;color:rgba(250,248,243,0.3);letter-spacing:0.1em;text-transform:uppercase;">Welcome aboard</span></td>
        </tr></table>
      </td>
    </tr>

    <tr><td>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F3;border-radius:28px;overflow:hidden;">

      <!-- DARK HERO -->
      <tr><td style="background:linear-gradient(145deg,#0D2B1C 0%,#1B4332 55%,#152E22 100%);padding:0;overflow:hidden;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:44px 44px 0;">
            <div style="width:40px;height:2px;background:#D4A017;margin-bottom:28px;"></div>
            <p style="margin:0 0 16px;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;color:rgba(250,248,243,0.4);letter-spacing:0.14em;text-transform:uppercase;">Your account is ready</p>
            <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:46px;font-weight:900;color:#FAF8F3;line-height:1.0;letter-spacing:-0.035em;">
              Welcome,<br/><em style="font-style:italic;color:#52B788;">${firstName}.</em>
            </h1>
            <p style="margin:0 0 40px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:rgba(250,248,243,0.5);line-height:1.75;max-width:380px;">
              You've just taken the first step toward knowing exactly where your money goes. We're glad you're here.
            </p>
          </td></tr>
          <tr><td style="padding:0 44px 44px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:#D4A017;border-radius:10px;">
                <a href="https://www.truvllo.app/dashboard" style="display:inline-block;padding:16px 36px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:800;color:#0A0A0A;text-decoration:none;letter-spacing:0.02em;white-space:nowrap;">Open my dashboard &nbsp;→</a>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:0;line-height:0;overflow:hidden;" align="right">
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:160px;font-weight:900;color:rgba(64,145,108,0.08);line-height:0.85;display:block;margin-right:-8px;letter-spacing:-0.05em;">✦</span>
          </td></tr>
        </table>
      </td></tr>

      <!-- FEATURES -->
      <tr><td style="padding:36px 44px 28px;border-bottom:1px solid rgba(10,10,10,0.07);">
        <p style="margin:0 0 24px;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;color:#9B9B9B;letter-spacing:0.12em;text-transform:uppercase;">Everything included</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="33%" valign="top" style="padding-right:12px;">
            <div style="width:36px;height:36px;background:#D8F3DC;border-radius:10px;text-align:center;line-height:36px;font-size:16px;margin-bottom:10px;">🤖</div>
            <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:700;color:#0A0A0A;line-height:1.3;">AI Spending Analyst</p>
            <p style="margin:0;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;color:#6B6B6B;line-height:1.6;">Plain English breakdown of where your money goes.</p>
          </td>
          <td width="33%" valign="top" style="padding:0 6px;">
            <div style="width:36px;height:36px;background:#D8F3DC;border-radius:10px;text-align:center;line-height:36px;font-size:16px;margin-bottom:10px;">💬</div>
            <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:700;color:#0A0A0A;line-height:1.3;">WhatsApp Agent</p>
            <p style="margin:0;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;color:#6B6B6B;line-height:1.6;">Log expenses and check your balance from chat.</p>
          </td>
          <td width="33%" valign="top" style="padding-left:12px;">
            <div style="width:36px;height:36px;background:#D8F3DC;border-radius:10px;text-align:center;line-height:36px;font-size:16px;margin-bottom:10px;">🏦</div>
            <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:700;color:#0A0A0A;line-height:1.3;">Bank Import</p>
            <p style="margin:0;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;color:#6B6B6B;line-height:1.6;">Send a PDF and we extract every transaction.</p>
          </td>
        </tr></table>
      </td></tr>

      <!-- FIRST ACTION CALLOUT -->
      <tr><td style="padding:28px 44px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;border-radius:16px;overflow:hidden;"><tr>
          <td style="padding:24px 26px;">
            <p style="margin:0 0 4px;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;color:rgba(250,248,243,0.35);letter-spacing:0.1em;text-transform:uppercase;">Your first action</p>
            <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#FAF8F3;line-height:1.3;">Log one expense to activate<br/><em style="font-style:italic;color:#52B788;">your 14-day AI access.</em></p>
            <p style="margin:0 0 20px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;color:rgba(250,248,243,0.4);line-height:1.65;">
              Type something like <span style="color:#52B788;font-weight:600;">"lunch 3500"</span> or <span style="color:#52B788;font-weight:600;">"transport 1200"</span> — no forms, just natural language.
            </p>
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:#1B4332;border-radius:8px;">
                <a href="https://www.truvllo.app/expenses" style="display:inline-block;padding:11px 22px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;color:#FAF8F3;text-decoration:none;">Add first expense →</a>
              </td>
            </tr></table>
          </td>
        </tr></table>
      </td></tr>

      <!-- QUICK TIPS -->
      <tr><td style="padding:20px 44px 36px;">
        <p style="margin:0 0 16px;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;color:#9B9B9B;letter-spacing:0.12em;text-transform:uppercase;">Quick tips</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr>
          <td width="20" valign="top" style="padding-top:2px;"><span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#D4A017;font-weight:700;">→</span></td>
          <td style="padding-left:10px;"><p style="margin:0;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#3A3A3A;line-height:1.65;"><strong style="color:#0A0A0A;">Set a monthly budget</strong> — Budget → Create budget. AI tracks your pace daily.</p></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr>
          <td width="20" valign="top" style="padding-top:2px;"><span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#D4A017;font-weight:700;">→</span></td>
          <td style="padding-left:10px;"><p style="margin:0;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#3A3A3A;line-height:1.65;"><strong style="color:#0A0A0A;">Connect WhatsApp</strong> — Settings → enter your number to enable the AI agent.</p></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="20" valign="top" style="padding-top:2px;"><span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#D4A017;font-weight:700;">→</span></td>
          <td style="padding-left:10px;"><p style="margin:0;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#3A3A3A;line-height:1.65;"><strong style="color:#0A0A0A;">Import bank statement</strong> — send a PDF to WhatsApp or use Bank Import in Expenses.</p></td>
        </tr></table>
      </td></tr>

      <!-- SIGNATURE -->
      <tr><td style="padding:0 44px 36px;border-top:1px solid rgba(10,10,10,0.07);">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding-top:28px;"><tr>
          <td>
            <p style="margin:0 0 4px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#3A3A3A;line-height:1.7;">We built Truvllo because most budgeting apps are either too complex or too shallow. We hope this one feels different.</p>
            <p style="margin:0 0 16px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#3A3A3A;line-height:1.7;">Any feedback — reply to this email. We read everything.</p>
            <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:700;color:#0A0A0A;">the Truvllo team</p>
            <p style="margin:0;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;color:#9B9B9B;"><a href="https://www.truvllo.app" style="color:#40916C;text-decoration:none;">truvllo.app</a></p>
          </td>
          <td align="right" valign="bottom">
            <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#1B4332,#40916C);text-align:center;line-height:48px;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:900;color:#FAF8F3;">T</div>
          </td>
        </tr></table>
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="background:#F0EDE4;border-radius:0 0 28px 28px;padding:22px 44px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:700;color:#0A0A0A;letter-spacing:-0.02em;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#D4A017;margin-right:6px;vertical-align:middle;"></span>Truvllo</span>
            <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;color:#9B9B9B;margin-left:10px;">The smart budgeting app that thinks with you.</span>
          </td>
          <td align="right">
            <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;color:#BBBBBB;">
              <a href="https://www.truvllo.app/privacy-policy" style="color:#BBBBBB;text-decoration:none;">Privacy</a> &nbsp;·&nbsp;
              <a href="https://www.truvllo.app/security" style="color:#BBBBBB;text-decoration:none;">Security</a> &nbsp;·&nbsp;
              <a href="https://www.truvllo.app" style="color:#BBBBBB;text-decoration:none;">truvllo.app</a>
            </span>
          </td>
        </tr></table>
      </td></tr>

    </table>
    </td></tr>

    <tr><td style="padding:32px 0 0;text-align:center;">
      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:64px;font-weight:900;color:rgba(250,248,243,0.03);letter-spacing:-0.04em;line-height:1;">Truvllo</p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body>
</html>
`;

serve(async (req) => {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body = await req.json();

    // Support both DB webhook and direct call
    const email = body.record?.email || body.email;
    const first_name = body.record?.first_name || body.first_name || "there";

    if (!email) {
      return new Response(JSON.stringify({ error: "email required" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    await sendEmail({
      to: email,
      subject: `Welcome to Truvllo, ${first_name} 👋`,
      html: WELCOME_HTML(first_name),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[send-welcome]", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

// supabase/functions/_shared/resend.ts
// ─────────────────────────────────────────────────────────────────────────────
// Thin wrapper around the Resend API.
// Set your API key with: supabase secrets set RESEND_API_KEY=re_...

const RESEND_API = "https://api.resend.com/emails";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY secret is not set");

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: payload.from ?? "Truvllo <hello@truvllo.app>",
      reply_to: payload.replyTo ?? "hello@truvllo.app",
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}

// ── Shared brand styles ───────────────────────────────────────────────────────
export const emailBase = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Truvllo</title>
</head>
<body style="margin:0;padding:0;background:#F5F3EE;font-family:'Helvetica Neue',Arial,sans-serif;color:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3EE;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- HEADER -->
          <tr>
            <td style="background:#1B4332;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
              <span style="font-size:1.6rem;font-weight:700;color:#FFFFFF;letter-spacing:-0.01em;">
                Truvllo<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#D4A017;margin-left:4px;margin-bottom:6px;"></span>
              </span>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#FFFFFF;padding:40px 36px;border-left:1px solid rgba(10,10,10,0.07);border-right:1px solid rgba(10,10,10,0.07);">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#F0EDE4;border-radius:0 0 16px 16px;border:1px solid rgba(10,10,10,0.07);border-top:none;padding:20px 36px;text-align:center;">
              <p style="margin:0;font-size:0.75rem;color:#6B6B6B;line-height:1.6;">
                © 2026 Truvllo · The AI budgeting app that thinks with you<br/>
                <a href="https://truvllo.app/privacy" style="color:#40916C;text-decoration:none;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="https://truvllo.app/terms" style="color:#40916C;text-decoration:none;">Terms</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const btn = (text: string, url: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td align="center">
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#1B4332,#40916C);color:#FFFFFF;text-decoration:none;padding:14px 36px;border-radius:100px;font-size:0.95rem;font-weight:700;letter-spacing:0.01em;">${text}</a>
      </td>
    </tr>
  </table>
`;

export const divider = () =>
  `<hr style="border:none;border-top:1px solid rgba(10,10,10,0.08);margin:24px 0;" />`;

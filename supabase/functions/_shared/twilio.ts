// supabase/functions/_shared/twilio.ts
// Shared Twilio WhatsApp sender

function normaliseNumber(to: string): string {
  let num = to.trim().replace(/^whatsapp:/, "");
  if (!num.startsWith("+")) {
    if (num.startsWith("0")) num = "+234" + num.slice(1);
    else if (num.startsWith("234")) num = "+" + num;
    else num = "+234" + num;
  }
  return "whatsapp:" + num.replace(/[\s\-]/g, "");
}

// Freeform message — only works within 24h customer service window
export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const from = Deno.env.get("TWILIO_WHATSAPP_FROM") ?? "whatsapp:+14155238886";

  if (!accountSid || !authToken)
    throw new Error("Twilio credentials not configured");

  const toNumber = normaliseNumber(to);
  console.log(`[Twilio] Freeform to: ${toNumber.slice(0, 15)}...`);

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: toNumber,
        Body: body,
      }).toString(),
    },
  );

  const result = await res.json();
  if (!res.ok || result.error_code) {
    console.error("[Twilio] Send failed:", result.error_code, result.message);
    throw new Error(`Twilio error ${result.error_code}: ${result.message}`);
  }
  console.log("[Twilio] Sent:", result.sid);
}

// Template message — required for first outbound message to new users
export async function sendWhatsAppTemplate(
  to: string,
  templateSid: string,
  variables: string[],
): Promise<void> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const from = Deno.env.get("TWILIO_WHATSAPP_FROM") ?? "whatsapp:+14155238886";

  if (!accountSid || !authToken)
    throw new Error("Twilio credentials not configured");

  const toNumber = normaliseNumber(to);
  console.log(
    `[Twilio] Template ${templateSid} to: ${toNumber.slice(0, 15)}...`,
  );

  // Build ContentVariables JSON: {"1":"value1","2":"value2"}
  const contentVariables = JSON.stringify(
    Object.fromEntries(variables.map((v, i) => [String(i + 1), v])),
  );

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: toNumber,
        ContentSid: templateSid,
        ContentVariables: contentVariables,
      }).toString(),
    },
  );

  const result = await res.json();
  if (!res.ok || result.error_code) {
    console.error(
      "[Twilio] Template failed:",
      result.error_code,
      result.message,
    );
    throw new Error(
      `Twilio template error ${result.error_code}: ${result.message}`,
    );
  }
  console.log("[Twilio] Template sent:", result.sid);
}

export function formatNaira(amount: number, sym = "₦"): string {
  return `${sym}${Math.round(amount).toLocaleString()}`;
}

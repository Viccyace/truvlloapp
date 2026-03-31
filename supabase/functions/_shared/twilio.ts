// supabase/functions/_shared/twilio.ts
// Shared Twilio WhatsApp sender

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const from = Deno.env.get("TWILIO_WHATSAPP_FROM") ?? "whatsapp:+14155238886";

  // Ensure number has whatsapp: prefix
  const toNumber = to.startsWith("whatsapp:")
    ? to
    : `whatsapp:+234${to.replace(/^0/, "")}`;

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

  if (!res.ok) {
    const err = await res.text();
    console.error("[Twilio] Send failed:", err);
    throw new Error(`Twilio error: ${res.status}`);
  }
}

export function formatNaira(amount: number, sym = "₦"): string {
  return `${sym}${Math.round(amount).toLocaleString()}`;
}

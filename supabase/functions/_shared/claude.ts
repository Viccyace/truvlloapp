export async function callClaude({
  system,
  user,
  maxTokens = 512,
  json = false,
}: {
  system: string;
  user: string;
  maxTokens?: number;
  json?: boolean;
}): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-sonnet-4-5",
      max_tokens: maxTokens,
      system: json
        ? system + "\n\nIMPORTANT: Respond ONLY with a valid JSON object. No preamble, no markdown fences, no commentary."
        : system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

export function parseJSON<T>(raw: string): T {
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as T;
}

export function fmtCurrency(amount: number, currency = "NGN"): string {
  const symbols: Record<string, string> = {
    NGN: "₦", USD: "$", GBP: "£", EUR: "€", KES: "KSh", GHS: "₵",
  };
  return `${symbols[currency] ?? currency}${Number(amount).toLocaleString("en-NG")}`;
}

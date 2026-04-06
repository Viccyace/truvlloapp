const DEV_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];
const PROD_ORIGINS = [
  "https://truvllo.app",
  "https://www.truvllo.app",
  "https://truvlloapp.vercel.app",
];

export const ALLOWED_ORIGINS = [
  ...PROD_ORIGINS,
  ...(Deno.env.get("DENO_DEPLOYMENT_ID") ? [] : DEV_ORIGINS),
];

export function resolveCorsHeaders(origin: string | null) {
  const allowOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : PROD_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function isAllowedOrigin(origin: string | null) {
  return !!origin && ALLOWED_ORIGINS.includes(origin);
}

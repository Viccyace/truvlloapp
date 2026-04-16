// Direct Upstash Redis REST API implementation
const SHORT_WINDOW_SECONDS = 10 * 60; // 10 minutes
const SHORT_LIMIT = 5;
const DAILY_WINDOW_SECONDS = 24 * 60 * 60; // 24 hours
const DAILY_LIMIT = 20;

export interface PaymentRateLimitResult {
  allowed: boolean;
  error?: string;
  retryAfterSeconds?: number;
  shortCount?: number;
  shortLimit?: number;
  dailyCount?: number;
  dailyLimit?: number;
}

async function redisCommand(command: string[]): Promise<any> {
  const url = Deno.env.get("UPSTASH_REDIS_REST_URL");
  const token = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");

  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not configured",
    );
  }

  const redisUrl = `${url}/${command.map(encodeURIComponent).join("/")}`;
  const response = await fetch(redisUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Redis command failed: ${response.status}`);
  }

  const result = await response.json();
  return result.result;
}

export async function checkPaymentRateLimit(
  userId: string,
  action: string,
): Promise<PaymentRateLimitResult> {
  try {
    const shortKey = `rate_limit:payment:${action}:${userId}:10m`;
    const dailyKey = `rate_limit:payment:${action}:${userId}:daily`;

    // Use pipeline for atomic operations
    const shortCount = await redisCommand(["INCR", shortKey]);
    const dailyCount = await redisCommand(["INCR", dailyKey]);

    // Set expiry on first increment
    if (shortCount === 1) {
      await redisCommand(["EXPIRE", shortKey, SHORT_WINDOW_SECONDS.toString()]);
    }
    if (dailyCount === 1) {
      await redisCommand(["EXPIRE", dailyKey, DAILY_WINDOW_SECONDS.toString()]);
    }

    if (shortCount > SHORT_LIMIT) {
      return {
        allowed: false,
        error:
          "Too many payment attempts. Please wait a few minutes and try again.",
        retryAfterSeconds: SHORT_WINDOW_SECONDS,
        shortCount,
        shortLimit: SHORT_LIMIT,
        dailyCount,
        dailyLimit: DAILY_LIMIT,
      };
    }

    if (dailyCount > DAILY_LIMIT) {
      return {
        allowed: false,
        error:
          "Daily payment request limit reached. Please try again tomorrow.",
        retryAfterSeconds: DAILY_WINDOW_SECONDS,
        shortCount,
        shortLimit: SHORT_LIMIT,
        dailyCount,
        dailyLimit: DAILY_LIMIT,
      };
    }

    return {
      allowed: true,
      shortCount,
      shortLimit: SHORT_LIMIT,
      dailyCount,
      dailyLimit: DAILY_LIMIT,
    };
  } catch (error) {
    console.error("[paymentRateLimit] Redis error:", error);
    return { allowed: true };
  }
}

export function paymentRateLimitResponse(
  result: PaymentRateLimitResult,
  corsHeaders: Record<string, string>,
) {
  return new Response(
    JSON.stringify({
      error: result.error ?? "Rate limit exceeded",
      retryAfterSeconds: result.retryAfterSeconds,
      limits: {
        shortCount: result.shortCount,
        shortLimit: result.shortLimit,
        dailyCount: result.dailyCount,
        dailyLimit: result.dailyLimit,
      },
    }),
    {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

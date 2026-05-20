import { ApiError } from "@/lib/api/http";

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();
let cleanupCounter = 0;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanupCounter++;
  if (cleanupCounter % 100 === 0) {
    cleanup();
  }

  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: options.maxRequests - 1, resetAt };
  }

  if (existing.count >= options.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - existing.count,
    resetAt: existing.resetAt
  };
}

export function throwIfRateLimited(
  key: string,
  options: RateLimitOptions,
  message = "请求过于频繁，请稍后再试"
) {
  const result = checkRateLimit(key, options);
  if (!result.allowed) {
    throw new ApiError(429, "RATE_LIMITED", message);
  }
  return result;
}

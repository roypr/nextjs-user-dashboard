/**
 * @fileoverview Rate limiting utilities using Upstash Ratelimit + Upstash Redis.
 * Exports a factory function and pre-configured limiters for login, signup,
 * forgot password, resend verification, and email verification endpoints.
 * Falls back to a simple in-memory limiter if Upstash is unavailable.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Default sliding window unit in seconds.
 */
const WINDOW_SECONDS = 60;

/**
 * Creates a rate limiter using Upstash Redis with sliding window algorithm.
 * Falls back to an in-memory Map-based limiter if Upstash env vars are missing.
 * @param maxRequests - Maximum requests allowed within the time window.
 * @param windowSeconds - Time window in seconds (default: 60).
 * @returns A Ratelimit instance.
 */
export function rateLimit(
  maxRequests: number,
  windowSeconds: number = WINDOW_SECONDS,
): Ratelimit {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    const redis = new Redis({ url, token });
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
      analytics: true,
      prefix: "ratelimit",
    });
  }

  // In-memory fallback for development (limits reset on server restart)
  return createInMemoryRatelimit(maxRequests, windowSeconds);
}

/**
 * Creates an in-memory rate limiter as a fallback when Upstash Redis is not configured.
 */
function createInMemoryRatelimit(
  maxRequests: number,
  windowSeconds: number,
): Ratelimit {
  const store = new Map<string, { count: number; resetAt: number }>();

  // Reuse the Ratelimit interface by wrapping the in-memory store
  return {
    limit: async (identifier: string) => {
      const now = Date.now();
      const key = identifier;
      const entry = store.get(key);

      if (!entry || entry.resetAt < now) {
        store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
        return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: now + windowSeconds * 1000 };
      }

      entry.count += 1;
      const remaining = Math.max(0, maxRequests - entry.count);
      const success = entry.count <= maxRequests;

      return {
        success,
        limit: maxRequests,
        remaining,
        reset: entry.resetAt,
      };
    },
    // BlockedRequests is not needed for our use case
    blockUntilReady: async (_identifier: string) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    },
  } as unknown as Ratelimit;
}

/**
 * Pre-configured rate limiter: 5 login attempts per IP per 60 seconds.
 */
export const loginLimiter = rateLimit(5, 60);

/**
 * Pre-configured rate limiter: 3 signup attempts per IP per hour.
 */
export const signupLimiter = rateLimit(3, 3600);

/**
 * Pre-configured rate limiter: 3 forgot password attempts per IP per hour.
 */
export const forgotPasswordLimiter = rateLimit(3, 3600);

/**
 * Pre-configured rate limiter: 3 resend verification attempts per IP per hour.
 */
export const resendVerificationLimiter = rateLimit(3, 3600);

/**
 * Pre-configured rate limiter: 10 email verification attempts per IP per 60 seconds.
 */
export const verifyEmailLimiter = rateLimit(10, 60);

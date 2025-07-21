import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { env } from "./env"

// Initialize Redis client if available
let redis: Redis | null = null

try {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
    console.log("✅ Redis rate limiter initialized")
  } else {
    console.warn(
      "⚠️  Redis configuration missing - rate limiting will be disabled in development"
    )
  }
} catch (error) {
  console.warn("⚠️  Failed to initialize Redis:", error)
  redis = null
}

// TODO: LOW PRIORITY - Implement memory-based fallback rate limiter
// Priority: Low - Mock limiter provides no protection if Redis unavailable
// Current mock always allows requests through
// Fix: Implement in-memory rate limiting with Map-based storage
const createMockRateLimiter = () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  limit: async (_identifier: string) => ({
    success: true,
    limit: 1000,
    remaining: 999,
    reset: Date.now() + 3600000, // 1 hour from now
  }),
})

export const generalApiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 h"),
      analytics: true,
      prefix: "@learnthai/ratelimit/general",
    })
  : createMockRateLimiter()

// Rate limiting middleware
const withRateLimit = (
  handler: (request: NextRequest) => Promise<NextResponse>,
  limiter: Ratelimit | ReturnType<typeof createMockRateLimiter>,
  getIdentifier: (request: NextRequest) => string
) => {
  return async (request: NextRequest) => {
    try {
      // Get identifier (IP address or user ID)
      const identifier = getIdentifier(request)

      const { success, limit, remaining, reset } = await limiter.limit(
        identifier
      )

      if (!success) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again later.",
            limit,
            remaining,
            resetTime: new Date(reset).toISOString(),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": new Date(reset).toISOString(),
            },
          }
        )
      }

      // Execute the handler
      const response = await handler(request)

      // Add rate limit headers to successful responses
      response.headers.set("X-RateLimit-Limit", limit.toString())
      response.headers.set("X-RateLimit-Remaining", remaining.toString())
      response.headers.set("X-RateLimit-Reset", new Date(reset).toISOString())

      return response
    } catch (error) {
      console.error("Rate limiter error:", error)
      // If rate limiter fails, allow the request to proceed
      return handler(request)
    }
  }
}

// Get client identifier for rate limiting
const getClientIdentifier = (request: NextRequest): string => {
  // Try to get IP address from headers
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return "unknown"
}

// Get user identifier for rate limiting
const getUserIdentifier = (request: NextRequest): string => {
  // TODO: CRITICAL - Fix rate limiting security gap
  // Priority: High - Need proper user identification for rate limiting
  // Current implementation uses IP as fallback which allows bypassing limits
  // Should integrate with Supabase auth to get actual user ID
  // Fix: const authResult = await authenticateRequest(request); return authResult.user?.id || getClientIdentifier(request)
  return getClientIdentifier(request)
}

// Combined rate limiting and auth middleware
export const withRateLimitAndAuth = (
  handler: (request: NextRequest) => Promise<NextResponse>,
  limiter: Ratelimit | ReturnType<typeof createMockRateLimiter>
) => {
  // TODO: CRITICAL - Implement proper auth middleware integration
  // Priority: High - Security vulnerability - users can bypass rate limits
  // Current implementation uses IP as fallback which is exploitable
  // Fix: Make getUserIdentifier async and integrate with authenticateRequest()
  return withRateLimit(handler, limiter, getUserIdentifier)
}

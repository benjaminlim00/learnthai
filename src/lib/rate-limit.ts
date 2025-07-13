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

// Create mock rate limiter for development/fallback
const createMockRateLimiter = () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  limit: async (_identifier: string) => ({
    success: true,
    limit: 1000,
    remaining: 999,
    reset: Date.now() + 3600000, // 1 hour from now
  }),
})

// Create rate limiters for different endpoints
export const vocabGenerationLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "@learnthai/ratelimit/vocab",
    })
  : createMockRateLimiter()

export const translationLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 h"),
      analytics: true,
      prefix: "@learnthai/ratelimit/translate",
    })
  : createMockRateLimiter()

export const generalApiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 h"),
      analytics: true,
      prefix: "@learnthai/ratelimit/general",
    })
  : createMockRateLimiter()

// Rate limiting middleware
export const withRateLimit = (
  handler: (request: NextRequest) => Promise<NextResponse>,
  limiter: Ratelimit | ReturnType<typeof createMockRateLimiter>,
  getIdentifier?: (request: NextRequest) => string
) => {
  return async (request: NextRequest) => {
    try {
      // Get identifier (IP address or user ID)
      const identifier = getIdentifier
        ? getIdentifier(request)
        : getClientIdentifier(request)

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
export const getUserIdentifier = (request: NextRequest): string => {
  // This should be called after authentication middleware
  // For now, use IP as fallback
  return getClientIdentifier(request)
}

// Combined rate limiting and auth middleware
export const withRateLimitAndAuth = (
  handler: (request: NextRequest) => Promise<NextResponse>,
  limiter: Ratelimit | ReturnType<typeof createMockRateLimiter>
) => {
  return withRateLimit(handler, limiter, getUserIdentifier)
}

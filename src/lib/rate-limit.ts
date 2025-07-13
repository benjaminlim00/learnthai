import { NextRequest, NextResponse } from "next/server"

// In-memory rate limiter fallback (for development)
const inMemoryRateLimiter = new Map<
  string,
  { count: number; resetTime: number }
>()

// Create rate limiter with in-memory fallback
const createRateLimiter = (requests: number, window: string) => {
  // For production, you can configure Upstash Redis here
  // For now, use in-memory rate limiter
  return {
    limit: async (identifier: string) => {
      const now = Date.now()
      const windowMs =
        window === "1m" ? 60000 : window === "1h" ? 3600000 : 60000

      const record = inMemoryRateLimiter.get(identifier)

      if (!record || now > record.resetTime) {
        // Reset or create new record
        inMemoryRateLimiter.set(identifier, {
          count: 1,
          resetTime: now + windowMs,
        })
        return {
          success: true,
          limit: requests,
          remaining: requests - 1,
          reset: now + windowMs,
        }
      }

      if (record.count >= requests) {
        return {
          success: false,
          limit: requests,
          remaining: 0,
          reset: record.resetTime,
        }
      }

      record.count++
      return {
        success: true,
        limit: requests,
        remaining: requests - record.count,
        reset: record.resetTime,
      }
    },
  }
}

// Rate limiters for different endpoints
export const vocabGenerationLimiter = createRateLimiter(10, "1h") // 10 requests per hour
export const translationLimiter = createRateLimiter(30, "1h") // 30 requests per hour
export const generalApiLimiter = createRateLimiter(100, "1h") // 100 requests per hour

// Rate limiting middleware
export const withRateLimit = (
  handler: (request: NextRequest) => Promise<NextResponse>,
  limiter: ReturnType<typeof createRateLimiter>,
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

      // Add rate limit headers to successful responses
      const response = await handler(request)

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
  limiter: ReturnType<typeof createRateLimiter>
) => {
  return withRateLimit(handler, limiter, getUserIdentifier)
}

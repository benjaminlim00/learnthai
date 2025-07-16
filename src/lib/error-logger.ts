import { NextResponse } from "next/server"

interface ErrorContext {
  userId?: string
  endpoint: string
  method: string
  userAgent?: string
  ip?: string
  timestamp: string
  requestId?: string
}

interface LoggedError {
  message: string
  stack?: string
  code?: string
  context: ErrorContext
}

export class ApiError extends Error {
  public statusCode: number
  public code?: string
  public context?: Record<string, unknown>

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    context?: Record<string, unknown>
  ) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.code = code
    this.context = context
  }
}

export function logError(
  error: Error | ApiError,
  context: Partial<ErrorContext>
): void {
  const loggedError: LoggedError = {
    message: error.message,
    stack: error.stack,
    code: error instanceof ApiError ? error.code : undefined,
    context: {
      endpoint: context.endpoint || "unknown",
      method: context.method || "unknown",
      timestamp: new Date().toISOString(),
      ...context,
    },
  }

  // In production, this would send to a logging service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === "production") {
    console.error("API Error:", JSON.stringify(loggedError, null, 2))
    // TODO: Send to external logging service
    // Priority: High - Need to implement proper error tracking for production
    // Suggested: Integrate with Sentry or similar service
    // Example: await sendToLoggingService(loggedError)
  } else {
    console.error("API Error:", {
      message: error.message,
      stack: error.stack,
      context: loggedError.context,
    })
  }
}

export function createErrorContext(
  request: Request,
  userId?: string,
  additional?: Record<string, unknown>
): Partial<ErrorContext> {
  const url = new URL(request.url)

  return {
    userId,
    endpoint: url.pathname,
    method: request.method,
    userAgent: request.headers.get("user-agent") || undefined,
    ip:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      undefined,
    timestamp: new Date().toISOString(),
    ...additional,
  }
}

// Helper function to create consistent error responses
export function createErrorResponse(
  error: Error | ApiError,
  context?: Partial<ErrorContext>
) {
  // Log the error for debugging
  if (context) {
    logError(error, context)
  }

  // Return appropriate error response
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    )
  }

  // For unknown errors, don't expose internal details
  return NextResponse.json(
    {
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  )
}

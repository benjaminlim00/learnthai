import { NextRequest, NextResponse } from "next/server"
import { User } from "@supabase/supabase-js"
import { authenticateRequest } from "./supabase"
import {
  ApiError,
  createErrorContext,
  createErrorResponse,
} from "./error-logger"

// Auth middleware wrapper
export const withAuth = (
  handler: (request: NextRequest, user: User) => Promise<NextResponse>
) => {
  return async (request: NextRequest) => {
    const context = createErrorContext(request)

    try {
      const { user, error } = await authenticateRequest(request)

      if (error || !user) {
        throw new ApiError(error || "Unauthorized", 401, "AUTH_FAILED")
      }

      return handler(request, user)
    } catch (error) {
      if (error instanceof ApiError) {
        return createErrorResponse(error, context)
      }

      return createErrorResponse(
        new ApiError(
          "Authentication middleware failed",
          500,
          "AUTH_MIDDLEWARE_ERROR"
        ),
        context
      )
    }
  }
}

// Combined auth and validation middleware
export const withAuthAndValidation = <T>(
  handler: (
    request: NextRequest,
    user: User,
    validatedData: T
  ) => Promise<NextResponse>,
  validationSchema: { parse: (data: unknown) => T }
) => {
  return async (request: NextRequest) => {
    const context = createErrorContext(request)

    try {
      // Check authentication
      const { user, error } = await authenticateRequest(request)

      if (error || !user) {
        throw new ApiError(error || "Unauthorized", 401, "AUTH_FAILED")
      }

      // Update context with user info
      context.userId = user.id

      // Validate request data
      let requestData: unknown
      try {
        requestData = await request.json()
      } catch {
        throw new ApiError("Invalid JSON in request body", 400, "INVALID_JSON")
      }

      let validatedData: T
      try {
        validatedData = validationSchema.parse(requestData)
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Invalid request data"
        throw new ApiError(errorMessage, 400, "VALIDATION_FAILED")
      }

      return handler(request, user, validatedData)
    } catch (error) {
      if (error instanceof ApiError) {
        return createErrorResponse(error, context)
      }

      return createErrorResponse(
        new ApiError("Middleware error", 500, "MIDDLEWARE_ERROR"),
        context
      )
    }
  }
}

// Standard error response helper
export const errorResponse = (message: string, status: number = 500) => {
  return NextResponse.json({ error: message }, { status })
}

// Standard success response helper
export const successResponse = (
  data: Record<string, unknown>,
  status: number = 200
) => {
  return NextResponse.json(data, { status })
}

// Query parameter validation helper
export const validateQueryParams = <T>(
  request: NextRequest,
  validationSchema: { parse: (data: Record<string, string>) => T }
): { success: true; data: T } | { success: false; error: string } => {
  try {
    const { searchParams } = new URL(request.url)
    const params: Record<string, string> = {}

    searchParams.forEach((value, key) => {
      params[key] = value
    })

    const validatedData = validationSchema.parse(params)
    return { success: true, data: validatedData }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Invalid query parameters"
    return { success: false, error: errorMessage }
  }
}

import { NextRequest, NextResponse } from "next/server"
import { User } from "@supabase/supabase-js"
import { authenticateRequest } from "./supabase"

// Auth middleware wrapper
export const withAuth = (
  handler: (request: NextRequest, user: User) => Promise<NextResponse>
) => {
  return async (request: NextRequest) => {
    try {
      const { user, error } = await authenticateRequest(request)

      if (error || !user) {
        return NextResponse.json(
          { error: error || "Unauthorized" },
          { status: 401 }
        )
      }

      return handler(request, user)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
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
    try {
      // Check authentication
      const { user, error } = await authenticateRequest(request)

      if (error || !user) {
        return NextResponse.json(
          { error: error || "Unauthorized" },
          { status: 401 }
        )
      }

      // Validate request data
      let requestData: unknown
      try {
        requestData = await request.json()
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400 }
        )
      }

      let validatedData: T
      try {
        validatedData = validationSchema.parse(requestData)
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Invalid request data"
        return NextResponse.json({ error: errorMessage }, { status: 400 })
      }

      return handler(request, user, validatedData)
    } catch (error) {
      console.error("Middleware error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
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

import { createClient } from "@supabase/supabase-js"
import {
  createBrowserClient,
  createServerClient as createSupabaseServerClient,
} from "@supabase/ssr"
import { NextRequest } from "next/server"
import { env } from "./env"

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client-side Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client for API routes (with proper SSR)
export const createServerSupabaseClient = async (request?: NextRequest) => {
  if (request) {
    // For API routes - use request cookies
    return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_name: string, _value: string) {
          // Can't set cookies in API routes, but this is needed for the client
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove(_name: string) {
          // Can't remove cookies in API routes, but this is needed for the client
        },
      },
    })
  } else {
    // For server components - dynamically import cookies
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value, ...options })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remove(name: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    })
  }
}

// Legacy server client (deprecated - use createServerSupabaseClient instead)
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Admin client for server-side operations
export const createAdminClient = () => {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  return createClient(supabaseUrl, serviceRoleKey)
}

// Authentication utility for API routes
export const authenticateRequest = async (request: NextRequest) => {
  const supabase = await createServerSupabaseClient(request)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error: error?.message || "Unauthorized" }
  }

  return { user, error: null }
}

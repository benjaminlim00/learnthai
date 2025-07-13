import { z } from "zod"

// Check if we're running on the client side
const isClient = typeof window !== "undefined"

// Client-side environment variables (simple, no complex validation during hydration)
const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  NODE_ENV: process.env.NODE_ENV || "development",
}

// Server-side environment schema
const serverEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
})

// Validate server environment variables only on server
function validateServerEnv() {
  try {
    const parsed = serverEnvSchema.parse(process.env)

    // Redis config warning
    if (!parsed.UPSTASH_REDIS_REST_URL || !parsed.UPSTASH_REDIS_REST_TOKEN) {
      console.warn(
        "⚠️  Redis configuration missing - rate limiting will use fallback"
      )
    }

    console.log("✅ Server environment variables validated successfully")
    return parsed
  } catch (error) {
    console.error("❌ Server environment validation failed:")

    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`)
      })
    }

    console.error(
      "\nPlease check your .env.local file and ensure all required variables are set."
    )
    process.exit(1)
  }
}

// Export environment variables
export const env = {
  // Client-side variables (always available)
  NEXT_PUBLIC_SUPABASE_URL: clientEnv.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NODE_ENV: clientEnv.NODE_ENV,

  // Server-side variables (only validate on server)
  ...(isClient ? {} : validateServerEnv()),
}

// Simple type definition
export type Env = typeof env

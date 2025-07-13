import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import {
  withAuth,
  validateQueryParams,
  errorResponse,
  successResponse,
} from "@/lib/middleware"
import { getDueVocabularySchema } from "@/lib/validation"
import { User } from "@supabase/supabase-js"

// GET - Fetch vocabulary words due for review
export const GET = withAuth(async (request: NextRequest, user: User) => {
  try {
    const validation = validateQueryParams(request, getDueVocabularySchema)

    if (!validation.success) {
      return errorResponse(validation.error, 400)
    }

    const { limit } = validation.data
    const supabase = await createServerSupabaseClient(request)

    const currentTime = new Date().toISOString()

    // Fetch vocabulary words that are due for review
    const { data, error } = await supabase
      .from("vocabulary")
      .select("*")
      .eq("user_id", user.id)
      .lte("next_review", currentTime)
      .order("next_review", { ascending: true })
      .limit(limit)

    if (error) {
      console.error("Error fetching due vocabulary:", error)
      return errorResponse("Failed to fetch due vocabulary", 500)
    }

    // Debug: console.log("Due words found:", data.length)

    return successResponse({ words: data, count: data.length })
  } catch (error) {
    console.error("Error in due vocabulary GET:", error)
    return errorResponse("Internal server error", 500)
  }
})

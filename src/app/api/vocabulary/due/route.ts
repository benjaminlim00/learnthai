import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import {
  withAuth,
  validateQueryParams,
  errorResponse,
  successResponse,
} from "@/lib/middleware"
import { getDueVocabularySchema } from "@/lib/validation"
import { sortByDifficultyPriority } from "@/lib/services/spaced-repetition"
import { User } from "@supabase/supabase-js"
import { VocabularyWord } from "@/types/database"
import { ScoreBreakdown } from "@/types/scoring"

interface VocabularyWordWithPriority extends VocabularyWord {
  priority_score: number
  priority_reasoning: string[]
  priority_breakdown: ScoreBreakdown
}

// GET - Fetch vocabulary words due for review
export const GET = withAuth(async (request: NextRequest, user: User) => {
  try {
    const validation = validateQueryParams(request, getDueVocabularySchema)

    if (!validation.success) {
      return errorResponse(validation.error, 400)
    }

    const { limit, priority } = validation.data
    const supabase = await createServerSupabaseClient(request)

    const currentTime = new Date()
    const currentTimeISO = currentTime.toISOString()

    // Fetch vocabulary words that are due for review
    let query = supabase
      .from("vocabulary")
      .select("*")
      .eq("user_id", user.id)
      .lte("next_review", currentTimeISO)

    // For time-based ordering, we can optimize with database sorting
    if (priority === "time") {
      query = query.order("next_review", { ascending: true }).limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching due vocabulary:", error)
      return errorResponse("Failed to fetch due vocabulary", 500)
    }

    let selectedWords: VocabularyWord[] | VocabularyWordWithPriority[] = data

    // For difficulty-based ordering, use client-side priority scoring
    if (priority === "difficulty") {
      const prioritizedWords = sortByDifficultyPriority(data)
      selectedWords = prioritizedWords.slice(0, limit)
    }

    const response = {
      words: selectedWords,
      totalDue: data.length,
      priorityMode: priority,
    }

    return successResponse(response)
  } catch (error) {
    console.error("Error in due vocabulary GET:", error)
    return errorResponse("Internal server error", 500)
  }
})

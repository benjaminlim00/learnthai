import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import {
  withAuthAndValidation,
  errorResponse,
  successResponse,
} from "@/lib/middleware"
import {
  spacedRepetitionRatingSchema,
  SpacedRepetitionRatingInput,
} from "@/lib/validation"
import { calculateSM2 } from "@/lib/spaced-repetition"
import { SpacedRepetitionRating } from "@/types/database"
import { User } from "@supabase/supabase-js"

// POST - Rate a vocabulary word and update SM-2 values
export const POST = withAuthAndValidation(
  async (
    request: NextRequest,
    user: User,
    validatedData: SpacedRepetitionRatingInput
  ) => {
    try {
      const supabase = await createServerSupabaseClient(request)

      // First, fetch the current vocabulary word with all SM-2 data
      const { data: currentWord, error: fetchError } = await supabase
        .from("vocabulary")
        .select("*")
        .eq("id", validatedData.id)
        .eq("user_id", user.id) // Ensure user owns this word
        .single()

      if (fetchError || !currentWord) {
        return errorResponse("Vocabulary word not found", 404)
      }

      // Calculate new SM-2 values based on the rating
      const sm2Result = calculateSM2(
        currentWord.interval || 1,
        currentWord.ease_factor || 2.5,
        currentWord.repetitions || 0,
        validatedData.rating as SpacedRepetitionRating // Safe cast since validation ensures 0-5
      )

      // Update the vocabulary word with new SM-2 values
      const { data, error } = await supabase
        .from("vocabulary")
        .update({
          interval: sm2Result.interval,
          ease_factor: sm2Result.easeFactor,
          repetitions: sm2Result.repetitions,
          next_review: sm2Result.nextReview.toISOString(),
          // Update status based on rating
          status: validatedData.rating >= 3 ? "learning" : "new",
          updated_at: new Date().toISOString(),
        })
        .eq("id", validatedData.id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating vocabulary with rating:", error)
        return errorResponse("Failed to update vocabulary", 500)
      }

      return successResponse({
        word: data,
        sm2Result: {
          interval: sm2Result.interval,
          easeFactor: sm2Result.easeFactor,
          repetitions: sm2Result.repetitions,
          nextReview: sm2Result.nextReview.toISOString(),
        },
      })
    } catch (error) {
      console.error("Error in vocabulary rating POST:", error)
      return errorResponse("Internal server error", 500)
    }
  },
  spacedRepetitionRatingSchema
)

import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import {
  withAuth,
  withAuthAndValidation,
  validateQueryParams,
  errorResponse,
  successResponse,
} from "@/lib/middleware"
import {
  createVocabularySchema,
  updateVocabularySchema,
  getVocabularySchema,
  deleteVocabularySchema,
  CreateVocabularyInput,
  UpdateVocabularyInput,
} from "@/lib/validation"
import { getDefaultSM2Values } from "@/lib/spaced-repetition"
import { User } from "@supabase/supabase-js"

// POST - Create vocabulary word
export const POST = withAuthAndValidation(
  async (
    request: NextRequest,
    user: User,
    validatedData: CreateVocabularyInput
  ) => {
    try {
      const supabase = await createServerSupabaseClient(request)

      // Get default SM-2 values for new vocabulary
      const sm2Defaults = getDefaultSM2Values()

      const { data, error } = await supabase
        .from("vocabulary")
        .insert({
          user_id: user.id, // Use authenticated user ID, not from request
          word: validatedData.word,
          word_romanization: validatedData.word_romanization,
          translation: validatedData.translation,
          sentence: validatedData.sentence,
          sentence_romanization: validatedData.sentence_romanization,
          sentence_translation: validatedData.sentence_translation,
          status: "new",
          // Add SM-2 default values
          interval: sm2Defaults.interval,
          ease_factor: sm2Defaults.easeFactor,
          repetitions: sm2Defaults.repetitions,
          next_review: sm2Defaults.nextReview,
        })
        .select()
        .single()

      if (error) {
        console.error("Error saving vocabulary:", error)
        return errorResponse("Failed to save vocabulary", 500)
      }

      return successResponse({ word: data })
    } catch (error) {
      console.error("Error in vocabulary POST:", error)
      return errorResponse("Internal server error", 500)
    }
  },
  createVocabularySchema
)

// GET - Fetch vocabulary words
export const GET = withAuth(async (request: NextRequest, user: User) => {
  try {
    const validation = validateQueryParams(request, getVocabularySchema)

    if (!validation.success) {
      return errorResponse(validation.error, 400)
    }

    const { status } = validation.data
    const supabase = await createServerSupabaseClient(request)

    let query = supabase
      .from("vocabulary")
      .select("*")
      .eq("user_id", user.id) // Use authenticated user ID
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching vocabulary:", error)
      return errorResponse("Failed to fetch vocabulary", 500)
    }

    return successResponse({ words: data })
  } catch (error) {
    console.error("Error in vocabulary GET:", error)
    return errorResponse("Internal server error", 500)
  }
})

// PUT - Update vocabulary word status
export const PUT = withAuthAndValidation(
  async (
    request: NextRequest,
    user: User,
    validatedData: UpdateVocabularyInput
  ) => {
    try {
      const supabase = await createServerSupabaseClient(request)

      // First, verify the vocabulary belongs to the user
      const { data: existingWord, error: fetchError } = await supabase
        .from("vocabulary")
        .select("user_id")
        .eq("id", validatedData.id)
        .single()

      if (fetchError || !existingWord) {
        return errorResponse("Vocabulary word not found", 404)
      }

      if (existingWord.user_id !== user.id) {
        return errorResponse("Unauthorized", 403)
      }

      // Update the word
      const { data, error } = await supabase
        .from("vocabulary")
        .update({
          status: validatedData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", validatedData.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating vocabulary:", error)
        return errorResponse("Failed to update vocabulary", 500)
      }

      return successResponse({ word: data })
    } catch (error) {
      console.error("Error in vocabulary PUT:", error)
      return errorResponse("Internal server error", 500)
    }
  },
  updateVocabularySchema
)

// DELETE - Delete vocabulary word
export const DELETE = withAuthAndValidation(
  async (
    request: NextRequest,
    user: User,
    validatedData: { id?: string; word?: string }
  ) => {
    try {
      const supabase = await createServerSupabaseClient(request)
      let wordToDelete

      if (validatedData.id) {
        // Find word by ID (review page)
        const { data: existingWord, error: fetchError } = await supabase
          .from("vocabulary")
          .select("id, user_id, word")
          .eq("id", validatedData.id)
          .single()

        if (fetchError || !existingWord) {
          return errorResponse("Vocabulary word not found", 404)
        }

        if (existingWord.user_id !== user.id) {
          return errorResponse("Unauthorized", 403)
        }

        wordToDelete = existingWord
      } else if (validatedData.word) {
        // Find word by word text and user_id (topic page)
        const { data: existingWord, error: fetchError } = await supabase
          .from("vocabulary")
          .select("id, user_id, word")
          .eq("word", validatedData.word)
          .eq("user_id", user.id)
          .single()

        if (fetchError || !existingWord) {
          return errorResponse("Vocabulary word not found", 404)
        }

        wordToDelete = existingWord
      } else {
        return errorResponse("Either id or word must be provided", 400)
      }

      // Delete the word
      const { error } = await supabase
        .from("vocabulary")
        .delete()
        .eq("id", wordToDelete.id)

      if (error) {
        console.error("Error deleting vocabulary:", error)
        return errorResponse("Failed to delete vocabulary", 500)
      }

      return successResponse({ success: true })
    } catch (error) {
      console.error("Error in vocabulary DELETE:", error)
      return errorResponse("Internal server error", 500)
    }
  },
  deleteVocabularySchema
)

import { NextRequest } from "next/server"
import OpenAI from "openai"
import { createServerSupabaseClient } from "@/lib/supabase"
import {
  withAuthAndValidation,
  errorResponse,
  successResponse,
} from "@/lib/middleware"
import { withRateLimit, vocabGenerationLimiter } from "@/lib/rate-limit"
import {
  generateVocabSchema,
  GenerateVocabInput,
  gptVocabularyResponseSchema,
} from "@/lib/validation"
import { User } from "@supabase/supabase-js"
import { env } from "@/lib/env"

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

// POST - Generate vocabulary
const generateVocabHandler = withAuthAndValidation(
  async (
    request: NextRequest,
    user: User,
    validatedData: GenerateVocabInput
  ) => {
    try {
      const { topic } = validatedData

      // Check daily usage limit (5 generations per day)
      const supabase = await createServerSupabaseClient(request)

      try {
        const { data: dailyUsage, error: usageError } = await supabase
          .from("generation_logs")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .gte(
            "created_at",
            new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
          )
          .lt(
            "created_at",
            new Date(Date.now() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0] + "T00:00:00.000Z"
          )

        if (usageError) {
          console.error("Error checking daily usage:", usageError)
          return errorResponse("Failed to check daily usage limit", 500)
        }

        const dailyCount = dailyUsage?.length || 0
        if (dailyCount >= 5) {
          return errorResponse(
            "You've reached your daily generation limit of 5 generations. Try again tomorrow!",
            403
          )
        }
      } catch (error) {
        console.error("Database error checking daily usage:", error)
        return errorResponse("Failed to check daily usage limit", 500)
      }

      // Get user's learned words to avoid repetition
      let learnedWordsList: string[] = []

      try {
        const { data: learnedWords, error: dbError } = await supabase
          .from("vocabulary")
          .select("word")
          .eq("user_id", user.id) // Use authenticated user ID
          .in("status", ["learning", "mastered"])

        if (dbError) {
          console.error("Error fetching learned words:", dbError)
          // Continue without learned words if database fails
          learnedWordsList = []
        } else {
          learnedWordsList =
            learnedWords?.map((w: { word: string }) => w.word) || []
        }
      } catch (error) {
        console.error("Database error fetching learned words:", error)
        // Continue without learned words if database fails
        learnedWordsList = []
      }

      const systemPrompt = `You are a friendly Thai language learning assistant.

Generate Thai vocabulary with accurate romanization and everyday example sentences that sound like how real people speak.

Use a consistent romanization system similar to the Royal Thai General System of Transcription.

Respond with valid JSON only, using the exact schema provided.`

      const userPrompt = `Generate 10 useful Thai vocabulary words for the topic: "${topic}"

${
  learnedWordsList.length > 0
    ? `Avoid these words the user has already learned: ${learnedWordsList.join(
        ", "
      )}`
    : ""
}

Each word should include:
1. The Thai word
2. Romanized pronunciation
3. English translation
4. A casual, natural Thai example sentence (like something you'd say in everyday conversation)
5. Romanized pronunciation of the sentence
6. English translation of the sentence

Use a friendly, informal tone — like something you'd say to a friend, not formal or textbook Thai.

Respond with a JSON object containing a "vocabulary" array with exactly this structure:
{
  "vocabulary": [
    {
      "word": "Thai word",
      "word_romanization": "pronunciation",
      "translation": "English meaning",
      "sentence": "Thai example sentence",
      "sentence_romanization": "sentence pronunciation", 
      "sentence_translation": "English sentence translation"
    }
  ]
}`

      let completion: OpenAI.Chat.Completions.ChatCompletion
      try {
        completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        })
      } catch (error) {
        console.error("OpenAI API error:", error)
        return errorResponse("Failed to generate vocabulary from OpenAI", 500)
      }

      const content = completion.choices[0]?.message?.content
      if (!content) {
        return errorResponse("No response from OpenAI", 500)
      }

      // Parse and validate the JSON response
      let parsedResponse: unknown
      try {
        parsedResponse = JSON.parse(content)
      } catch (error) {
        console.error("JSON parse error:", error)
        return errorResponse("Invalid JSON response from OpenAI", 500)
      }

      // Validate the response structure using Zod
      const validationResult =
        gptVocabularyResponseSchema.safeParse(parsedResponse)
      if (!validationResult.success) {
        console.error("Validation error:", validationResult.error)
        return errorResponse("Invalid response format from OpenAI", 500)
      }

      const vocabWords = validationResult.data.vocabulary

      // Store generation log
      try {
        const vocabularyItems = vocabWords.map((word) => ({
          word: word.word,
          word_romanization: word.word_romanization,
          translation: word.translation,
          sentence: word.sentence,
          sentence_romanization: word.sentence_romanization,
          sentence_translation: word.sentence_translation,
        }))

        const { error: logError } = await supabase
          .from("generation_logs")
          .insert({
            user_id: user.id,
            input_topic: topic,
            vocabulary_response: vocabularyItems,
          })

        if (logError) {
          console.error("Error storing generation log:", logError)
          // Continue and return result even if logging fails
        }
      } catch (error) {
        console.error("Database error storing generation log:", error)
        // Continue and return result even if logging fails
      }

      return successResponse({ vocabWords })
    } catch (error) {
      console.error("Error in generate-vocab handler:", error)
      return errorResponse("Internal server error", 500)
    }
  },
  generateVocabSchema
)

// Apply rate limiting to the generate vocab handler
export const POST = withRateLimit(generateVocabHandler, vocabGenerationLimiter)

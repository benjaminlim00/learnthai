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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// POST - Generate vocabulary
const generateVocabHandler = withAuthAndValidation(
  async (
    request: NextRequest,
    user: User,
    validatedData: GenerateVocabInput
  ) => {
    try {
      // Check for OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        return errorResponse("OpenAI API key not configured", 500)
      }

      const { topic } = validatedData

      // Get user's learned words to avoid repetition
      const supabase = await createServerSupabaseClient(request)
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

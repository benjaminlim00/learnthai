import { NextRequest } from "next/server"
import OpenAI from "openai"
import {
  withAuthAndValidation,
  errorResponse,
  successResponse,
} from "@/lib/middleware"
import { withRateLimitAndAuth, generalApiLimiter } from "@/lib/rate-limit"
import {
  translateSchema,
  TranslateInput,
  translateResponseSchema,
  TranslationLanguage,
} from "@/lib/validation"
import { User } from "@supabase/supabase-js"
import { env } from "@/lib/env"
import { createServerSupabaseClient } from "@/lib/supabase"

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

// Helper function to detect language
function detectLanguage(text: string): TranslationLanguage {
  // Simple heuristic: if the text contains Thai characters, it's Thai
  const thaiPattern = /[\u0E00-\u0E7F]/
  return thaiPattern.test(text) ? "thai" : "english"
}

// POST - Translate text
const translateHandler = withAuthAndValidation(
  async (request: NextRequest, user: User, validatedData: TranslateInput) => {
    try {
      const { text } = validatedData
      const detectedLanguage = detectLanguage(text)

      // Fetch user's speaker preference for gendered translations
      const supabase = await createServerSupabaseClient(request)
      const { data: profileData } = await supabase.rpc(
        "get_or_create_user_profile",
        {
          user_uuid: user.id,
        }
      )

      const speakerPreference = profileData?.[0]?.speaker_preference || "female"
      const genderContext =
        speakerPreference === "male" ? "masculine" : "feminine"

      const systemPrompt = `You are a professional translator specializing in Thai and English languages. When translating, provide comprehensive information including usage examples and example sentences.

The user prefers ${genderContext} forms when gendered language is appropriate. For languages with grammatical gender or gendered speech patterns (like Thai polite particles), use the ${genderContext} form in translations and examples.

Respond in the following JSON format:
{
  "translatedText": "primary translation",
  "romanization": "romanized Thai text (only for Thai text)",
  "usage": ["usage example 1", "usage example 2", "usage example 3"],
  "exampleSentences": [
    {
      "text": "example sentence in target language",
      "translation": "translation of example sentence",
      "romanization": "romanization (only for Thai text)"
    }
  ]
}

For Thai text, always provide romanization using the Royal Thai General System of Transcription.
Provide 2-3 example sentences that show different contexts or usages. The example sentence should not be overly similar to the text provided by the user. If the input is a long sentence, summarize its meaning and include that summary inside the 'usage' field.
Keep example sentences natural and practical, using ${genderContext} forms when appropriate.`

      const userPrompt = `Translate and provide detailed information for this ${detectedLanguage} text:

${text}`

      let completion: OpenAI.Chat.Completions.ChatCompletion
      try {
        completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
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
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: "json_object" },
        })
      } catch (error) {
        console.error("OpenAI API error:", error)
        return errorResponse("Failed to translate using OpenAI", 500)
      }

      const responseContent = completion.choices[0]?.message?.content?.trim()
      if (!responseContent) {
        return errorResponse("No translation received from OpenAI", 500)
      }

      try {
        const parsed = JSON.parse(responseContent)
        // Validate the response against our schema
        const validatedResponse = translateResponseSchema.parse({
          ...parsed,
          sourceLanguage: detectedLanguage,
        })
        return successResponse(validatedResponse)
      } catch (error) {
        console.error(
          "Failed to parse or validate translation response:",
          error
        )
        return errorResponse("Failed to parse translation response", 500)
      }
    } catch (error) {
      console.error("Error in translate handler:", error)
      return errorResponse("Internal server error", 500)
    }
  },
  translateSchema
)

// Apply rate limiting to the translate handler
export const POST = withRateLimitAndAuth(translateHandler, generalApiLimiter)

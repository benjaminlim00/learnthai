import { NextRequest } from "next/server"
import OpenAI from "openai"
import {
  withAuthAndValidation,
  errorResponse,
  successResponse,
} from "@/lib/middleware"
import { withRateLimit, translationLimiter } from "@/lib/rate-limit"
import { translateSchema, TranslateInput } from "@/lib/validation"
import { User } from "@supabase/supabase-js"
import { env } from "@/lib/env"

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

// POST - Translate text
const translateHandler = withAuthAndValidation(
  async (request: NextRequest, user: User, validatedData: TranslateInput) => {
    try {
      const { text, sourceLanguage, targetLanguage } = validatedData

      // Check if we need romanization (English to Thai)
      const needsRomanization =
        sourceLanguage === "English" && targetLanguage === "Thai"

      let systemPrompt: string
      let userPrompt: string

      if (needsRomanization) {
        systemPrompt = `You are a professional translator specializing in Thai and English languages. When translating from English to Thai, provide both the Thai translation and its romanization using the Royal Thai General System of Transcription.

Respond in the following JSON format:
{
  "translation": "Thai text here",
  "romanization": "romanized Thai text here"
}

Provide accurate, natural translations without any additional commentary.`

        userPrompt = `Translate the following English text to Thai and provide its romanization:

${text}`
      } else {
        systemPrompt = `You are a professional translator specializing in Thai and English languages. Provide accurate, natural translations without any additional commentary or explanations. Return only the translated text.`

        userPrompt = `Translate the following ${sourceLanguage} text to ${targetLanguage}:

${text}`
      }

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
          temperature: 0.3, // Lower temperature for more consistent translations
          max_tokens: 1000,
          ...(needsRomanization && {
            response_format: { type: "json_object" },
          }),
        })
      } catch (error) {
        console.error("OpenAI API error:", error)
        return errorResponse("Failed to translate using OpenAI", 500)
      }

      const responseContent = completion.choices[0]?.message?.content?.trim()
      if (!responseContent) {
        return errorResponse("No translation received from OpenAI", 500)
      }

      if (needsRomanization) {
        try {
          const parsed = JSON.parse(responseContent)
          return successResponse({
            translatedText: parsed.translation,
            romanization: parsed.romanization,
            sourceLanguage,
            targetLanguage,
          })
        } catch (error) {
          console.error("Failed to parse romanization response:", error)
          return errorResponse("Failed to parse romanization response", 500)
        }
      } else {
        return successResponse({
          translatedText: responseContent,
          sourceLanguage,
          targetLanguage,
        })
      }
    } catch (error) {
      console.error("Error in translate handler:", error)
      return errorResponse("Internal server error", 500)
    }
  },
  translateSchema
)

// Apply rate limiting to the translate handler
export const POST = withRateLimit(translateHandler, translationLimiter)

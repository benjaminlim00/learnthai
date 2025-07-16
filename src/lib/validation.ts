import { CategorizedError } from "@/types/scoring"
import { z } from "zod"

export const generateVocabSchema = z
  .object({
    mode: z.enum(["topic", "single"], {
      required_error: "Mode is required",
    }),
    topic: z.string().optional(),
    word: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.mode === "topic") {
        return (
          data.topic && data.topic.trim().length > 0 && data.topic.length <= 200
        )
      }
      if (data.mode === "single") {
        return (
          data.word && data.word.trim().length > 0 && data.word.length <= 100
        )
      }
      return false
    },
    {
      message:
        "Topic is required for topic mode, word is required for single mode",
    }
  )

export type GenerateVocabInput = z.infer<typeof generateVocabSchema>

// Translation API validation
export const translateSchema = z.object({
  text: z.string().min(1, "Text is required").max(500, "Text too long"),
  sourceLanguage: z.enum(["English", "Thai"], {
    required_error: "Source language is required",
  }),
  targetLanguage: z.enum(["English", "Thai"], {
    required_error: "Target language is required",
  }),
})

export type TranslateInput = z.infer<typeof translateSchema>

// Vocabulary word creation validation (userId removed - comes from auth)
export const createVocabularySchema = z.object({
  word: z.string().min(1, "Word is required").max(200, "Word too long"),
  word_romanization: z.string(),
  translation: z
    .string()
    .min(1, "Translation is required")
    .max(500, "Translation too long"),
  sentence: z
    .string()
    .min(1, "Sentence is required")
    .max(1000, "Sentence too long"),
  sentence_romanization: z.string(),
  sentence_translation: z.string(),
})

export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>

// Vocabulary word update validation
export const updateVocabularySchema = z.object({
  id: z.string().uuid("Invalid vocabulary ID format"),
  status: z.enum(["new", "learning", "mastered"], {
    required_error: "Status is required",
  }),
})

export type UpdateVocabularyInput = z.infer<typeof updateVocabularySchema>

// Spaced repetition rating validation (0-5 scale)
export const spacedRepetitionRatingSchema = z.object({
  id: z.string().uuid("Invalid vocabulary ID format"),
  rating: z
    .number()
    .int()
    .min(0, "Rating must be at least 0")
    .max(5, "Rating must be at most 5"),
})

export type SpacedRepetitionRatingInput = z.infer<
  typeof spacedRepetitionRatingSchema
>

// Vocabulary query validation (userId removed - comes from auth)
export const getVocabularySchema = z.object({
  status: z.enum(["new", "learning", "mastered"]).optional(),
})

// Get due vocabulary cards validation
export const getDueVocabularySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  priority: z.enum(["time", "difficulty"]).optional().default("difficulty"),
})

// Delete vocabulary validation
export const deleteVocabularySchema = z
  .object({
    id: z.string().uuid("Invalid vocabulary ID format").optional(),
    word: z.string().min(1, "Word is required").optional(),
  })
  .refine((data) => data.id || data.word, {
    message: "Either id or word must be provided",
  })

// GPT vocabulary response validation (for API responses)
export const gptVocabularyWordSchema = z.object({
  word: z.string().min(1, "Word is required"),
  word_romanization: z.string().min(1, "Word romanization is required"),
  translation: z.string().min(1, "Translation is required"),
  sentence: z.string().min(1, "Sentence is required"),
  sentence_romanization: z.string().min(1, "Sentence romanization is required"),
  sentence_translation: z.string().min(1, "Sentence translation is required"),
})

export const gptVocabularyResponseSchema = z.object({
  vocabulary: z
    .array(gptVocabularyWordSchema)
    .min(1, "At least one vocabulary word is required")
    .max(15, "Too many vocabulary words"),
})

export type GPTVocabularyWord = z.infer<typeof gptVocabularyWordSchema>
export type GPTVocabularyResponse = z.infer<typeof gptVocabularyResponseSchema>

// Pronunciation feedback validation schemas
export const correctedSchema = z.object({
  thai: z.string().min(1, "Thai text is required"),
  romanization: z.string().min(1, "Romanization is required"),
  translation: z.string().min(1, "Translation is required"),
})

export const pronunciationFeedbackSchema = z.object({
  transcribed: z.string().min(1, "Transcribed text is required"),
  mistakes: z.array(z.string()),
  tip: z.string().min(1, "Improvement tip is required"),
  corrected: correctedSchema,
})

export type CorrectedData = z.infer<typeof correctedSchema>
type PronunciationFeedbackRaw = z.infer<typeof pronunciationFeedbackSchema>
export type PronunciationFeedback = PronunciationFeedbackRaw & {
  score: number
  categorized_errors: CategorizedError[]
}

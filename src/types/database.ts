// Re-export validation types from the validation lib
export type { GPTVocabularyWord, GPTVocabularyResponse } from "@/lib/validation"

// Keep the original VocabularyWord interface for database records with SM-2 fields
export interface VocabularyWord {
  id: string
  user_id: string
  word: string
  word_romanization?: string
  translation: string
  sentence: string
  sentence_romanization?: string
  sentence_translation?: string
  status: "new" | "learning" | "mastered"
  // SM-2 Spaced Repetition fields
  interval: number // Days until next review
  ease_factor: number // Ease factor for SM-2 algorithm (default 2.5)
  repetitions: number // Number of successful repetitions
  next_review: string // ISO timestamp for next review
  created_at: string
  updated_at: string
}

// Remove the old GPTVocabularyResponse interface - now using Zod types
// export interface GPTVocabularyResponse {
//   word: string
//   word_romanization: string
//   translation: string
//   sentence: string
//   sentence_romanization: string
//   sentence_translation: string
// }

export interface User {
  id: string
  email: string
  created_at: string
}

// Spaced repetition rating scale (0-5)
export type SpacedRepetitionRating = 0 | 1 | 2 | 3 | 4 | 5

// SM-2 Algorithm result
export interface SM2Result {
  interval: number
  easeFactor: number
  repetitions: number
  nextReview: Date
}

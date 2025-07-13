// Re-export validation types from the validation lib
export type { GPTVocabularyWord, GPTVocabularyResponse } from "@/lib/validation"

// Keep the original VocabularyWord interface for database records
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

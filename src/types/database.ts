import { AudioType, ContentType } from "./pronunciation"

// Re-export validation types from the validation lib
export type { GPTVocabularyWord, GPTVocabularyResponse } from "@/lib/validation"

export type VocabStatus = "new" | "learning" | "mastered"

export interface VocabularyWord {
  id: string
  user_id: string
  word: string
  word_romanization: string
  translation: string
  sentence: string
  sentence_romanization: string
  sentence_translation: string
  status: VocabStatus
  // SM-2 Spaced Repetition fields
  interval: number // Days until next review
  ease_factor: number // Ease factor for SM-2 algorithm (default 2.5)
  repetitions: number // Number of successful repetitions
  next_review: string // ISO timestamp for next review
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  speaker_preference: "male" | "female"
  created_at: string
  updated_at: string
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

// Cached TTS Audio
export interface CachedAudio {
  id: string
  text_hash: string // SHA-256 hash of the text content
  text_content: string // Original text for reference
  voice_name: string // e.g., "nova"
  audio_type: AudioType // Type of audio
  content_type: ContentType // Type of content
  storage_path: string // Path in Supabase Storage
  file_size: number // File size in bytes
  created_at: string
}

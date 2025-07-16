export type ThaiTone = "mid" | "low" | "high" | "falling" | "rising"

export type ErrorType =
  | "tone_error"
  | "vowel_length"
  | "vowel_mispronunciation"
  | "aspiration"
  | "consonant_error"
  | "final_consonant"
  | "rhythm_timing"
  | "stress_pattern"
  | "word_boundary"
  | "overall_fluency"

export type ContentType = "word" | "sentence"
export type AudioType = "reference" | "user"

export type ProficiencyLevel = "beginner" | "intermediate" | "advanced"
export type ImprovementTrend = "improving" | "declining" | "stable"

export interface PronunciationSession {
  user_id: string
  content: string
  content_type: ContentType
  errors: ErrorType[]
  score: number
  created_at: string
}

export type WeaknessPriority = "critical" | "high" | "medium" | "low"

export interface Weakness {
  error_type: ErrorType
  frequency: number
  priority: WeaknessPriority
  example_words: string[]
  failed_attempts: number
  total_attempts: number
  recommendation: string

  // TODO: consider adding
  // last_practiced: string
}

export interface Summary {
  total_issues: number
  critical_issues: number
  high_priority_issues: number
  overall_improvement_trend: ImprovementTrend
  suggested_daily_practice_time: number
  estimated_proficiency_level: ProficiencyLevel
}

type LearningInsightType = "pattern" | "strength" | "weakness"

export interface LearningInsight {
  type: LearningInsightType
  title: string
  description: string
  actionable_tip: string
}

export interface AnalysisData {
  weaknesses: Weakness[]
  summary: Summary
  learning_insights: LearningInsight[]
}

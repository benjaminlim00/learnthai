import { ErrorType, ThaiTone } from "./pronunciation"

export interface ScoreBreakdown {
  base_score: number
  difficulty_multiplier: number
  error_breakdown: { [key in ErrorType]?: number }
  total_errors: number
}

// export interface CalulatedScore {
//   score: number
//   breakdown: ScoreBreakdown
// }

export interface CategorizedError {
  type: ErrorType
  severity: VocabSeverity
  description: string
  phonetic_details: PhoneticDetails
  suggestions: string[]
  weight: number // Impact on overall score
}

export type VocabSeverity = "minor" | "moderate" | "major" | "critical"

export interface PhoneticDetails {
  tone_expected: ThaiTone
  tone_actual?: ThaiTone
}

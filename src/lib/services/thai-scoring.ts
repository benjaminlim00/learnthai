import { ErrorType, ThaiTone, ContentType } from "@/types/pronunciation"
import { PronunciationFeedback } from "../validation"
import {
  CategorizedError,
  PhoneticDetails,
  VocabSeverity,
} from "@/types/scoring"
import {
  CHALLENGING_PATTERNS,
  getExpectedTone,
  inferTonesFromMistake,
  THAI_PHONETIC_WEIGHTS,
  TONE_DIFFICULTY,
} from "./phonetic"

// we use this service to get feedback on direct speech practice
export class ThaiScoringService {
  private static getSeverityMultiplier(severity: string): number {
    const multipliers = {
      minor: 0.5,
      moderate: 1.0,
      major: 1.5,
      critical: 2.0,
    }
    return multipliers[severity as keyof typeof multipliers] || 1.0
  }

  /**
   * Calculate sophisticated pronunciation score for Thai
   */
  static calculateScore(
    feedback: PronunciationFeedback,
    targetText: string,
    contentType: ContentType
  ): { score: number } {
    const enhancedErrors = this.enhanceErrors(feedback.mistakes, targetText)
    const difficultyMultiplier = this.calculateDifficulty(
      targetText,
      contentType
    )

    // Base score calculation
    let totalDeduction = 0

    const errorBreakdown: { [key in ErrorType]?: number } = {}

    enhancedErrors.forEach((error) => {
      const baseWeight = THAI_PHONETIC_WEIGHTS[error.type] || 10
      const severityMultiplier = this.getSeverityMultiplier(error.severity)
      const deduction = baseWeight * severityMultiplier * difficultyMultiplier

      totalDeduction += deduction
      errorBreakdown[error.type] = (errorBreakdown[error.type] || 0) + deduction
    })

    //TODO: add confidence system in future
    const adjustedDeduction = totalDeduction

    // Calculate final score with minimum threshold
    const rawScore = Math.max(0, 100 - adjustedDeduction)
    const finalScore = Math.round(rawScore)

    //TODO: use this information
    // breakdown: {
    //     base_score: rawScore,
    //     difficulty_multiplier: difficultyMultiplier,
    //     error_breakdown: errorBreakdown,
    //     total_errors: enhancedErrors.length,
    //   },

    return {
      score: finalScore,
    }
  }

  /**
   * Categorize pronunciation errors with Thai-specific analysis
   */
  static enhanceErrors(
    mistakes: string[],
    targetText: string
  ): CategorizedError[] {
    const errors: CategorizedError[] = []

    mistakes.forEach((mistake) => {
      const errorType = this.getErrorType(mistake.toLowerCase())
      const severity = this.getErrorSeverity(mistake, errorType, targetText)
      const suggestions = this.generateSuggestions(errorType)

      errors.push({
        type: errorType,
        severity,
        description: mistake,
        suggestions,
        weight: THAI_PHONETIC_WEIGHTS[errorType] || 10,
        phonetic_details: this.extractPhoneticDetails(mistake, targetText),
      })
    })

    return errors
  }

  /**
   * Classify error type based on mistake description
   */
  private static getErrorType(mistake: string): ErrorType {
    // Thai-specific error pattern matching
    if (
      mistake.includes("tone") ||
      mistake.includes("pitch") ||
      mistake.includes("intonation")
    ) {
      return "tone_error"
    }
    if (
      mistake.includes("vowel") &&
      (mistake.includes("short") || mistake.includes("long"))
    ) {
      return "vowel_length"
    }
    if (mistake.includes("vowel")) {
      return "vowel_mispronunciation"
    }
    if (
      mistake.includes("aspirated") ||
      mistake.includes("breath") ||
      mistake.includes("puff")
    ) {
      return "aspiration"
    }
    if (mistake.includes("final") || mistake.includes("ending")) {
      return "final_consonant"
    }
    if (mistake.includes("consonant") || mistake.includes("sound")) {
      return "consonant_error"
    }
    if (
      mistake.includes("rhythm") ||
      mistake.includes("timing") ||
      mistake.includes("pace")
    ) {
      return "rhythm_timing"
    }
    if (mistake.includes("stress") || mistake.includes("emphasis")) {
      return "stress_pattern"
    }

    return "overall_fluency"
  }

  /**
   * Calculate difficulty multiplier based on Thai text complexity
   */
  static calculateDifficulty(text: string, mode: ContentType): number {
    let difficulty = 1.0

    // Base difficulty by mode
    difficulty *= mode === "sentence" ? 1.2 : 1.0

    // Text length factor
    difficulty *= Math.min(1.5, 1 + text.length * 0.02)

    // Check for challenging Thai patterns
    Object.entries(CHALLENGING_PATTERNS).forEach(([pattern, multiplier]) => {
      if (text.includes(pattern)) {
        difficulty *= multiplier
      }
    })

    // Tone marker complexity (more tone marks = harder)
    const toneMarkers = (text.match(/[่้๊๋]/g) || []).length
    difficulty *= 1 + toneMarkers * 0.1

    // Apply tone-specific difficulty based on Thai phonetics
    const toneTypes = getExpectedTone(text)
    const avgToneDifficulty =
      toneTypes.reduce(
        (acc: number, tone: ThaiTone) => acc + TONE_DIFFICULTY[tone],
        0
      ) / Math.max(1, toneTypes.length)
    difficulty *= avgToneDifficulty

    return Math.min(2.0, difficulty) // Cap at 2x difficulty
  }

  /**
   * Determine severity of error based on context
   */
  private static getErrorSeverity(
    mistake: string,
    errorType: ErrorType,
    targetText: string
  ): VocabSeverity {
    // Tone errors are typically more critical in Thai
    if (errorType === "tone_error") {
      return "critical"
    }

    // Vowel length errors can change meaning
    if (errorType === "vowel_length") {
      return "major"
    }

    // Severity increases with text complexity
    const hasComplexPatterns = Object.keys(CHALLENGING_PATTERNS).some(
      (pattern) => targetText.includes(pattern)
    )

    // Context-specific severity
    if (mistake.includes("completely") || mistake.includes("very")) {
      return hasComplexPatterns ? "critical" : "major"
    }
    if (mistake.includes("slightly") || mistake.includes("minor")) {
      return "minor"
    }

    return hasComplexPatterns ? "major" : "moderate"
  }

  /**
   * Generate targeted suggestions for improvement
   */
  private static generateSuggestions(errorType: ErrorType): string[] {
    const suggestions: { [key in ErrorType]: string[] } = {
      tone_error: [
        "Practice with a tone trainer app",
        "Listen to native speakers and focus on pitch changes",
        "Use hand gestures to follow tone contours",
        "Record yourself and compare with native audio",
      ],
      vowel_length: [
        "Pay attention to vowel duration - some are twice as long",
        "Practice with minimal pairs (เขา vs ข้าว)",
        "Use a metronome to practice vowel timing",
      ],
      vowel_mispronunciation: [
        "Focus on mouth position for Thai vowels",
        "Practice vowel drills with IPA pronunciation guide",
        "Listen to vowel isolation exercises",
      ],
      aspiration: [
        "Practice breathing exercises before consonants",
        "Use a tissue to check air flow",
        "Focus on ค vs ก, ผ vs บ distinctions",
      ],
      consonant_error: [
        "Practice consonant minimal pairs",
        "Focus on tongue placement",
        "Use phonetic transcription as reference",
      ],
      final_consonant: [
        "Don't drop final consonants completely",
        "Practice unreleased consonants",
        "Focus on glottal stops in Thai",
      ],
      rhythm_timing: [
        "Practice with syllable timing",
        "Use a metronome for consistent rhythm",
        "Focus on stress patterns in Thai",
      ],
      stress_pattern: [
        "Thai has different stress patterns than English",
        "Practice with word stress markers",
        "Listen to natural speech rhythm",
      ],
      word_boundary: [
        "Practice clear word separation",
        "Focus on liaison rules in Thai",
        "Work on connected speech patterns",
      ],
      overall_fluency: [
        "Practice speaking more slowly at first",
        "Focus on clear articulation",
        "Build up speed gradually",
      ],
    }

    return suggestions[errorType] || ["Continue practicing this sound pattern"]
  }

  /**
   * Extract phonetic details for specific error analysis
   */
  private static extractPhoneticDetails(
    mistake: string,
    targetText: string
  ): PhoneticDetails {
    // Integrate with a Thai phonetic analyzer for accurate sound mapping
    const expectedTones = getExpectedTone(targetText)
    const inferredTones = inferTonesFromMistake(mistake, expectedTones)

    return {
      tone_expected: expectedTones.length > 0 ? expectedTones[0] : "mid",
      tone_actual: inferredTones.length > 0 ? inferredTones[0] : undefined,
    }
  }
}

import {
  SM2Result,
  SpacedRepetitionRating,
  VocabStatus,
  VocabularyWord,
} from "@/types/database"

/**
 * Simplified SM-2 Algorithm Implementation
 * Based on the SuperMemo-2 algorithm for spaced repetition
 */

/**
 * Calculate the next review parameters based on SM-2 algorithm
 * @param currentInterval Current interval in days
 * @param currentEaseFactor Current ease factor
 * @param currentRepetitions Current number of repetitions
 * @param rating User rating (0-5)
 * @returns Updated SM-2 parameters
 */
export function calculateSM2(
  currentInterval: number,
  currentEaseFactor: number,
  currentRepetitions: number,
  rating: SpacedRepetitionRating
): SM2Result {
  let newInterval: number
  let newEaseFactor: number
  let newRepetitions: number

  // Calculate new ease factor using the standard SM-2 formula for ALL ratings
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Rating 0: EF - 0.8, Rating 1: EF - 0.54, Rating 2: EF - 0.32
  // Rating 3: EF - 0.14, Rating 4: EF + 0.0, Rating 5: EF + 0.1
  newEaseFactor =
    currentEaseFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))

  // Ensure ease factor doesn't go below 1.3 (as per original SM-2 algorithm)
  newEaseFactor = Math.max(1.3, newEaseFactor)

  if (rating < 3) {
    // Poor recall - reset the card (but keep the updated ease factor)
    newRepetitions = 0
    newInterval = 1
  } else {
    // Good recall - increase the interval
    newRepetitions = currentRepetitions + 1

    // Calculate new interval based on repetition number
    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 6
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor)
    }
  }

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + newInterval)

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
    nextReview,
  }
}

/**
 * Get default SM-2 values for new vocabulary words
 * @returns Default SM-2 parameters
 */
export function getDefaultSM2Values(): Omit<SM2Result, "nextReview"> & {
  nextReview: string
} {
  const nextReview = new Date() // Make new words immediately available for review

  return {
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: nextReview.toISOString(),
  }
}

type ScoreBreakdown = {
  difficulty: number
  efficiency: number
  status: number
  overdue: number
  interval: number
}

type PriorityScoreResult = {
  score: number
  breakdown: ScoreBreakdown
  reasoning: string[]
}

export function calculateEnhancedPriorityScore(
  word: VocabularyWord
): PriorityScoreResult {
  const currentTime = new Date()
  const nextReview = new Date(word.next_review)
  const createdAt = new Date(word.created_at)
  const lastReviewed = word.updated_at ? new Date(word.updated_at) : createdAt

  const daysSinceCreated = Math.max(
    1,
    Math.floor((currentTime.getTime() - createdAt.getTime()) / 86400000)
  )

  const daysSinceLastReview = Math.floor(
    (currentTime.getTime() - lastReviewed.getTime()) / 86400000
  )

  const breakdown: ScoreBreakdown = {
    difficulty: 0,
    efficiency: 0,
    status: 0,
    overdue: 0,
    interval: 0,
  }

  const reasoning: string[] = []

  // 1. Difficulty Score (0–35)
  breakdown.difficulty = Math.max(0, 35 - (word.ease_factor - 1.3) * 25)
  if (word.ease_factor < 2.0) {
    reasoning.push(
      `High difficulty (ease factor: ${word.ease_factor.toFixed(2)})`
    )
  }

  // 2. Efficiency Score (0–25)
  const expectedReps = Math.max(1, daysSinceCreated / 7)
  const actualEfficiency = word.repetitions / expectedReps
  const normalizedEfficiency = Math.min(1, actualEfficiency)
  const forgettingCurveMultiplier = Math.min(
    2.0,
    1 + (daysSinceLastReview / word.interval) * 0.5
  )
  breakdown.efficiency =
    (1 - normalizedEfficiency) * 25 * forgettingCurveMultiplier

  if (normalizedEfficiency < 0.5) {
    reasoning.push("Underperforming - review frequency too low")
  }

  // 3. Status Score (0–20)
  const baseStatusScores: Record<VocabStatus, number> = {
    new: 20,
    learning: 15,
    mastered: 5,
  }

  if (word.status === "learning" && word.ease_factor < 2.0) {
    breakdown.status = 18
    reasoning.push("Struggling learning word - boosting priority")
  } else if (word.status === "mastered" && word.ease_factor < 2.0) {
    breakdown.status = 10 // Mild boost
    reasoning.push("Regression detected in mastered word")
  } else {
    breakdown.status = baseStatusScores[word.status]
  }

  // 4. Overdue Score (0–20)
  if (nextReview <= currentTime) {
    const hoursOverdue = Math.floor(
      (currentTime.getTime() - nextReview.getTime()) / 3600000
    )

    let overdueScore = 0
    if (hoursOverdue <= 24) {
      overdueScore = hoursOverdue * 0.5
    } else {
      const daysOverdue = hoursOverdue / 24
      overdueScore = 12 + Math.min(8, daysOverdue * 2)
    }

    breakdown.overdue = Math.min(20, overdueScore)

    if (hoursOverdue >= 24) {
      reasoning.push(`${Math.floor(hoursOverdue / 24)} days overdue`)
    }
  }

  // 5. Interval Score (0–15)
  const intervalScore = 15 / (1 + Math.exp((word.interval - 10) / 5))
  breakdown.interval = intervalScore

  // Final Score
  const totalScore = Object.values(breakdown).reduce((sum, x) => sum + x, 0)
  const finalScore = Math.round(Math.min(100, totalScore))

  // TODO: HIGH PRIORITY - Integrate userStats for optimal learning efficiency
  // Priority: High - Missing user performance data reduces SM-2 effectiveness
  // Should collect: avg response time, retention rates, error patterns
  // Fix: Add user_statistics table and integrate with priority scoring

  return {
    score: finalScore,
    breakdown,
    reasoning,
  }
}

export function sortByDifficultyPriority(words: VocabularyWord[]): Array<
  VocabularyWord & {
    priority_score: number
    priority_reasoning: string[]
    priority_breakdown: ScoreBreakdown
  }
> {
  return words
    .map((word) => {
      const result = calculateEnhancedPriorityScore(word)
      return {
        ...word,
        priority_score: result.score,
        priority_reasoning: result.reasoning,
        priority_breakdown: result.breakdown,
      }
    })
    .sort((a, b) => b.priority_score - a.priority_score)
}

// UTILS for working with sm2

/**
 * Convert ease factor to user-friendly difficulty level
 * @param easeFactor Ease factor (1.3 to ~3.0+)
 * @returns Difficulty level object with label and color
 */
export function getEaseDifficulty(easeFactor: number): {
  label: string
  color: string
  stars: number
} {
  if (easeFactor >= 2.8) {
    return { label: "Very Easy", color: "text-green-600", stars: 5 }
  } else if (easeFactor >= 2.4) {
    return { label: "Easy", color: "text-green-500", stars: 4 }
  } else if (easeFactor >= 2.0) {
    return { label: "Medium", color: "text-yellow-500", stars: 3 }
  } else if (easeFactor >= 1.6) {
    return { label: "Hard", color: "text-orange-500", stars: 2 }
  } else {
    return { label: "Very Hard", color: "text-red-500", stars: 1 }
  }
}

/**
 * Generate star rating display for ease
 * @param easeFactor Ease factor (1.3 to ~3.0+)
 * @returns Star rating string
 */
export function getEaseStars(easeFactor: number): string {
  const { stars } = getEaseDifficulty(easeFactor)
  return "★".repeat(stars) + "☆".repeat(5 - stars)
}

/**
 * Format interval for display
 * @param interval Interval in days
 * @returns Formatted string
 */
export function formatInterval(interval: number): string {
  if (interval === 1) {
    return "1 day"
  } else if (interval < 30) {
    return `${interval} days`
  } else if (interval < 365) {
    const months = Math.round(interval / 30)
    return months === 1 ? "1 month" : `${months} months`
  } else {
    const years = Math.round(interval / 365)
    return years === 1 ? "1 year" : `${years} years`
  }
}

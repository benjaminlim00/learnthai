import { SM2Result, SpacedRepetitionRating } from "@/types/database"

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

/**
 * Check if a vocabulary word is due for review
 * @param nextReview Next review date (ISO string)
 * @returns True if the word is due for review
 */
export function isDueForReview(nextReview: string): boolean {
  const reviewDate = new Date(nextReview)
  const now = new Date()
  return reviewDate <= now
}

/**
 * Get a human-readable description of the rating
 * @param rating Spaced repetition rating (0-5)
 * @returns Human-readable description
 */
export function getRatingDescription(rating: SpacedRepetitionRating): string {
  const descriptions = {
    0: "Complete blackout",
    1: "Incorrect with difficult recall",
    2: "Incorrect with easy recall",
    3: "Correct with difficult recall",
    4: "Correct with some hesitation",
    5: "Perfect recall",
  }
  return descriptions[rating]
}

/**
 * Get rating button styling based on rating value
 * @param rating Spaced repetition rating (0-5)
 * @returns Tailwind classes for styling
 */
export function getRatingButtonStyle(rating: SpacedRepetitionRating): string {
  const styles = {
    0: "bg-red-600 hover:bg-red-700 text-white",
    1: "bg-red-500 hover:bg-red-600 text-white",
    2: "bg-orange-500 hover:bg-orange-600 text-white",
    3: "bg-yellow-500 hover:bg-yellow-600 text-white",
    4: "bg-green-500 hover:bg-green-600 text-white",
    5: "bg-green-600 hover:bg-green-700 text-white",
  }
  return styles[rating]
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

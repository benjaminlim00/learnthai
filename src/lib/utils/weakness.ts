import { ErrorType, Weakness } from "@/types/pronunciation"

export const getErrorRate = (weakness: Weakness) => {
  return (weakness.failed_attempts / weakness.total_attempts) * 100
}

export const generateErrorLabel = (error: ErrorType): string => {
  switch (error) {
    case "tone_error":
      return "Tone Issue"
    case "vowel_length":
      return "Vowel Length"
    case "vowel_mispronunciation":
      return "Vowel Pronunciation"
    case "aspiration":
      return "Aspiration"
    case "consonant_error":
      return "Consonant Error"
    case "final_consonant":
      return "Final Consonant"
    case "rhythm_timing":
      return "Rhythm & Timing"
    case "stress_pattern":
      return "Stress Pattern"
    case "word_boundary":
      return "Word Boundary"
    case "overall_fluency":
      return "Fluency"
    default:
      return "Pronunciation Issue"
  }
}
export const generateErrorDescription = (error: ErrorType): string => {
  switch (error) {
    case "tone_error":
      return "The tone was incorrect. Try matching the pitch more closely."
    case "vowel_length":
      return "The vowel length was incorrect. Watch for short vs. long vowels."
    case "vowel_mispronunciation":
      return "The vowel sound was mispronounced. Try to mimic the correct mouth shape and sound."
    case "aspiration":
      return "Aspiration was off. Pay attention to the breathiness of certain consonants."
    case "consonant_error":
      return "There was a consonant mispronunciation. Try to clearly articulate the consonant sounds."
    case "final_consonant":
      return "The final consonant was not pronounced correctly or was missing."
    case "rhythm_timing":
      return "Your speech rhythm or timing was off. Try to follow the natural pacing of native speech."
    case "stress_pattern":
      return "The word stress was incorrect. Emphasize the right syllables."
    case "word_boundary":
      return "Words were not separated or connected clearly. Watch your word boundaries."
    case "overall_fluency":
      return "Your overall fluency needs improvement. Try to speak more smoothly and naturally."
    default:
      return "There was a pronunciation issue. Please try again."
  }
}

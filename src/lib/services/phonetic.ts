import { ThaiTone } from "@/types/pronunciation"

// Thai phonetic complexity scoring
export const THAI_PHONETIC_WEIGHTS = {
  // Tone errors are most critical in Thai
  tone_error: 25,
  // Vowel length distinctions are crucial
  vowel_length: 20,
  vowel_mispronunciation: 15,
  // Consonant clusters and aspirations
  consonant_error: 15,
  aspiration: 12,
  // Final consonants often dropped by English speakers
  final_consonant: 18,
  // Prosodic features
  rhythm_timing: 10,
  stress_pattern: 8,
  word_boundary: 8,
  overall_fluency: 5,
}

// Thai tone difficulty levels (some tones harder for English speakers)
export const TONE_DIFFICULTY: Record<ThaiTone, number> = {
  mid: 1.0, // Easiest - similar to English neutral tone
  low: 1.2, // Slightly harder
  high: 1.3, // Higher pitch can be challenging
  falling: 1.5, // Most similar to English intonation
  rising: 1.8, // Hardest - not common in English
}

// Common Thai sound patterns that cause difficulty
export const CHALLENGING_PATTERNS = {
  // Aspirated consonants
  คh: 1.5,
  ผh: 1.5,
  ทh: 1.5,
  ปh: 1.5,
  // Tone combinations in common words
  มาล: 1.3, // falling-high combination
  ไก่: 1.4, // tone + length
  // Clustered consonants
  กร: 1.2,
  ปล: 1.2,
  ตร: 1.3,
  // Final consonant patterns
  ก์: 1.4,
  น์: 1.2,
  ม์: 1.3,
}

// Enhanced Thai linguistic analysis
const ENHANCED_THAI_PATTERNS = {
  // Advanced consonant clusters
  INITIAL_CLUSTERS: [
    "กร",
    "กล",
    "กว",
    "ขร",
    "ขล",
    "ขว",
    "คร",
    "คล",
    "คว",
    "ปร",
    "ปล",
    "ผล",
    "พร",
    "พล",
    "ตร",
    "ทร",
    "สร",
    "สล",
    "สว",
    "หร",
    "หล",
    "หว",
    "หน",
    "หม",
    "หย",
    "หง",
  ],

  // Vowel patterns with difficulty weights
  VOWEL_PATTERNS: {
    อา: { length: "long", difficulty: 1.0 },
    อะ: { length: "short", difficulty: 1.2 },
    เอ: { length: "long", difficulty: 1.1 },
    แอ: { length: "long", difficulty: 1.3 },
    โอ: { length: "long", difficulty: 1.0 },
    อุ: { length: "short", difficulty: 1.2 },
    อู: { length: "long", difficulty: 1.0 },
    เอา: { length: "long", difficulty: 1.4 },
    ไอ: { length: "long", difficulty: 1.3 },
    ใอ: { length: "long", difficulty: 1.3 },
    เอีย: { length: "long", difficulty: 1.5 },
    เอือ: { length: "long", difficulty: 1.6 },
    อำ: { length: "short", difficulty: 1.2 },
  },

  // Tone markers and their contexts
  TONE_MARKERS: {
    "่": "mai_ek",
    "้": "mai_tho",
    "๊": "mai_tri",
    "๋": "mai_chattawa",
  },

  // Final consonant types
  FINAL_CONSONANTS: {
    SONORANT: ["ม", "น", "ง", "ญ", "ย", "ว", "ล", "ร"],
    STOPS: ["ก", "บ", "ด", "จ", "ช"],
    ASPIRATED_STOPS: ["ค", "ผ", "ถ", "ฉ", "ส"],
  },
}

interface SyllableData {
  syllable: string
  initialConsonant: string
  vowel: string
  finalConsonant?: string
  toneMarker?: string
  difficulty: number
}

/**
 * Enhanced syllable segmentation using Thai orthographic rules
 */
function enhancedSyllableSegmentation(text: string): SyllableData[] {
  const syllables: SyllableData[] = []

  let i = 0
  while (i < text.length) {
    const syllableData = extractSyllableData(text, i)
    if (syllableData) {
      syllables.push(syllableData)
      i += syllableData.syllable.length
    } else {
      i++
    }
  }

  return syllables
}

/**
 * Extract detailed syllable information
 */
function extractSyllableData(
  text: string,
  startIndex: number
): SyllableData | null {
  // TODO: Implement comprehensive Thai syllable parsing
  // This is a simplified version - production would use proper Thai NLP

  const remaining = text.slice(startIndex)
  if (remaining.length === 0) return null

  // Basic syllable detection (enhanced)
  let syllableEnd = 1

  // Look for vowel patterns
  for (const [vowelPattern] of Object.entries(
    ENHANCED_THAI_PATTERNS.VOWEL_PATTERNS
  )) {
    if (remaining.includes(vowelPattern)) {
      syllableEnd = Math.max(
        syllableEnd,
        remaining.indexOf(vowelPattern) + vowelPattern.length
      )
    }
  }

  // Look for tone markers
  for (let j = 1; j < remaining.length && j <= 4; j++) {
    if (
      Object.keys(ENHANCED_THAI_PATTERNS.TONE_MARKERS).includes(remaining[j])
    ) {
      syllableEnd = Math.max(syllableEnd, j + 1)
    }
  }

  const syllable = remaining.slice(0, syllableEnd)

  return {
    syllable,
    initialConsonant: syllable[0] || "",
    vowel: extractVowelFromSyllable(syllable),
    finalConsonant: extractFinalConsonant(syllable),
    toneMarker: extractToneMarker(syllable),
    difficulty: calculateSyllableDifficulty(syllable),
  }
}

/**
 * Implement proper tone detection from Thai text using linguistic rules
 */
export function getExpectedTone(text: string): ThaiTone[] {
  const tones: ThaiTone[] = []
  const syllables = enhancedSyllableSegmentation(text)

  syllables.forEach((syllable) => {
    const tone = enhancedToneDetection(syllable)
    tones.push(tone)
  })

  return tones
}

/**
 * Calculate syllable-level difficulty
 */
function calculateSyllableDifficulty(syllable: string): number {
  let difficulty = 1.0

  // Check for complex vowel patterns
  for (const [pattern, data] of Object.entries(
    ENHANCED_THAI_PATTERNS.VOWEL_PATTERNS
  )) {
    if (syllable.includes(pattern)) {
      difficulty *= data.difficulty
      break
    }
  }

  // Check for consonant clusters
  for (const cluster of ENHANCED_THAI_PATTERNS.INITIAL_CLUSTERS) {
    if (syllable.startsWith(cluster)) {
      difficulty *= 1.3
      break
    }
  }

  // Check for tone markers
  if (
    Object.keys(ENHANCED_THAI_PATTERNS.TONE_MARKERS).some((marker) =>
      syllable.includes(marker)
    )
  ) {
    difficulty *= 1.2
  }

  return Math.min(2.5, difficulty) // Cap difficulty
}

/**
 * Enhanced tone detection with context analysis
 */
function enhancedToneDetection(syllableData: SyllableData): ThaiTone {
  const { initialConsonant, vowel, finalConsonant, toneMarker } = syllableData

  // If tone marker present, apply marker rules with consonant class
  if (toneMarker) {
    const consonantClass = getConsonantClass(initialConsonant)
    return applyToneMarkerRules(toneMarker, consonantClass)
  }

  // Apply live/dead syllable rules
  const consonantClass = getConsonantClass(initialConsonant)
  const isLiveSyllable = isLiveSyllableCheck(vowel, finalConsonant)

  return applyDeadLiveRules(consonantClass, isLiveSyllable)
}

/**
 * Apply tone marker rules with consonant class context
 */
function applyToneMarkerRules(
  toneMarker: string,
  consonantClass: "low" | "mid" | "high"
): ThaiTone {
  const rules = {
    "่": {
      // mai ek
      low: "falling" as ThaiTone,
      mid: "low" as ThaiTone,
      high: "low" as ThaiTone,
    },
    "้": {
      // mai tho
      low: "high" as ThaiTone,
      mid: "falling" as ThaiTone,
      high: "falling" as ThaiTone,
    },
    "๊": {
      // mai tri
      low: "high" as ThaiTone,
      mid: "high" as ThaiTone,
      high: "high" as ThaiTone,
    },
    "๋": {
      // mai chattawa
      low: "rising" as ThaiTone,
      mid: "rising" as ThaiTone,
      high: "rising" as ThaiTone,
    },
  }

  return rules[toneMarker as keyof typeof rules]?.[consonantClass] || "mid"
}

/**
 * Determine if syllable is live (ends in long vowel or sonorant)
 */
function isLiveSyllableCheck(vowel: string, finalConsonant?: string): boolean {
  // Check if vowel is long
  const vowelData =
    ENHANCED_THAI_PATTERNS.VOWEL_PATTERNS[
      vowel as keyof typeof ENHANCED_THAI_PATTERNS.VOWEL_PATTERNS
    ]
  if (vowelData?.length === "long") return true

  // Check if final consonant is sonorant
  if (
    finalConsonant &&
    ENHANCED_THAI_PATTERNS.FINAL_CONSONANTS.SONORANT.includes(finalConsonant)
  ) {
    return true
  }

  return false
}

/**
 * Apply dead/live syllable tone rules
 */
function applyDeadLiveRules(
  consonantClass: "low" | "mid" | "high",
  isLive: boolean
): ThaiTone {
  if (isLive) {
    switch (consonantClass) {
      case "low":
        return "mid"
      case "mid":
        return "mid"
      case "high":
        return "rising"
    }
  } else {
    switch (consonantClass) {
      case "low":
        return "falling"
      case "mid":
        return "low"
      case "high":
        return "low"
    }
  }
  return "mid" // fallback
}

/**
 * Infer actual tones from mistake description
 */
export function inferTonesFromMistake(
  mistake: string,
  expectedTones: ThaiTone[]
): ThaiTone[] {
  const mistakeLower = mistake.toLowerCase()

  if (mistakeLower.includes("falling")) return ["falling"]
  if (mistakeLower.includes("rising")) return ["rising"]
  if (mistakeLower.includes("high")) return ["high"]
  if (mistakeLower.includes("low")) return ["low"]
  if (mistakeLower.includes("mid")) return ["mid"]

  // TODO: If no specific tone mentioned, return empty array to indicate uncertainty
  // Could potentially return expectedTones in future for better inference
  // Current implementation is basic - need more sophisticated tone inference
  void expectedTones // Mark as intentionally unused for now
  return []
}

/**
 * Extract vowel pattern from syllable
 */
function extractVowelFromSyllable(syllable: string): string {
  // Look for vowel patterns in order of complexity (longest first)
  const vowelPatterns = Object.keys(ENHANCED_THAI_PATTERNS.VOWEL_PATTERNS).sort(
    (a, b) => b.length - a.length
  )

  for (const pattern of vowelPatterns) {
    if (syllable.includes(pattern)) {
      return pattern
    }
  }

  // Fallback to single character vowels
  const singleVowels = [
    "า",
    "ะ",
    "ิ",
    "ี",
    "ึ",
    "ื",
    "ุ",
    "ู",
    "เ",
    "แ",
    "โ",
    "ใ",
    "ไ",
    "ำ",
  ]
  for (const vowel of singleVowels) {
    if (syllable.includes(vowel)) {
      return vowel
    }
  }

  return "อ" // default vowel
}

/**
 * Extract final consonant from syllable
 */
function extractFinalConsonant(syllable: string): string | undefined {
  const finalChar = syllable[syllable.length - 1]

  // Check if last character is a consonant
  const allConsonants = [
    ...ENHANCED_THAI_PATTERNS.FINAL_CONSONANTS.SONORANT,
    ...ENHANCED_THAI_PATTERNS.FINAL_CONSONANTS.STOPS,
    ...ENHANCED_THAI_PATTERNS.FINAL_CONSONANTS.ASPIRATED_STOPS,
  ]

  if (allConsonants.includes(finalChar)) {
    return finalChar
  }

  return undefined
}

/**
 * Extract tone marker from syllable
 */
function extractToneMarker(syllable: string): string | undefined {
  for (const marker of Object.keys(ENHANCED_THAI_PATTERNS.TONE_MARKERS)) {
    if (syllable.includes(marker)) {
      return marker
    }
  }
  return undefined
}

/**
 * Get consonant class for tone rules (enhanced version)
 */
function getConsonantClass(consonant: string): "low" | "mid" | "high" {
  const lowClass = "คฆงชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ"
  const highClass = "ขฃฉฐถผฝศษสห"
  const midClass = "กจฎฏดตบปอ"

  if (lowClass.includes(consonant)) return "low"
  if (highClass.includes(consonant)) return "high"
  if (midClass.includes(consonant)) return "mid"

  return "mid" // default
}

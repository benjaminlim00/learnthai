import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import OpenAI from "openai"
import { ThaiScoringService } from "@/lib/services/thai-scoring"
import {
  pronunciationFeedbackSchema,
  PronunciationFeedback,
} from "@/lib/validation"
import {
  ContentType,
  ErrorType,
  PronunciationSession,
} from "@/types/pronunciation"
import { CategorizedError } from "@/types/scoring"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

//TODO: we need to rate limit

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Note: User's recorded audio is processed but NEVER cached or stored permanently
    // Only reference pronunciations (correct audio) are cached via the TTS API
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const targetThai = formData.get("targetThai") as string
    const targetRomanization = formData.get("targetRomanization") as string
    const targetTranslation = formData.get("targetTranslation") as string
    const contentType = formData.get("contentType") as string
    // optional
    const vocabularyId = formData.get("vocabularyId") as string

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      )
    }

    if (!targetThai || !targetRomanization || !targetTranslation) {
      return NextResponse.json(
        { error: "Target sentence data is required" },
        { status: 400 }
      )
    }

    // Convert audio file to transcription using Whisper
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "gpt-4o-mini-transcribe",
      language: "th", // Thai language
    })

    const transcribedText = transcriptionResponse.text

    // Generate pronunciation feedback using GPT-4 with enhanced Thai-specific prompting
    const feedbackResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert Thai pronunciation tutor with deep knowledge of Thai phonetics, tones, and common pronunciation challenges for English speakers.

Thai Language Context:
- Thai has 5 tones: mid (สามัญ), low (เอก), falling (โท), high (ตรี), rising (จัตวา)
- Tone accuracy is critical - wrong tones change word meanings completely
- Vowel length distinctions are phonemic (short vs long vowels)
- Aspiration is phonemic for stops (ป vs ผ, ต vs ถ, ก vs ค)
- Final consonants are often unreleased but present
- English speakers commonly struggle with: tone production, vowel length, unreleased finals, aspiration

Analyze the pronunciation and provide structured feedback focusing on:
1. Tone accuracy - most critical aspect of Thai pronunciation
2. Vowel length and quality - distinguish อา vs อะ, เอ vs แอ
3. Consonant accuracy - aspiration, place of articulation
4. Final consonant realization - unreleased but audible
5. Rhythm and syllable timing
6. Overall intelligibility

Respond in JSON format with:
{
  "transcribed": "exactly what the user said",
  "mistakes": ["specific error 1", "specific error 2", "specific error 3"],
  "tip": "one focused, actionable improvement tip",
  "corrected": {
    "thai": "correct Thai text if needed",
    "romanization": "correct romanization if needed", 
    "translation": "correct translation if needed"
  }
}

Be encouraging but precise. If pronunciation is excellent, return empty mistakes array.`,
        },
        {
          role: "user",
          content: `User said: "${transcribedText}"
Target: "${targetThai}" (${targetRomanization}) - "${targetTranslation}"
Practice mode: ${contentType || "sentence"}

Please analyze the pronunciation accuracy with focus on Thai phonetic features.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent analysis
    })

    const feedbackContent = feedbackResponse.choices[0]?.message?.content
    if (!feedbackContent) {
      throw new Error("No feedback generated")
    }

    const rawFeedback = JSON.parse(feedbackContent)

    // Validate the feedback response
    const validationResult = pronunciationFeedbackSchema.safeParse(rawFeedback)
    if (!validationResult.success) {
      console.error("Feedback validation error:", validationResult.error)
      return NextResponse.json(
        { error: "Invalid feedback format from AI model" },
        { status: 500 }
      )
    }

    const categorizedErrors: CategorizedError[] =
      ThaiScoringService.enhanceErrors(
        validationResult.data.mistakes || [],
        targetThai
      )

    // Create enhanced feedback with categorized errors
    const enhancedFeedback = {
      transcribed: validationResult.data.transcribed,
      mistakes: validationResult.data.mistakes,
      tip: validationResult.data.tip,
      corrected: validationResult.data.corrected,
      categorized_errors: categorizedErrors,
    }

    const { score } = ThaiScoringService.calculateScore(
      enhancedFeedback as PronunciationFeedback,
      targetThai,
      contentType as ContentType
    )

    // Store pronunciation session data
    try {
      const sessionData: PronunciationSession = {
        user_id: user.id,
        content: targetThai,
        content_type: contentType as ContentType,
        errors: enhancedFeedback.mistakes as ErrorType[],
        score: score,
        created_at: new Date().toISOString(),
      }

      const { error: insertError } = await supabase
        .from("pronunciation_sessions")
        .insert(sessionData)

      if (insertError) {
        console.error("Error storing pronunciation session:", insertError)
        // Don't fail the request if storage fails - user still gets feedback
      } else {
        console.log("Pronunciation session stored successfully")
      }
    } catch (storageError) {
      console.error("Error storing pronunciation session:", storageError)
      // Continue without failing - user experience comes first
    }

    // Return enhanced feedback with calculated score
    return NextResponse.json({
      ...enhancedFeedback,
      score: score,
    } as PronunciationFeedback)
  } catch (error) {
    console.error("Speech feedback error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to process speech: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

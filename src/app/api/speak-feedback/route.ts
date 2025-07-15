import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Note: User's recorded audio is processed but NEVER cached or stored permanently
    // Only reference pronunciations (correct audio) are cached via the TTS API
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const targetThai = formData.get("targetThai") as string
    const targetRomanization = formData.get("targetRomanization") as string
    const targetTranslation = formData.get("targetTranslation") as string

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

    // Generate pronunciation feedback using GPT-4
    const feedbackResponse = await openai.chat.completions.create({
      // we use this prompt to compare what the user said vs the actual vocabulary
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a Thai pronunciation tutor. You will receive:
1. What the user said (transcribed from audio)
2. What they were supposed to say (target sentence)

Analyze the pronunciation and provide structured feedback focusing on:
- Tone accuracy (Thai has 5 tones: mid, low, falling, high, rising)
- Word pronunciation errors
- Common mistakes for English speakers learning Thai

Respond in JSON format with:
{
  "transcribed": "user's transcribed text",
  "mistakes": ["specific error 1", "specific error 2"],
  "tip": "brief helpful tip for improvement",
  "corrected": {
    "thai": "correct Thai text",
    "romanization": "correct romanization",
    "translation": "correct translation"
  }
}

If pronunciation is perfect, return empty mistakes array.`,
        },
        {
          role: "user",
          content: `User said: "${transcribedText}"
Target sentence: "${targetThai}" (${targetRomanization}) - ${targetTranslation}

Please analyze the pronunciation and provide feedback.`,
        },
      ],
      response_format: { type: "json_object" },
    })

    const feedbackContent = feedbackResponse.choices[0]?.message?.content
    if (!feedbackContent) {
      throw new Error("No feedback generated")
    }

    const feedback = JSON.parse(feedbackContent)

    return NextResponse.json(feedback)
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

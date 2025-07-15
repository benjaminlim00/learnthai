import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import {
  generateAudioHash,
  getCachedAudio,
  cacheAudio,
  getAudioFromStorage,
} from "@/lib/audio-cache"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      audioType = "reference",
      contentType = "word",
    } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Validate audioType
    if (audioType !== "reference" && audioType !== "user") {
      return NextResponse.json(
        {
          error: "audioType must be 'reference' or 'user'",
        },
        { status: 400 }
      )
    }

    // Validate contentType
    if (contentType !== "word" && contentType !== "sentence") {
      return NextResponse.json(
        {
          error: "contentType must be 'word' or 'sentence'",
        },
        { status: 400 }
      )
    }

    // TTS configuration (constants)
    const model = "gpt-4o-mini-tts"
    const voice = "nova"
    const speed = 0.8

    // Only cache reference audio (words and sentences), not user transcriptions
    let cachedAudio = null
    let textHash = ""

    if (audioType === "reference") {
      // Generate hash for caching (includes contentType for proper separation)
      textHash = generateAudioHash(text, model, voice, speed, contentType)

      // Check if audio is already cached
      cachedAudio = await getCachedAudio(textHash)

      if (cachedAudio) {
        console.log(
          `Serving cached reference ${contentType} audio for text:`,
          text.substring(0, 50)
        )

        // Get audio from storage
        const audioBuffer = await getAudioFromStorage(cachedAudio.storage_path)

        if (audioBuffer) {
          return new NextResponse(audioBuffer, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": audioBuffer.byteLength.toString(),
              "X-Audio-Source": "cache",
              "X-Audio-Type": audioType,
              "X-Content-Type": contentType,
            },
          })
        }

        // If cached file is missing, continue to generate new one
        console.warn(
          `Cached reference ${contentType} audio file missing, generating new one`
        )
      }
    } else {
      console.log(
        `Generating user transcription ${contentType} audio (no cache):`,
        text.substring(0, 50)
      )
    }

    // Generate new speech using OpenAI TTS
    console.log(
      `Generating new TTS ${contentType} audio (${audioType}) for text:`,
      text.substring(0, 50)
    )
    const mp3Response = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      speed,
    })

    // Convert the response to an ArrayBuffer
    const arrayBuffer = await mp3Response.arrayBuffer()

    // Cache reference audio (both words and sentences), but not user transcriptions
    if (audioType === "reference") {
      cacheAudio(textHash, text, voice, arrayBuffer)
        .then((cached) => {
          if (cached) {
            console.log(
              `Successfully cached reference ${contentType} audio with ID:`,
              cached.id
            )
          }
        })
        .catch((error) => {
          console.error(
            `Failed to cache reference ${contentType} audio:`,
            error
          )
        })
    }

    // Return the audio data
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": arrayBuffer.byteLength.toString(),
        "X-Audio-Source": "generated",
        "X-Audio-Type": audioType,
        "X-Content-Type": contentType,
      },
    })
  } catch (error) {
    console.error("TTS error:", error)

    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    )
  }
}

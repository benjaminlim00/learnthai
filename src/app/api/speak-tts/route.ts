import { NextRequest, NextResponse } from "next/server"
import * as sdk from "microsoft-cognitiveservices-speech-sdk"
import {
  generateAudioHash,
  getCachedAudio,
  cacheAudio,
  getAudioFromStorage,
} from "@/lib/audio-cache"
import { env } from "@/lib/env"
import { getThaiVoiceFromSpeakerPreference } from "@/lib/voice-utils"

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

    // Azure Speech Service configuration
    const speechKey = env.AZURE_SPEECH_KEY
    const speechRegion = env.AZURE_SPEECH_REGION

    if (!speechKey || !speechRegion) {
      return NextResponse.json(
        { error: "Azure Speech Service configuration missing" },
        { status: 500 }
      )
    }

    // Get user session for voice selection
    const { createServerSupabaseClient } = await import("@/lib/supabase")
    const supabase = await createServerSupabaseClient(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Get user's voice based on speaker preference
    let voice = "th-TH-PremwadeeNeural" // Default to female voice

    if (user && !authError) {
      try {
        const { data: profileData, error: profileError } = await supabase.rpc(
          "get_or_create_user_profile",
          {
            user_uuid: user.id,
          }
        )

        if (!profileError && profileData && profileData.length > 0) {
          const speakerPreference = profileData[0].speaker_preference
          voice = getThaiVoiceFromSpeakerPreference(speakerPreference)
        }
      } catch (error) {
        console.error("Error fetching user profile for voice selection:", error)
        // Continue with default voice if profile fetch fails
      }
    }

    const speed = 0.8 // 20% slower for better pronunciation learning

    // Only cache reference audio (words and sentences), not user transcriptions
    let cachedAudio = null
    let textHash = ""

    if (audioType === "reference") {
      // Generate hash for caching (includes contentType for proper separation)
      textHash = generateAudioHash(
        text,
        "azure-speech",
        voice,
        speed,
        contentType
      )

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
              "Content-Type": "audio/wav",
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

    // Generate new speech using Azure Speech Service
    console.log(
      `Generating new Azure TTS ${contentType} audio (${audioType}) for text:`,
      text.substring(0, 50)
    )

    // Configure Azure Speech Service
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      speechKey,
      speechRegion
    )
    speechConfig.speechSynthesisVoiceName = voice
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

    // Create SSML with speed control
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="th-TH">
        <voice name="${voice}">
          <prosody rate="${speed.toString()}">${text}</prosody>
        </voice>
      </speak>
    `

    // Create synthesizer
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig)

    // Synthesize speech
    const audioBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(result.audioData)
          } else {
            reject(new Error(`Speech synthesis failed: ${result.errorDetails}`))
          }
          synthesizer.close()
        },
        (error) => {
          synthesizer.close()
          reject(error)
        }
      )
    })

    // Cache reference audio (both words and sentences), but not user transcriptions
    if (audioType === "reference") {
      cacheAudio(textHash, text, voice, audioBuffer)
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
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "X-Audio-Source": "generated",
        "X-Audio-Type": audioType,
        "X-Content-Type": contentType,
      },
    })
  } catch (error) {
    console.error("Azure TTS error:", error)

    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    )
  }
}

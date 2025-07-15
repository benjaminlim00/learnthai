import { createHash } from "crypto"
import { supabase } from "@/lib/supabase"
import type { CachedAudio } from "@/types/database"

/**
 * Generate a unique hash for TTS parameters to use as cache key
 */
export function generateAudioHash(
  text: string,
  model: string,
  voice: string,
  speed: number,
  contentType?: string
): string {
  const combined = contentType
    ? `${text}|${model}|${voice}|${speed}|${contentType}`
    : `${text}|${model}|${voice}|${speed}`
  return createHash("sha256").update(combined).digest("hex")
}

/**
 * Check if audio is already cached in the database
 */
export async function getCachedAudio(
  textHash: string
): Promise<CachedAudio | null> {
  const { data, error } = await supabase
    .from("cached_audio")
    .select("*")
    .eq("text_hash", textHash)
    .single()

  if (error || !data) {
    return null
  }

  return data as CachedAudio
}

/**
 * Store audio file in Supabase Storage and create database record
 */
export async function cacheAudio(
  textHash: string,
  textContent: string,
  voice: string,
  audioBuffer: ArrayBuffer
): Promise<CachedAudio | null> {
  try {
    // Generate unique filename
    const fileName = `tts/${textHash}.mp3`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio-cache")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      })

    if (uploadError) {
      console.error("Failed to upload audio to storage:", uploadError)
      return null
    }

    // Create database record
    const audioRecord: Omit<CachedAudio, "id" | "created_at"> = {
      text_hash: textHash,
      text_content: textContent,
      voice_name: voice,
      storage_path: uploadData.path,
      file_size: audioBuffer.byteLength,
    }

    const { data, error } = await supabase
      .from("cached_audio")
      .insert(audioRecord)
      .select()
      .single()

    if (error) {
      console.error("Failed to create audio cache record:", error)
      return null
    }

    return data as CachedAudio
  } catch (error) {
    console.error("Error caching audio:", error)
    return null
  }
}

/**
 * Get audio file from Supabase Storage
 */
export async function getAudioFromStorage(
  storagePath: string
): Promise<ArrayBuffer | null> {
  try {
    const { data, error } = await supabase.storage
      .from("audio-cache")
      .download(storagePath)

    if (error || !data) {
      console.error("Failed to download audio from storage:", error)
      return null
    }

    return await data.arrayBuffer()
  } catch (error) {
    console.error("Error downloading audio:", error)
    return null
  }
}

/**
 * Clean up old cached audio files (optional maintenance function)
 * Remove files older than specified days
 */
export async function cleanupOldCache(
  olderThanDays: number = 30
): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  try {
    // Get old records
    const { data: oldRecords, error: fetchError } = await supabase
      .from("cached_audio")
      .select("id, storage_path")
      .lt("created_at", cutoffDate.toISOString())

    if (fetchError || !oldRecords?.length) {
      return
    }

    // Delete from storage
    const filePaths = oldRecords.map(
      (record: { storage_path: string }) => record.storage_path
    )
    await supabase.storage.from("audio-cache").remove(filePaths)

    // Delete from database
    const ids = oldRecords.map((record: { id: string }) => record.id)
    await supabase.from("cached_audio").delete().in("id", ids)

    console.log(`Cleaned up ${oldRecords.length} old audio files`)
  } catch (error) {
    console.error("Error cleaning up old cache:", error)
  }
}

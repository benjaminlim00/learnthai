"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"

interface AudioButtonProps {
  text: string
  contentType: "word" | "sentence"
  size?: "sm" | "default" | "lg" | "icon"
  variant?: "ghost" | "outline" | "default"
  className?: string
}

export function AudioButton({
  text,
  contentType,
  size = "sm",
  variant = "ghost",
  className = "",
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(false)

  const playAudio = async () => {
    if (isPlaying || !text.trim()) return

    setIsPlaying(true)
    setError(false)

    try {
      const response = await fetch("/api/speak-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          audioType: "reference",
          contentType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate speech")
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setIsPlaying(false)
        setError(true)
        URL.revokeObjectURL(audioUrl)
        console.error("Audio playback error")
      }

      await audio.play()
    } catch (err) {
      setIsPlaying(false)
      setError(true)
      console.error("TTS error:", err)
    }
  }

  const iconSize =
    size === "sm" || size === "icon"
      ? "h-3 w-3"
      : size === "default"
      ? "h-4 w-4"
      : "h-5 w-5"

  return (
    <Button
      variant={variant}
      size={size}
      onClick={playAudio}
      disabled={isPlaying || !text.trim()}
      className={`${className} ${size === "sm" ? "h-6 w-6 p-0" : ""}`}
      title={
        isPlaying
          ? "Playing..."
          : error
          ? "Audio error - click to retry"
          : "Listen to pronunciation"
      }
    >
      {error ? (
        <VolumeX className={`${iconSize} text-muted-foreground`} />
      ) : (
        <Volume2
          className={`${iconSize} ${
            isPlaying
              ? "animate-pulse text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        />
      )}
    </Button>
  )
}

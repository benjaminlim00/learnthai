"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Square } from "lucide-react"

interface RecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  isProcessing: boolean
}

export function Recorder({ onRecordingComplete, isProcessing }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check for microphone permissions
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        setHasPermission(true)
        stream.getTracks().forEach((track) => track.stop()) // Stop the test stream
      } catch (err) {
        setHasPermission(false)
        setError("Microphone access is required for pronunciation practice")
        console.error("Microphone permission error:", err)
      }
    }

    checkPermissions()
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        onRecordingComplete(audioBlob)

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setError(null)

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      setError(
        "Failed to start recording. Please check microphone permissions."
      )
      console.error("Recording error:", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (hasPermission === null) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Checking microphone permissions...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasPermission === false) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <MicOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {error ||
                "Microphone access is required for pronunciation practice"}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {isRecording ? (
            <>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-mono">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <p className="text-muted-foreground">
                Recording... Speak the sentence clearly
              </p>
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="w-full"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            </>
          ) : (
            <>
              <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Click the button below to start recording your pronunciation
              </p>
              <Button
                onClick={startRecording}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                <Mic className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : "Record & Analyze"}
              </Button>
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Square } from "lucide-react"
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk"
import {
  ResultReason,
  SpeechRecognitionEventArgs,
} from "microsoft-cognitiveservices-speech-sdk"

interface RecorderProps {
  onRecordingComplete: (text: string) => void
  isProcessing: boolean
}

const AUTO_STOP_RECORDING_TIME = 15000

export function Recorder({ onRecordingComplete, isProcessing }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recognizedText, setRecognizedText] = useState<string>("")

  const recognizerRef = useRef<speechsdk.SpeechRecognizer | null>(null)
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

    // Cleanup on unmount
    return () => {
      stopRecording()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getTokenOrRefresh = async () => {
    try {
      const response = await fetch("/api/azure-speech-token")
      if (!response.ok) {
        throw new Error(`Token request failed with status ${response.status}`)
      }
      const data = await response.json()
      return { authToken: data.token, region: data.region }
    } catch (err) {
      console.error("Error fetching token:", err)
      throw new Error("Failed to get speech token")
    }
  }

  const startRecording = async () => {
    try {
      // Auto-stop after 15 seconds
      setTimeout(() => {
        stopRecording()
      }, AUTO_STOP_RECORDING_TIME)

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      setIsRecording(true)
      setRecordingTime(0)
      setError(null)
      setRecognizedText("")

      const tokenObj = await getTokenOrRefresh()
      const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
        tokenObj.authToken,
        tokenObj.region
      )
      speechConfig.speechRecognitionLanguage = "th-TH"
      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput()
      const recognizer = new speechsdk.SpeechRecognizer(
        speechConfig,
        audioConfig
      )
      recognizerRef.current = recognizer
      recognizer.startContinuousRecognitionAsync()

      const processRecognized = async (event: SpeechRecognitionEventArgs) => {
        const result = event.result
        if (result.reason === ResultReason.RecognizedSpeech) {
          const text = (result as unknown as { privText: string }).privText
          setRecognizedText(text)
          // setRecognizedText("");
          // await slowType(text);
        }
      }

      const processRecognizing = async (event: SpeechRecognitionEventArgs) => {
        const result = event.result
        if (result.reason === ResultReason.RecognizingSpeech) {
          const text = (result as unknown as { privText: string }).privText
          setRecognizedText(text)
        }
      }

      recognizer.recognized = (s, e) => processRecognized(e)
      recognizer.recognizing = (s, e) => processRecognizing(e)
    } catch (err) {
      setIsRecording(false)
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to start recording. Please check microphone permissions."
      setError(errorMessage)
    }
  }

  const stopRecording = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          if (recognizedText) {
            onRecordingComplete(recognizedText)
          } else {
            setError("No speech detected. Please try again.")
          }
          setIsRecording(false)
        },
        (err) => {
          console.error("Error stopping recognition:", err)
          setError("Error stopping recording.")
          setIsRecording(false)
        }
      )

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
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Checking microphone permissions...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (hasPermission === false) {
    return (
      <Card>
        <CardContent className="p-6">
          <section className="text-center">
            <MicOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {error ||
                "Microphone access is required for pronunciation practice"}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </section>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <section className="text-center space-y-4">
          {isRecording ? (
            <>
              <header className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <time className="text-lg font-mono">
                  {formatTime(recordingTime)}
                </time>
              </header>
              {recognizedText && (
                <p className="text-sm font-medium border p-2 rounded-md bg-muted">
                  {recognizedText}
                </p>
              )}
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
        </section>
      </CardContent>
    </Card>
  )
}

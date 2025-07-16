"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  Volume2,
  Play,
  Pause,
} from "lucide-react"
import { CorrectedData, PronunciationFeedback } from "@/lib/validation"
import { ContentType } from "@/types/pronunciation"

interface FeedbackCardProps {
  feedback: PronunciationFeedback
  targetSentence: CorrectedData
  contentType: ContentType
}

// Helper function to get badge variant and styling based on score
const getScoreBadgeProps = (score: number) => {
  if (score >= 85) {
    return {
      variant: "default" as const,
      className:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full",
    }
  } else if (score >= 70) {
    return {
      variant: "secondary" as const,
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full",
    }
  } else {
    return {
      variant: "destructive" as const,
      className:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full",
    }
  }
}

export function FeedbackCard({
  feedback,
  targetSentence,
  contentType,
}: FeedbackCardProps) {
  const hasNoMistakes = feedback.mistakes.length === 0
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false)
  const [isPlayingCorrectAudio, setIsPlayingCorrectAudio] = useState(false)

  const playUserAudio = async () => {
    if (isPlayingUserAudio) return

    setIsPlayingUserAudio(true)

    try {
      const response = await fetch("/api/speak-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: feedback.transcribed,
          audioType: "user",
          contentType: contentType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate speech for user transcription")
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => {
        setIsPlayingUserAudio(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setIsPlayingUserAudio(false)
        URL.revokeObjectURL(audioUrl)
        console.error("User transcription audio playback error")
      }

      await audio.play()
    } catch (err) {
      setIsPlayingUserAudio(false)
      console.error("TTS error for user transcription:", err)
    }
  }

  const playCorrectAudio = async () => {
    if (isPlayingCorrectAudio) return

    setIsPlayingCorrectAudio(true)

    try {
      const response = await fetch("/api/speak-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: targetSentence.thai,
          audioType: "reference",
          contentType: contentType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate speech")
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => {
        setIsPlayingCorrectAudio(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setIsPlayingCorrectAudio(false)
        URL.revokeObjectURL(audioUrl)
        console.error("Correct audio playback error")
      }

      await audio.play()
    } catch (err) {
      setIsPlayingCorrectAudio(false)
      console.error("TTS error:", err)
    }
  }

  return (
    <article className="space-y-4">
      {/* Main Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasNoMistakes ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-orange-500" />
            )}
            {hasNoMistakes
              ? "Perfect Pronunciation!"
              : "Pronunciation Analysis"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pronunciation Score */}
          <section className="mb-4 flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Pronunciation Score:
              </span>
              <Badge
                variant={getScoreBadgeProps(feedback.score).variant}
                className={`text-sm font-bold ${
                  getScoreBadgeProps(feedback.score).className
                }`}
              >
                {feedback.score}/100
              </Badge>
            </div>
            <aside className="text-right">
              <p className="text-xs text-muted-foreground">
                {feedback.score >= 85
                  ? "🌟 Excellent!"
                  : feedback.score >= 70
                  ? "👍 Good work!"
                  : "💪 Keep practicing!"}
              </p>
            </aside>
          </section>

          <section className="space-y-4">
            {/* Success Message */}
            {hasNoMistakes ? (
              <section className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  🎉 Excellent work! Your pronunciation is spot-on.
                </p>
                <p className="text-green-700 text-sm mt-1">
                  You said:{" "}
                  <span className="font-mono">{feedback.transcribed}</span>
                </p>
              </section>
            ) : (
              <>
                {/* What User Said */}
                <section className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    What you said:
                  </h3>
                  <p
                    className="text-lg font-medium rounded-lg p-3 border 
                    bg-orange-50 border-orange-200 text-orange-900
                    dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200
                  "
                  >
                    {feedback.transcribed}
                  </p>
                </section>

                {/* What Should Be Said */}
                <section className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Target pronunciation:
                  </h3>
                  <p
                    className="text-lg font-medium rounded-lg p-3 border 
                    bg-green-50 border-green-200 text-green-900
                    dark:bg-green-950 dark:border-green-800 dark:text-green-200
                  "
                  >
                    {targetSentence.thai}
                  </p>
                </section>
              </>
            )}

            {/* Audio Comparison */}
            {!hasNoMistakes && (
              <section className="bg-muted/50 rounded-lg p-4 space-y-3">
                <header className="font-medium text-sm flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Compare Audio
                </header>
                <nav className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={playUserAudio}
                    disabled={isPlayingUserAudio}
                    className={`flex items-center gap-2 ${
                      isPlayingUserAudio
                        ? "bg-orange-50 dark:bg-orange-950 border-orange-400 dark:border-orange-800 text-orange-900 dark:text-orange-200"
                        : ""
                    }`}
                  >
                    {isPlayingUserAudio ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Your Version
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={playCorrectAudio}
                    disabled={isPlayingCorrectAudio}
                    className={`flex items-center gap-2 ${
                      isPlayingCorrectAudio
                        ? "bg-green-50 dark:bg-green-950 border-green-400 dark:border-green-800 text-green-900 dark:text-green-200"
                        : ""
                    }`}
                  >
                    {isPlayingCorrectAudio ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Correct Version
                  </Button>
                </nav>
              </section>
            )}
          </section>
        </CardContent>
      </Card>

      {/* Detailed Feedback (only if there are mistakes) */}
      {!hasNoMistakes && (
        <>
          {/* Mistakes */}
          {feedback.mistakes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <XCircle className="w-5 h-5" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2" role="list">
                  {feedback.mistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          {feedback.tip && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Lightbulb className="w-5 h-5" />
                  Pronunciation Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{feedback.tip}</p>
              </CardContent>
            </Card>
          )}

          {/* Corrected Version */}
          {feedback.corrected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Corrected Version
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-lg font-medium">{feedback.corrected.thai}</p>
                {feedback.corrected.romanization && (
                  <p className="text-sm text-muted-foreground font-mono">
                    {feedback.corrected.romanization}
                  </p>
                )}
                {feedback.corrected.translation && (
                  <p className="text-sm text-muted-foreground">
                    {feedback.corrected.translation}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </article>
  )
}

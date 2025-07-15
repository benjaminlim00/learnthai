"use client"

import { useState, useEffect } from "react"

import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Recorder, FeedbackCard } from "@/components/speak"
import {
  Volume2,
  RefreshCw,
  BookOpen,
  Mic,
  ChevronRight,
  Check,
} from "lucide-react"
import { VocabularyWord } from "@/types/database"

interface FeedbackData {
  transcribed: string
  mistakes: string[]
  tip: string
  corrected: {
    thai: string
    romanization: string
    translation: string
  }
}

export default function SpeakPage() {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([])
  const [selectedVocab, setSelectedVocab] = useState<VocabularyWord | null>(
    null
  )
  const [practiceMode, setPracticeMode] = useState<"word" | "sentence">(
    "sentence"
  )
  const [isLoadingVocab, setIsLoadingVocab] = useState(true)
  const [currentStep, setCurrentStep] = useState<
    "select" | "practice" | "record" | "feedback"
  >("select")

  // Fetch user's vocabulary on component mount
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const response = await fetch("/api/vocabulary")
        if (response.ok) {
          const data = await response.json()
          setVocabulary(data.words || [])
          // Don't auto-select, let user choose
        } else {
          console.error("Failed to fetch vocabulary")
        }
      } catch (error) {
        console.error("Error fetching vocabulary:", error)
      } finally {
        setIsLoadingVocab(false)
      }
    }

    fetchVocabulary()
  }, [])

  // Update step when vocabulary is selected
  useEffect(() => {
    if (selectedVocab && currentStep === "select") {
      setCurrentStep("practice")
    }
  }, [selectedVocab, currentStep])

  // Get current practice content based on selected vocabulary and mode
  const getCurrentPractice = () => {
    if (!selectedVocab) {
      // Fallback to sample sentence if no vocabulary selected
      return {
        thai: "ฉันอยากกินข้าว",
        romanization: "chan yàak gin kâao",
        translation: "I want to eat rice",
      }
    }

    if (practiceMode === "word") {
      return {
        thai: selectedVocab.word,
        romanization: selectedVocab.word_romanization || "",
        translation: selectedVocab.translation,
      }
    } else {
      return {
        thai: selectedVocab.sentence,
        romanization: selectedVocab.sentence_romanization || "",
        translation: selectedVocab.sentence_translation || "",
      }
    }
  }

  const targetSentence = getCurrentPractice()

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setError(null)
    setFeedback(null)
    setCurrentStep("feedback")

    try {
      // Create FormData to send audio and target sentence
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")
      formData.append("targetThai", targetSentence.thai)
      formData.append("targetRomanization", targetSentence.romanization)
      formData.append("targetTranslation", targetSentence.translation)

      const response = await fetch("/api/speak-feedback", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze pronunciation")
      }

      const feedbackData = await response.json()
      setFeedback(feedbackData)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process recording"
      )
      console.error("Recording processing error:", err)
      setCurrentStep("record")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTryAgain = () => {
    setFeedback(null)
    setError(null)
    setCurrentStep("record")
  }

  const handleStartOver = () => {
    setFeedback(null)
    setError(null)
    setSelectedVocab(null)
    setCurrentStep("select")
  }

  const speakSentence = async () => {
    if (isPlayingAudio) return

    setIsPlayingAudio(true)

    try {
      const response = await fetch("/api/speak-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: targetSentence.thai,
          audioType: "reference",
          contentType: practiceMode,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate speech")
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
        console.error("Audio playback error")
      }

      await audio.play()
    } catch (err) {
      setIsPlayingAudio(false)
      console.error("TTS error:", err)

      // Fallback to browser TTS if API fails
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(targetSentence.thai)
        utterance.lang = "th-TH"
        utterance.rate = 0.8
        speechSynthesis.speak(utterance)
      }
    }
  }

  const steps = [
    {
      id: "select",
      label: "Choose Vocabulary",
      completed: !!selectedVocab && currentStep !== "select",
    },
    {
      id: "practice",
      label: "Listen & Practice",
      completed: currentStep === "record" || currentStep === "feedback",
    },
    {
      id: "record",
      label: "Record Yourself",
      completed: !!feedback,
    },
    {
      id: "feedback",
      label: "Get Feedback",
      completed: false,
    },
  ]

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mic className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Speaking Practice
            </h1>
          </div>
          <p className="text-muted-foreground">
            Practice your Thai pronunciation with AI-powered feedback
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                      step.completed
                        ? "bg-green-500 border-green-500 text-secondary"
                        : currentStep === step.id
                        ? "bg-primary text-secondary"
                        : "bg-muted border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {step.completed ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span
                    className={`text-xs mt-1 text-center max-w-16 ${
                      currentStep === step.id
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1: Vocabulary Selection */}
          {currentStep === "select" && (
            <>
              {isLoadingVocab ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        Loading your vocabulary...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : vocabulary.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-muted-foreground mb-2">
                          You don&apos;t have any saved vocabulary yet.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Generate some vocabulary words on the Topic page
                          first, then come back here to practice pronunciation!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Choose What to Practice</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Select a vocabulary word or phrase to practice
                      pronouncing.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-3">
                        {vocabulary.map((vocab) => (
                          <Card
                            key={vocab.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedVocab?.id === vocab.id
                                ? "ring-2 ring-primary bg-primary/5"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => {
                              setSelectedVocab(vocab)
                              setCurrentStep("practice")
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-lg mb-1">
                                    {vocab.word}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {vocab.translation}
                                  </p>
                                  {vocab.sentence && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Example: {vocab.sentence}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Step 2 & 3: Practice Mode & Recording */}
          {selectedVocab &&
            (currentStep === "practice" || currentStep === "record") && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Step 2: Listen & Choose Practice Mode
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStartOver}
                        className="text-muted-foreground"
                      >
                        Change Vocabulary
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Practice Mode Selector */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        What would you like to practice?
                      </label>
                      <div className="flex gap-2">
                        <Button
                          variant={
                            practiceMode === "word" ? "default" : "outline"
                          }
                          onClick={() => setPracticeMode("word")}
                          className="flex-1"
                        >
                          Just the Word
                        </Button>
                        <Button
                          variant={
                            practiceMode === "sentence" ? "default" : "outline"
                          }
                          onClick={() => setPracticeMode("sentence")}
                          className="flex-1"
                          disabled={!selectedVocab.sentence}
                        >
                          Full Sentence
                        </Button>
                      </div>
                    </div>

                    {/* Practice Content */}
                    <div className="bg-muted/50 rounded-lg p-6 text-center space-y-4">
                      <div className="space-y-2">
                        <p className="text-3xl font-medium text-foreground">
                          {targetSentence.thai}
                        </p>
                        <p className="text-lg text-muted-foreground font-mono">
                          {targetSentence.romanization}
                        </p>
                        <p className="text-lg text-muted-foreground">
                          {targetSentence.translation}
                        </p>
                      </div>

                      <Button
                        onClick={speakSentence}
                        disabled={isPlayingAudio}
                        variant="secondary"
                      >
                        <Volume2
                          className={`h-4 w-4 ${
                            isPlayingAudio
                              ? "animate-pulse text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        />
                      </Button>
                    </div>

                    {currentStep === "practice" && (
                      <div className="text-center">
                        <Button
                          onClick={() => setCurrentStep("record")}
                          size="lg"
                          className="w-full max-w-sm"
                        >
                          Ready to Record
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Step 3: Recording */}
                {currentStep === "record" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Step 3: Record Your Pronunciation</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Speak clearly and try to match the pronunciation you
                        just heard.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Recorder
                        onRecordingComplete={handleRecordingComplete}
                        isProcessing={isProcessing}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Error Display */}
                {error && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <p className="text-red-500">{error}</p>
                        <Button onClick={handleTryAgain} variant="outline">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

          {/* Step 4: Feedback Results */}
          {currentStep === "feedback" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Step 4: Your Results
                    {feedback && (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleTryAgain}
                          variant="outline"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                        <Button
                          onClick={handleStartOver}
                          variant="outline"
                          size="sm"
                        >
                          New Word
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isProcessing ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          Analyzing your pronunciation...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Our AI is comparing your speech with the correct
                          pronunciation
                        </p>
                      </div>
                    </div>
                  ) : feedback ? (
                    <div className="text-center text-muted-foreground">
                      <p>Analysis complete! Check your results below.</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>Waiting for analysis...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {feedback && (
                <FeedbackCard
                  feedback={feedback}
                  targetSentence={targetSentence}
                  practiceMode={practiceMode}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

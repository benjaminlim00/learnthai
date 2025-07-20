"use client"

import { useState, useEffect } from "react"

import { ProtectedRoute, LoadingSpinner } from "@/components/shared"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Recorder, FeedbackCard } from "@/components/speak/core"
import { SmartCoach } from "@/components/speak/smart-coach/SmartCoach"
import {
  Volume2,
  RefreshCw,
  BookOpen,
  Mic,
  ChevronRight,
  Check,
} from "lucide-react"
import { VocabularyWord } from "@/types/database"
import { CorrectedData, PronunciationFeedback } from "@/lib/validation"
import { ContentType } from "@/types/pronunciation"

export default function SpeakPage() {
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([])
  const [selectedVocab, setSelectedVocab] = useState<VocabularyWord | null>(
    null
  )
  const [contentType, setContentType] = useState<ContentType>("sentence")
  const [isLoadingVocab, setIsLoadingVocab] = useState(true)
  const [currentStep, setCurrentStep] = useState<
    "select" | "practice" | "record" | "feedback"
  >("select")

  // Focus mode state
  // const [focusMode, setFocusMode] = useState(false)
  // const [focusTarget, setFocusTarget] = useState<string | null>(null)

  // Fetch user's vocabulary on component mount
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const response = await fetch("/api/vocabulary")
        if (response.ok) {
          const data: { words: VocabularyWord[] } = await response.json()
          setVocabulary(data.words)
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

  // Get current practice content based on selected vocabulary and mode
  const getCurrentPractice = (): CorrectedData => {
    if (!selectedVocab) {
      return {
        thai: "error",
        romanization: "error",
        translation: "error",
      }
    }

    if (contentType === "word") {
      return {
        thai: selectedVocab.word,
        romanization: selectedVocab.word_romanization,
        translation: selectedVocab.translation,
      }
    } else {
      return {
        thai: selectedVocab.sentence,
        romanization: selectedVocab.sentence_romanization,
        translation: selectedVocab.sentence_translation,
      }
    }
  }

  const targetSentence = getCurrentPractice()

  //TODO: add focus mode
  // Handle focus practice from SmartCoach recommendations
  // const handleFocusPractice = (weakness: {
  //   analysis_type: PronunciationWeaknessAnalysisType
  //   issue_description: string
  //   priority_level: string
  // }) => {
  //   setFocusMode(true)
  //   setFocusTarget(weakness.issue_description)

  //   // If weakness is about a specific word/sentence, try to find it in vocabulary
  //   if (weakness.analysis_type === "word_difficulty") {
  //     const matchingVocab = vocabulary.find(
  //       (v) =>
  //         v.word === weakness.issue_description ||
  //         v.sentence === weakness.issue_description
  //     )

  //     if (matchingVocab) {
  //       setSelectedVocab(matchingVocab)
  //       setCurrentStep("practice")
  //     }
  //   }

  //   // TODO: we need to create practice mode specific to the weakness type
  //   // Set appropriate practice mode based on weakness type
  //   if (weakness.analysis_type === "content_type") {
  //     const mode = weakness.issue_description.includes("word")
  //       ? "word"
  //       : "sentence"
  //     setcontentType(mode)
  //   }

  //   // Scroll to practice section
  //   const practiceSection = document.querySelector("[data-practice-section]")
  //   if (practiceSection) {
  //     practiceSection.scrollIntoView({ behavior: "smooth" })
  //   }
  // }

  // // Clear focus mode
  // const clearFocusMode = () => {
  //   setFocusMode(false)
  //   setFocusTarget(null)
  // }

  const handleRecordingComplete = async (recognizedText: string) => {
    setIsProcessing(true)
    setError(null)
    setFeedback(null)
    setCurrentStep("feedback")

    try {
      // Create data to send for analysis
      const analysisData = {
        recognizedText,
        targetThai: targetSentence.thai,
        targetRomanization: targetSentence.romanization,
        targetTranslation: targetSentence.translation,
        contentType,
      }

      const response = await fetch("/api/speak-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(analysisData),
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
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h1 className="flex items-center justify-center gap-2 mb-2 text-3xl font-bold text-foreground">
            <Mic className="h-8 w-8 text-primary" />
            Speaking Practice
          </h1>
          <p className="text-muted-foreground">
            Practice your Thai pronunciation with AI-powered feedback
          </p>
        </header>

        {/* Focus Mode Indicator */}
        {/* {focusMode && focusTarget && (
          <aside className="mb-6 mx-auto max-w-2xl">
            <section className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {`Focus Mode: Practicing "${focusTarget}"`}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFocusMode}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  Exit Focus
                </Button>
              </header>
            </section>
          </aside>
        )} */}

        {/* //TODO: make a component for speaking progress */}
        {/* Progress Steps */}
        <nav className="mb-8" aria-label="Practice progress">
          <ol className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <li key={step.id} className="flex items-center">
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
              </li>
            ))}
          </ol>
        </nav>

        {/* Step 1: Vocabulary Selection */}
        {currentStep === "select" && (
          <section data-practice-section>
            {isLoadingVocab ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Loading your vocabulary...
                  </p>
                </CardContent>
              </Card>
            ) : vocabulary.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-muted-foreground mb-2">
                      You don&apos;t have any saved vocabulary yet.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Generate some vocabulary words on the Generate page first,
                      then come back here to practice pronunciation!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Choose What to Practice</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select a vocabulary word or phrase to practice pronouncing.
                  </p>
                </CardHeader>
                <CardContent>
                  <section className="max-h-96 overflow-y-auto">
                    <ul className="grid grid-cols-1 gap-3">
                      {vocabulary.map((vocab) => (
                        <li key={vocab.id}>
                          <Card
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
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-lg mb-1">
                                  {vocab.word}
                                </h3>
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
                            </CardContent>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  </section>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* Step 2 & 3: Practice Mode & Recording */}
        {selectedVocab &&
          (currentStep === "practice" || currentStep === "record") && (
            <section data-practice-section className="space-y-6">
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
                  <fieldset>
                    <legend className="text-sm font-medium text-foreground mb-2">
                      What would you like to practice?
                    </legend>
                    <div className="flex gap-2">
                      <Button
                        variant={contentType === "word" ? "default" : "outline"}
                        onClick={() => setContentType("word")}
                        className="flex-1"
                      >
                        Just the Word
                      </Button>
                      <Button
                        variant={
                          contentType === "sentence" ? "default" : "outline"
                        }
                        onClick={() => setContentType("sentence")}
                        className="flex-1"
                        disabled={!selectedVocab.sentence}
                      >
                        Full Sentence
                      </Button>
                    </div>
                  </fieldset>

                  {/* Practice Content */}
                  <section className="bg-muted/50 rounded-lg p-6 text-center space-y-4">
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
                      aria-label="Listen to pronunciation"
                    >
                      <Volume2
                        className={`h-4 w-4 ${
                          isPlayingAudio
                            ? "animate-pulse text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      />
                    </Button>
                  </section>

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
                      Speak clearly and try to match the pronunciation you just
                      heard.
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
                  <CardContent className="p-6 text-center space-y-4">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={handleTryAgain} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>
          )}

        {/* Step 4: Feedback Results */}
        {currentStep === "feedback" && (
          <section className="space-y-4">
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
                    <LoadingSpinner />
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
                  <p className="text-center text-muted-foreground">
                    Analysis complete! Check your results below.
                  </p>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Waiting for analysis...
                  </p>
                )}
              </CardContent>
            </Card>

            {feedback && (
              <FeedbackCard
                feedback={feedback}
                targetSentence={targetSentence}
                contentType={contentType}
              />
            )}
          </section>
        )}

        <section className="mt-12">
          <SmartCoach
          // onFocusPractice={handleFocusPractice}
          />
        </section>
      </main>
    </ProtectedRoute>
  )
}

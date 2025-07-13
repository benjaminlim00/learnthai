"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { VocabularyWord, SpacedRepetitionRating } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getRatingDescription,
  getRatingButtonStyle,
  formatInterval,
} from "@/lib/spaced-repetition"
import {
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  Play,
} from "lucide-react"

interface ReviewStats {
  total: number
  completed: number
  remaining: number
}

export default function ReviewPage() {
  const [dueWords, setDueWords] = useState<VocabularyWord[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [error, setError] = useState("")
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    total: 0,
    completed: 0,
    remaining: 0,
  })
  const [sessionComplete, setSessionComplete] = useState(false)
  const [viewMode, setViewMode] = useState<"review" | "browse">("review")
  const [allWords, setAllWords] = useState<VocabularyWord[]>([])
  const [browseLoading, setBrowseLoading] = useState(false)
  const [updatingWords, setUpdatingWords] = useState(false)
  const [reviewStarted, setReviewStarted] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDueWords()
    }
  }, [user])

  const fetchDueWords = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/vocabulary/due?limit=20")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch due words")
      }

      setDueWords(data.words)
      setReviewStats({
        total: data.words.length,
        completed: 0,
        remaining: data.words.length,
      })

      if (data.words.length === 0) {
        setSessionComplete(true)
        setReviewStarted(false)
      }

      setCurrentWordIndex(0)
      setShowAnswer(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleRating = async (rating: SpacedRepetitionRating) => {
    if (dueWords.length === 0 || submittingRating) return

    setSubmittingRating(true)
    try {
      const currentWord = dueWords[currentWordIndex]

      const response = await fetch("/api/vocabulary/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentWord.id,
          rating,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to rate word")
      }

      // Move to next word or complete session
      const newCompleted = reviewStats.completed + 1
      const newRemaining = reviewStats.remaining - 1

      if (currentWordIndex < dueWords.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1)
        setShowAnswer(false)
        setReviewStats({
          total: reviewStats.total,
          completed: newCompleted,
          remaining: newRemaining,
        })
      } else {
        // Session complete
        setSessionComplete(true)
        setReviewStarted(false)
        setReviewStats({
          total: reviewStats.total,
          completed: newCompleted,
          remaining: 0,
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to rate word")
    } finally {
      setSubmittingRating(false)
    }
  }

  const startNewSession = () => {
    setSessionComplete(false)
    setReviewStarted(true)
    setError("")
    fetchDueWords()
  }

  const fetchAllWords = async () => {
    try {
      setBrowseLoading(true)
      const response = await fetch("/api/vocabulary")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch vocabulary")
      }

      setAllWords(data.words)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch vocabulary"
      )
    } finally {
      setBrowseLoading(false)
    }
  }

  const switchToReviewMode = () => {
    setViewMode("review")
    setReviewStarted(false)
    setError("")
  }

  const switchToBrowseMode = () => {
    setViewMode("browse")
    setError("")
    if (allWords.length === 0) {
      fetchAllWords()
    }
  }

  const reviewAllLearned = async () => {
    try {
      setUpdatingWords(true)
      const response = await fetch("/api/vocabulary")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch vocabulary")
      }

      // Start a session with all vocabulary words
      setDueWords(data.words)
      setReviewStats({
        total: data.words.length,
        completed: 0,
        remaining: data.words.length,
      })
      setCurrentWordIndex(0)
      setShowAnswer(false)
      setSessionComplete(false)
      setReviewStarted(true)
      setError("")
    } catch (error) {
      console.error("Error starting review all session:", error)
      setError("Failed to start review session")
    } finally {
      setUpdatingWords(false)
    }
  }

  const quitSession = () => {
    setReviewStarted(false)
    setSessionComplete(false)
    setShowAnswer(false)
    setCurrentWordIndex(0)
    fetchDueWords() // Reset to normal due words
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading review session...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <RotateCcw className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">
              Vocabulary Review
            </h2>
          </div>
          <p className="text-muted-foreground">
            Spaced repetition learning with the SM-2 algorithm
          </p>

          {/* Mode Toggle Tabs */}
          <div className="flex justify-center mt-6">
            <div className="flex bg-muted rounded-lg p-1 gap-1">
              <button
                onClick={switchToReviewMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "review"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Play className="h-4 w-4" />
                Review Session
              </button>
              <button
                onClick={switchToBrowseMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "browse"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Browse Vocabulary
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md mb-6 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Review Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {reviewStats.total}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {reviewStats.completed}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {reviewStats.remaining}
                </div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
            </div>
            {reviewStats.total > 0 && (
              <div className="mt-4">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (reviewStats.completed / reviewStats.total) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {viewMode === "browse" ? (
          // Browse Vocabulary View
          <div className="space-y-4">
            {browseLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading vocabulary...</p>
              </div>
            ) : allWords.length > 0 ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-muted-foreground">
                    You have {allWords.length} saved vocabulary words
                  </p>
                </div>
                <div className="grid gap-4">
                  {allWords.map((word) => (
                    <Card key={word.id} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-2xl font-bold text-foreground mb-1">
                              {word.word}
                            </div>
                            {word.word_romanization && (
                              <div className="text-sm text-muted-foreground italic mb-2">
                                {word.word_romanization}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                word.status === "new"
                                  ? "bg-blue-100 text-blue-800"
                                  : word.status === "learning"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {word.status}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-foreground">
                              Translation:
                            </span>
                            <div className="text-muted-foreground mt-1">
                              {word.translation}
                            </div>
                          </div>

                          <div>
                            <span className="font-medium text-foreground">
                              Example:
                            </span>
                            <div className="mt-1 space-y-1">
                              <div className="text-foreground">
                                {word.sentence}
                              </div>
                              {word.sentence_romanization && (
                                <div className="text-sm text-muted-foreground italic">
                                  {word.sentence_romanization}
                                </div>
                              )}
                              {word.sentence_translation && (
                                <div className="text-sm text-muted-foreground">
                                  {word.sentence_translation}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex justify-between">
                              <span>Repetitions: {word.repetitions}</span>
                              <span>Ease: {word.ease_factor?.toFixed(1)}</span>
                              <span>
                                Next: {formatInterval(word.interval || 1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      No Vocabulary Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You haven&apos;t saved any vocabulary words yet.
                    </p>
                    <a href="/topic" className="text-primary hover:underline">
                      Generate your first vocabulary words
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : sessionComplete ? (
          // Session Complete Screen
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Session Complete!
                </h3>
                <p className="text-muted-foreground mb-6">
                  You reviewed {reviewStats.completed} words. Great job!
                </p>
                <div className="space-y-3">
                  {reviewStats.remaining > 0 ? (
                    <Button
                      onClick={startNewSession}
                      className="w-full sm:w-auto"
                    >
                      Start New Session
                    </Button>
                  ) : (
                    <Button
                      onClick={reviewAllLearned}
                      disabled={updatingWords}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      {updatingWords ? "Updating..." : "Review All Learned"}
                    </Button>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <a href="/topic" className="text-primary hover:underline">
                      Generate more vocabulary
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !reviewStarted ? (
          // Review Status Screen - shows before starting any session
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                {dueWords.length > 0 ? (
                  <>
                    <Clock className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Daily Review Available
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      You have {dueWords.length} word
                      {dueWords.length !== 1 ? "s" : ""} ready for review
                    </p>
                    <Button
                      onClick={startNewSession}
                      className="w-full sm:w-auto"
                    >
                      Start Session
                    </Button>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Daily Session Done
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      No words are due for review right now. Great job!
                    </p>
                    <Button
                      onClick={reviewAllLearned}
                      disabled={updatingWords}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      {updatingWords ? "Updating..." : "Review All Learned"}
                    </Button>
                  </>
                )}
                <div className="text-sm text-muted-foreground mt-4">
                  <a href="/topic" className="text-primary hover:underline">
                    Generate more vocabulary
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Active Review Card - only shown during active review */}
        {viewMode === "review" &&
        !sessionComplete &&
        dueWords.length > 0 &&
        reviewStarted ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Word {currentWordIndex + 1} of {dueWords.length}
                </CardTitle>
                <Button
                  onClick={quitSession}
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Quit Session
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Question */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {dueWords[currentWordIndex].word}
                  </div>
                  {dueWords[currentWordIndex].word_romanization && (
                    <div className="text-lg text-muted-foreground italic mb-4">
                      {dueWords[currentWordIndex].word_romanization}
                    </div>
                  )}

                  {!showAnswer ? (
                    <Button
                      onClick={() => setShowAnswer(true)}
                      variant="outline"
                      className="mt-4"
                    >
                      Show Answer
                    </Button>
                  ) : (
                    // Answer and Rating
                    <div className="space-y-6">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-lg font-medium text-foreground mb-2">
                          {dueWords[currentWordIndex].translation}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Example:</span>
                            <div className="mt-1">
                              <div className="text-foreground">
                                {dueWords[currentWordIndex].sentence}
                              </div>
                              {dueWords[currentWordIndex]
                                .sentence_romanization && (
                                <div className="text-muted-foreground italic">
                                  {
                                    dueWords[currentWordIndex]
                                      .sentence_romanization
                                  }
                                </div>
                              )}
                              {dueWords[currentWordIndex]
                                .sentence_translation && (
                                <div className="text-muted-foreground">
                                  {
                                    dueWords[currentWordIndex]
                                      .sentence_translation
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rating Buttons */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-center">
                          How well did you remember this?
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {([0, 1, 2, 3, 4, 5] as SpacedRepetitionRating[]).map(
                            (rating) => (
                              <Button
                                key={rating}
                                onClick={() => handleRating(rating)}
                                disabled={submittingRating}
                                className={`${getRatingButtonStyle(
                                  rating
                                )} flex flex-col py-3 h-auto`}
                              >
                                <div className="font-bold text-lg">
                                  {rating}
                                </div>
                                <div className="text-xs opacity-90">
                                  {getRatingDescription(rating)}
                                </div>
                              </Button>
                            )
                          )}
                        </div>

                        {/* Show current SM-2 stats */}
                        <div className="text-xs text-muted-foreground text-center">
                          Current: {dueWords[currentWordIndex].repetitions}{" "}
                          reps, ease{" "}
                          {dueWords[currentWordIndex].ease_factor?.toFixed(1)},
                          next in{" "}
                          {formatInterval(
                            dueWords[currentWordIndex].interval || 1
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </ProtectedRoute>
  )
}

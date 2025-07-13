"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { VocabularyWord, SpacedRepetitionRating } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteConfirmationModal } from "@/components/review/DeleteConfirmationModal"
import { PriorityModeSelector } from "@/components/review/PriorityModeSelector"
import { SessionStats } from "@/components/review/SessionStats"
import { ReviewSession } from "@/components/review/ReviewSession"
import { BrowseVocabulary } from "@/components/review/BrowseVocabulary"
import {
  Play,
  RotateCcw,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock,
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
  const [priorityStats, setPriorityStats] = useState<{
    totalDue: number
    priorityMode: string
    priorityRange?: { highest: number; lowest: number }
  } | null>(null)
  const [selectedPriorityMode, setSelectedPriorityMode] = useState<
    "difficulty" | "time"
  >("difficulty")
  const [deletingWordId, setDeletingWordId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [wordToDelete, setWordToDelete] = useState<VocabularyWord | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDueWords()
    }
  }, [user, selectedPriorityMode])

  // Load saved priority mode preference on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("reviewPriorityMode") as
      | "difficulty"
      | "time"
    if (savedMode && (savedMode === "difficulty" || savedMode === "time")) {
      setSelectedPriorityMode(savedMode)
    }
  }, [])

  const fetchDueWords = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/vocabulary/due?limit=20&priority=${selectedPriorityMode}&includeStats=true`
      )
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

      // Store priority stats for display
      setPriorityStats({
        totalDue: data.totalDue || data.words.length,
        priorityMode: data.priorityMode || "difficulty",
        priorityRange: data.priorityRange,
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
    // Prevent multiple rapid clicks and ensure we have valid state
    if (
      dueWords.length === 0 ||
      submittingRating ||
      currentWordIndex >= dueWords.length
    ) {
      return
    }

    setSubmittingRating(true)
    setError("") // Clear any previous errors

    try {
      const currentWord = dueWords[currentWordIndex]

      // Double-check we have a valid word
      if (!currentWord || !currentWord.id) {
        throw new Error("Invalid word data")
      }

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

      // Update stats immediately for better UX
      const newCompleted = reviewStats.completed + 1
      const newRemaining = Math.max(0, reviewStats.remaining - 1)

      setReviewStats({
        total: reviewStats.total,
        completed: newCompleted,
        remaining: newRemaining,
      })

      // Move to next word or complete session
      if (currentWordIndex < dueWords.length - 1) {
        setCurrentWordIndex((prev) => prev + 1)
        setShowAnswer(false)
      } else {
        // Session complete
        setSessionComplete(true)
        setReviewStarted(false)
        setCurrentWordIndex(0)
        setShowAnswer(false)
      }
    } catch (error) {
      // More descriptive error handling
      const errorMessage =
        error instanceof Error ? error.message : "Failed to rate word"
      setError(`Rating failed: ${errorMessage}. Please try again.`)
      console.error("Rating error:", error)
    } finally {
      // Add a small delay to prevent rapid successive calls
      setTimeout(() => {
        setSubmittingRating(false)
      }, 300)
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

  const handlePriorityModeChange = (newMode: "difficulty" | "time") => {
    setSelectedPriorityMode(newMode)
    localStorage.setItem("reviewPriorityMode", newMode)
    // The useEffect will automatically refetch words when selectedPriorityMode changes
  }

  const openDeleteModal = (word: VocabularyWord) => {
    setWordToDelete(word)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setWordToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!wordToDelete || deletingWordId) return

    setDeletingWordId(wordToDelete.id)
    try {
      const response = await fetch(`/api/vocabulary?id=${wordToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete word")
      }

      // Remove the word from the local state
      setAllWords((prev) => prev.filter((word) => word.id !== wordToDelete.id))

      // Clear any errors
      setError("")

      // Close modal
      closeDeleteModal()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete word")
    } finally {
      setDeletingWordId(null)
    }
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Progress
              </CardTitle>

              {/* Priority Mode Toggle */}
              <PriorityModeSelector
                selectedMode={selectedPriorityMode}
                onModeChange={handlePriorityModeChange}
                disabled={reviewStarted}
              />
            </div>
          </CardHeader>
          <CardContent>
            <SessionStats
              reviewStats={reviewStats}
              priorityStats={priorityStats}
              selectedPriorityMode={selectedPriorityMode}
            />
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
            ) : (
              <BrowseVocabulary
                words={allWords}
                onDeleteWord={openDeleteModal}
                deletingWordId={deletingWordId}
              />
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
          <div className="space-y-4">
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
            </Card>
            <ReviewSession
              currentWord={dueWords[currentWordIndex]}
              showAnswer={showAnswer}
              onShowAnswer={() => setShowAnswer(true)}
              onRating={handleRating}
              submittingRating={submittingRating}
            />
          </div>
        ) : null}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        word={wordToDelete}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={deletingWordId === wordToDelete?.id}
      />
    </ProtectedRoute>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { VocabularyWord, SpacedRepetitionRating } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ModeToggle,
  ErrorDisplay,
  SessionStats,
  PriorityModeSelector,
  ReviewStatus,
  ActiveReviewCard,
  BrowseVocabulary,
  DeleteConfirmationModal,
} from "@/components/review"
import { RotateCcw, Clock } from "lucide-react"

type ReviewState =
  | "LOADING"
  | "NO_WORDS"
  | "NO_DUE_WORDS"
  | "READY_TO_REVIEW"
  | "REVIEWING"
  | "SESSION_COMPLETE"

type Mode = "browse" | "review"

export default function ReviewPage() {
  const { user } = useAuth()

  // Data states
  const [dueWords, setDueWords] = useState<VocabularyWord[]>([])
  const [allWords, setAllWords] = useState<VocabularyWord[]>([])
  const [loading, setLoading] = useState(true)
  const [browseLoading, setBrowseLoading] = useState(false)

  // Review session states
  const [mode, setMode] = useState<Mode>("review")
  const [isReviewing, setIsReviewing] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [initialDueCount, setInitialDueCount] = useState(0)

  // UI states
  const [submittingRating, setSubmittingRating] = useState(false)
  const [updatingWords, setUpdatingWords] = useState(false)
  const [error, setError] = useState("")

  // Settings
  const [selectedPriorityMode, setSelectedPriorityMode] = useState<
    "difficulty" | "time"
  >("difficulty")
  const [priorityStats, setPriorityStats] = useState<{
    totalDue: number
    priorityMode: string
    priorityRange?: { highest: number; lowest: number }
  } | null>(null)

  // Delete modal states
  const [deletingWordId, setDeletingWordId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [wordToDelete, setWordToDelete] = useState<VocabularyWord | null>(null)

  // Computed state - this is the key simplification
  const computedState: ReviewState = (() => {
    if (loading) return "LOADING"
    if (allWords.length === 0) return "NO_WORDS"
    if (isReviewing) {
      if (currentWordIndex >= initialDueCount) return "SESSION_COMPLETE"
      return "REVIEWING"
    }
    if (dueWords.length === 0) return "NO_DUE_WORDS"
    return "READY_TO_REVIEW"
  })()

  // Derived values
  const reviewStats = {
    total: initialDueCount,
    completed: currentWordIndex,
    remaining: Math.max(0, initialDueCount - currentWordIndex),
  }

  // Single useEffect for data fetching and initialization
  useEffect(() => {
    if (!user) return

    const initializeData = async () => {
      setLoading(true)
      setError("")

      try {
        // Load saved priority mode
        const savedMode = localStorage.getItem("reviewPriorityMode") as
          | "difficulty"
          | "time"
        if (savedMode && (savedMode === "difficulty" || savedMode === "time")) {
          setSelectedPriorityMode(savedMode)
        }

        // Fetch both due words and all words
        await Promise.all([
          fetchDueWords(savedMode || selectedPriorityMode),
          fetchAllWords(false),
        ])
      } catch (error) {
        console.error("Error initializing data:", error)
        setError("Failed to load vocabulary data")
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [user])

  // Effect for priority mode changes
  useEffect(() => {
    if (!user || loading) return
    fetchDueWords(selectedPriorityMode)
  }, [selectedPriorityMode, user, loading])

  const fetchDueWords = async (priorityMode: "difficulty" | "time") => {
    try {
      const response = await fetch(
        `/api/vocabulary/due?limit=20&priority=${priorityMode}&includeStats=true`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch due words")
      }

      setDueWords(data.words)
      setInitialDueCount(data.words.length)
      setPriorityStats({
        totalDue: data.totalDue || data.words.length,
        priorityMode: data.priorityMode || "difficulty",
        priorityRange: data.priorityRange,
      })

      // Reset session state when new words are fetched
      setCurrentWordIndex(0)
      setShowAnswer(false)
      setIsReviewing(false)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch due words"
      )
      setDueWords([])
      setInitialDueCount(0)
    }
  }

  const fetchAllWords = async (triggerLoading: boolean) => {
    try {
      if (triggerLoading) {
        setBrowseLoading(true)
        setMode("browse")
      }

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
      setAllWords([])
    } finally {
      if (triggerLoading) {
        setBrowseLoading(false)
      }
    }
  }

  const handleRating = async (rating: SpacedRepetitionRating) => {
    if (
      !isReviewing ||
      submittingRating ||
      currentWordIndex >= dueWords.length
    ) {
      return
    }

    setSubmittingRating(true)
    setError("")

    try {
      const currentWord = dueWords[currentWordIndex]
      if (!currentWord?.id) {
        throw new Error("Invalid word data")
      }

      const response = await fetch("/api/vocabulary/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentWord.id, rating }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to rate word")
      }

      // Move to next word
      setCurrentWordIndex((prev) => prev + 1)
      setShowAnswer(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to rate word"
      setError(`Rating failed: ${errorMessage}. Please try again.`)
      console.error("Rating error:", error)
    } finally {
      setTimeout(() => setSubmittingRating(false), 300)
    }
  }

  const startNewSession = () => {
    setIsReviewing(true)
    setCurrentWordIndex(0)
    setShowAnswer(false)
    setError("")
  }

  const quitSession = () => {
    setIsReviewing(false)
    setCurrentWordIndex(0)
    setShowAnswer(false)
    // Clear session data immediately to prevent flash
    setDueWords([])
    setInitialDueCount(0)
    // Then fetch fresh due words
    fetchDueWords(selectedPriorityMode)
  }

  const reviewAllLearned = async () => {
    try {
      setUpdatingWords(true)
      const response = await fetch("/api/vocabulary")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch vocabulary")
      }

      setDueWords(data.words)
      setInitialDueCount(data.words.length)
      setCurrentWordIndex(0)
      setShowAnswer(false)
      setIsReviewing(true)
      setError("")
    } catch (error) {
      console.error("Error starting review all session:", error)
      setError("Failed to start review session")
    } finally {
      setUpdatingWords(false)
    }
  }

  const switchToReviewMode = () => {
    setMode("review")
    setError("")
  }

  const switchToBrowseMode = () => {
    setError("")
    if (allWords.length === 0) {
      fetchAllWords(true)
    } else {
      setMode("browse")
    }
  }

  const handlePriorityModeChange = (newMode: "difficulty" | "time") => {
    setSelectedPriorityMode(newMode)
    localStorage.setItem("reviewPriorityMode", newMode)
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
      const response = await fetch("/api/vocabulary", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: wordToDelete.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete word")
      }

      // Update allWords
      setAllWords((prev) => prev.filter((word) => word.id !== wordToDelete.id))

      // Update dueWords if the deleted word was part of the current session
      const deletedWordIndex = dueWords.findIndex(
        (word) => word.id === wordToDelete.id
      )
      if (deletedWordIndex !== -1) {
        setDueWords((prev) =>
          prev.filter((word) => word.id !== wordToDelete.id)
        )
        setInitialDueCount((prev) => prev - 1)

        // Adjust currentWordIndex if we deleted a word before the current position
        if (deletedWordIndex < currentWordIndex) {
          setCurrentWordIndex((prev) => prev - 1)
        }
      }

      setError("")
      closeDeleteModal()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete word")
    } finally {
      setDeletingWordId(null)
    }
  }

  // Loading state
  if (computedState === "LOADING") {
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

          <ModeToggle
            viewMode={mode}
            onSwitchToReview={switchToReviewMode}
            onSwitchToBrowse={switchToBrowseMode}
          />
        </div>

        <ErrorDisplay error={error} />

        {/* Review Stats */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Progress
              </CardTitle>

              <PriorityModeSelector
                selectedMode={selectedPriorityMode}
                onModeChange={handlePriorityModeChange}
                disabled={computedState === "REVIEWING"}
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

        {/* State-based rendering */}
        {browseLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading vocabulary...</p>
          </div>
        ) : mode === "browse" ? (
          <BrowseVocabulary
            words={allWords}
            onDeleteWord={openDeleteModal}
            deletingWordId={deletingWordId}
          />
        ) : computedState === "REVIEWING" ? (
          <ActiveReviewCard
            dueWords={dueWords}
            currentWordIndex={currentWordIndex}
            showAnswer={showAnswer}
            submittingRating={submittingRating}
            onShowAnswer={() => setShowAnswer(true)}
            onRating={handleRating}
            onQuitSession={quitSession}
          />
        ) : (
          <ReviewStatus
            state={computedState}
            dueWords={dueWords}
            reviewStats={reviewStats}
            updatingWords={updatingWords}
            onStartNewSession={startNewSession}
            onReviewAllLearned={reviewAllLearned}
          />
        )}
      </div>

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

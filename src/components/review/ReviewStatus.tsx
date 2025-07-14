import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VocabularyWord } from "@/types/database"
import { Clock, CheckCircle, BookOpen } from "lucide-react"

type ReviewState =
  | "LOADING"
  | "NO_WORDS"
  | "NO_DUE_WORDS"
  | "READY_TO_REVIEW"
  | "REVIEWING"
  | "SESSION_COMPLETE"

interface ReviewStatusProps {
  state: ReviewState
  dueWords: VocabularyWord[]
  reviewStats: {
    total: number
    completed: number
    remaining: number
  }
  updatingWords: boolean
  onStartNewSession: () => void
  onReviewAllLearned: () => void
}

export function ReviewStatus({
  state,
  dueWords,
  reviewStats,
  updatingWords,
  onStartNewSession,
  onReviewAllLearned,
}: ReviewStatusProps) {
  if (state === "SESSION_COMPLETE") {
    return (
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
                  onClick={onStartNewSession}
                  className="w-full sm:w-auto"
                >
                  Start New Session
                </Button>
              ) : (
                <Button
                  onClick={onReviewAllLearned}
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
    )
  }

  if (state === "NO_WORDS") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Start Your Learning Journey
            </h3>
            <p className="text-muted-foreground mb-6">
              You don&apos;t have any vocabulary words yet. Generate some
              vocabulary to start your spaced repetition learning!
            </p>
            <Button
              onClick={() => (window.location.href = "/topic")}
              className="w-full sm:w-auto"
            >
              Generate Vocabulary
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state === "NO_DUE_WORDS") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Daily Session Done
            </h3>
            <p className="text-muted-foreground mb-6">
              No words are due for review right now. Great job!
            </p>
            <Button
              onClick={onReviewAllLearned}
              disabled={updatingWords}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {updatingWords ? "Updating..." : "Review All Learned"}
            </Button>
            <div className="text-sm text-muted-foreground mt-4">
              <a href="/topic" className="text-primary hover:underline">
                Generate more vocabulary
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state === "READY_TO_REVIEW") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Clock className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Daily Review Available
            </h3>
            <p className="text-muted-foreground mb-6">
              You have {dueWords.length} word
              {dueWords.length !== 1 ? "s" : ""} ready for review
            </p>
            <Button onClick={onStartNewSession} className="w-full sm:w-auto">
              Start Session
            </Button>
            <div className="text-sm text-muted-foreground mt-4">
              <a href="/topic" className="text-primary hover:underline">
                Generate more vocabulary
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Should not reach here with the current state machine, but provide fallback
  return null
}

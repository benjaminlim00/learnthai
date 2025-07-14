import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ReviewSession } from "./ReviewSession"
import { VocabularyWord, SpacedRepetitionRating } from "@/types/database"

interface ActiveReviewCardProps {
  dueWords: VocabularyWord[]
  currentWordIndex: number
  showAnswer: boolean
  submittingRating: boolean
  onShowAnswer: () => void
  onRating: (rating: SpacedRepetitionRating) => void
  onQuitSession: () => void
}

export function ActiveReviewCard({
  dueWords,
  currentWordIndex,
  showAnswer,
  submittingRating,
  onShowAnswer,
  onRating,
  onQuitSession,
}: ActiveReviewCardProps) {
  if (dueWords.length === 0 || currentWordIndex >= dueWords.length) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Word {currentWordIndex + 1} of {dueWords.length}
            </CardTitle>
            <Button
              onClick={onQuitSession}
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
        onShowAnswer={onShowAnswer}
        onRating={onRating}
        submittingRating={submittingRating}
      />
    </div>
  )
}

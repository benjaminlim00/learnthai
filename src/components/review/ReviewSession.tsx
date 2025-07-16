import { VocabularyWord, SpacedRepetitionRating } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import {
  formatInterval,
  getEaseDifficulty,
  getEaseStars,
} from "@/lib/services/spaced-repetition"

/**
 * Get a human-readable description of the rating
 * @param rating Spaced repetition rating (0-5)
 * @returns Human-readable description
 */
function getRatingDescription(rating: SpacedRepetitionRating): string {
  const descriptions = {
    0: "Complete blackout",
    1: "Incorrect with difficult recall",
    2: "Incorrect with easy recall",
    3: "Correct with difficult recall",
    4: "Correct with some hesitation",
    5: "Perfect recall",
  }
  return descriptions[rating]
}

/**
 * Get rating button styling based on rating value
 * @param rating Spaced repetition rating (0-5)
 * @returns Tailwind classes for styling
 */
function getRatingButtonStyle(rating: SpacedRepetitionRating): string {
  const styles = {
    0: "bg-red-600 hover:bg-red-700 text-white",
    1: "bg-red-500 hover:bg-red-600 text-white",
    2: "bg-orange-500 hover:bg-orange-600 text-white",
    3: "bg-yellow-500 hover:bg-yellow-600 text-white",
    4: "bg-green-500 hover:bg-green-600 text-white",
    5: "bg-green-600 hover:bg-green-700 text-white",
  }
  return styles[rating]
}

interface ReviewSessionProps {
  currentWord: VocabularyWord
  showAnswer: boolean
  onShowAnswer: () => void
  onRating: (rating: SpacedRepetitionRating) => void
  submittingRating: boolean
}

export function ReviewSession({
  currentWord,
  showAnswer,
  onShowAnswer,
  onRating,
  submittingRating,
}: ReviewSessionProps) {
  const ratings: SpacedRepetitionRating[] = [0, 1, 2, 3, 4, 5]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {currentWord.word}
            </h2>
            <p className="text-muted-foreground text-lg">
              {currentWord.word_romanization}
            </p>
          </div>

          {!showAnswer ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">What does this word mean?</p>
              <Button onClick={onShowAnswer} className="w-full">
                Show Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">
                    Translation:
                  </h3>
                  <p className="text-muted-foreground">
                    {currentWord.translation}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">
                    Example:
                  </h3>
                  <div className="space-y-2">
                    <p className="text-foreground">{currentWord.sentence}</p>
                    <p className="text-sm text-muted-foreground italic">
                      {currentWord.sentence_romanization}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentWord.sentence_translation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">
                  How well did you know this word?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ratings.map((rating) => (
                    <Button
                      key={rating}
                      onClick={() => onRating(rating)}
                      disabled={submittingRating}
                      className={`h-auto py-3 px-2 sm:px-4 ${getRatingButtonStyle(
                        rating
                      )}`}
                    >
                      <div className="text-left w-full">
                        <div className="font-medium text-sm sm:text-base leading-tight">
                          {rating} - {getRatingDescription(rating)}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>
                      Difficulty:{" "}
                      {getEaseDifficulty(currentWord.ease_factor || 2.5).label}
                    </span>
                    <span>{getEaseStars(currentWord.ease_factor || 2.5)}</span>
                  </div>
                  <span>Next: {formatInterval(currentWord.interval || 1)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

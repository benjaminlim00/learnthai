import { VocabularyWord } from "@/types/database"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  getEaseDifficulty,
  getEaseStars,
  formatInterval,
} from "@/lib/spaced-repetition"
import { Trash2 } from "lucide-react"

interface BrowseVocabularyProps {
  words: VocabularyWord[]
  onDeleteWord: (word: VocabularyWord) => void
  deletingWordId: string | null
}

export function BrowseVocabulary({
  words,
  onDeleteWord,
  deletingWordId,
}: BrowseVocabularyProps) {
  if (words.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No vocabulary words found. Start by adding some words to review!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {words.map((word) => (
        <Card key={word.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {word.word}
                  </h3>
                  {word.word_romanization && (
                    <span className="text-muted-foreground text-sm">
                      ({word.word_romanization})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    Difficulty:{" "}
                    {getEaseDifficulty(word.ease_factor || 2.5).label}
                  </span>
                  <span className="text-muted-foreground">
                    {getEaseStars(word.ease_factor || 2.5)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    word.status === "new"
                      ? "bg-blue-100 text-blue-800"
                      : word.status === "learning"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {word.status}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteWord(word)}
                  disabled={deletingWordId === word.id}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  {deletingWordId === word.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
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
                <span className="font-medium text-foreground">Example:</span>
                <div className="mt-1 space-y-1">
                  <div className="text-foreground">{word.sentence}</div>
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

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Reviews: {word.repetitions || 0}</span>
                  <span>Next: {formatInterval(word.interval || 1)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

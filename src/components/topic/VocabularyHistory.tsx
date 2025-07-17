import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, X } from "lucide-react"
import { GPTVocabularyWord } from "@/lib/validation"
import { formatDate } from "@/lib/utils/time"

interface VocabularyResult {
  id: string
  topic: string
  vocabWords: GPTVocabularyWord[]
  timestamp: number
}

interface VocabularyHistoryProps {
  history: VocabularyResult[]
  showHistory: boolean
  onToggleHistory: () => void
  onClearHistory: () => void
  onLoadFromHistory: (result: VocabularyResult) => void
}

export function VocabularyHistory({
  history,
  showHistory,
  onToggleHistory,
  onClearHistory,
  onLoadFromHistory,
}: VocabularyHistoryProps) {
  if (!showHistory) {
    return (
      <Button
        onClick={onToggleHistory}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <History className="h-4 w-4" />
        History ({history.length})
      </Button>
    )
  }

  if (history.length === 0) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Vocabulary History</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={onClearHistory}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
            <Button onClick={onToggleHistory} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((result) => (
            <Card
              key={result.id}
              className="bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => onLoadFromHistory(result)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs text-muted-foreground">
                    {formatDate(result.timestamp)} • {result.vocabWords.length}{" "}
                    words
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {result.topic}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {result.vocabWords.slice(0, 5).map((word, index) => (
                      <div
                        key={index}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                      >
                        <span>{word.word}</span>
                      </div>
                    ))}
                    {result.vocabWords.length > 5 && (
                      <span className="text-xs text-muted-foreground px-2 py-1">
                        +{result.vocabWords.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

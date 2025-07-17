import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, X } from "lucide-react"
import { TranslateResponse } from "@/lib/validation"
import { formatDate } from "@/lib/utils/time"

interface TranslationResult extends TranslateResponse {
  id: string
  inputText: string
  timestamp: number
}

interface TranslationHistoryProps {
  history: TranslationResult[]
  showHistory: boolean
  onToggleHistory: () => void
  onClearHistory: () => void
  onLoadFromHistory: (result: TranslationResult) => void
}

export function TranslationHistory({
  history,
  showHistory,
  onToggleHistory,
  onClearHistory,
  onLoadFromHistory,
}: TranslationHistoryProps) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Translation History</CardTitle>
          <div className="flex gap-2">
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
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No translation history yet
            </p>
          ) : (
            history.map((result) => (
              <div
                key={result.id}
                className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                onClick={() => onLoadFromHistory(result)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{result.inputText}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(result.timestamp)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {result.translatedText}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

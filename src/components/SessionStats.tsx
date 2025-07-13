interface ReviewStats {
  total: number
  completed: number
  remaining: number
}

interface PriorityStats {
  totalDue: number
  priorityMode: string
  priorityRange?: { highest: number; lowest: number }
}

interface SessionStatsProps {
  reviewStats: ReviewStats
  priorityStats: PriorityStats | null
  selectedPriorityMode: "difficulty" | "time"
}

export function SessionStats({
  reviewStats,
  priorityStats,
  selectedPriorityMode,
}: SessionStatsProps) {
  return (
    <>
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
                width: `${(reviewStats.completed / reviewStats.total) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Priority Mode Explanation */}
      {priorityStats && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm">
            <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              {priorityStats.priorityMode === "difficulty"
                ? "🎯 Smart Priority Active"
                : "⏰ Time-based Selection"}
            </div>
            <div className="text-blue-700 dark:text-blue-300">
              {priorityStats.priorityMode === "difficulty" ? (
                <>
                  Showing your most challenging words first.
                  {priorityStats.totalDue > reviewStats.total && (
                    <span>
                      {" "}
                      Selected {reviewStats.total} most important out of{" "}
                      {priorityStats.totalDue} due words.
                    </span>
                  )}
                  {priorityStats.priorityRange && (
                    <span className="block mt-1 text-xs">
                      Difficulty scores:{" "}
                      {Math.round(priorityStats.priorityRange.lowest)} -{" "}
                      {Math.round(priorityStats.priorityRange.highest)} points
                    </span>
                  )}
                </>
              ) : (
                "Showing words in order of when they became due (oldest first)."
              )}
            </div>

            {/* Simple explanation of the difference */}
            <details className="mt-2">
              <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                What&apos;s the difference between priority modes?
              </summary>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <div>
                  <strong>🎯 Smart Priority:</strong> Reviews your hardest words
                  first (words you fail, struggle with, or haven&apos;t seen in
                  a while)
                </div>
                <div>
                  <strong>⏰ Time-based:</strong> Reviews words in order of when
                  they became due (oldest due words first)
                </div>
                <div className="text-blue-500 dark:text-blue-500 pt-1">
                  <em>
                    {selectedPriorityMode === "difficulty"
                      ? "Smart Priority helps you focus on what you need to learn most!"
                      : "Time-based ensures you review words as they become due."}
                  </em>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </>
  )
}

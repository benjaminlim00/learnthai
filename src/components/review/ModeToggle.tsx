import { Play, BookOpen } from "lucide-react"

interface ModeToggleProps {
  viewMode: "review" | "browse"
  onSwitchToReview: () => void
  onSwitchToBrowse: () => void
}

export function ModeToggle({
  viewMode,
  onSwitchToReview,
  onSwitchToBrowse,
}: ModeToggleProps) {
  return (
    <div className="flex justify-center mt-6">
      <div className="flex bg-muted rounded-lg p-1 gap-1">
        <button
          onClick={onSwitchToReview}
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
          onClick={onSwitchToBrowse}
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
  )
}

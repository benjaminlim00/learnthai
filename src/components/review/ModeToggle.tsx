import { Play, BookOpen } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const handleValueChange = (value: string) => {
    if (value === "review") {
      onSwitchToReview()
    } else if (value === "browse") {
      onSwitchToBrowse()
    }
  }

  return (
    <div className="flex justify-center mt-6">
      <Tabs value={viewMode} onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="review" className="gap-2 ">
            <Play className="h-4 w-4" />
            Review Session
          </TabsTrigger>

          <TabsTrigger value="browse" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Browse Vocabulary
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

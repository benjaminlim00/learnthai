import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils/style"

interface LoadingStateProps {
  text?: string
  className?: string
  variant?: "page" | "section" | "inline"
}

function LoadingState({
  text = "Loading...",
  className,
  variant = "section",
}: LoadingStateProps) {
  const baseClasses = {
    page: "min-h-screen bg-background flex items-center justify-center",
    section: "text-center py-8",
    inline: "flex items-center justify-center py-4",
  }

  return (
    <div className={cn(baseClasses[variant], className)}>
      <LoadingSpinner
        size={variant === "page" ? "lg" : "default"}
        text={text}
      />
    </div>
  )
}

export { LoadingState }

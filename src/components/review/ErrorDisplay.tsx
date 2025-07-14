import { AlertCircle } from "lucide-react"

interface ErrorDisplayProps {
  error: string
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md mb-6 flex items-center gap-2">
      <AlertCircle className="h-4 w-4" />
      {error}
    </div>
  )
}

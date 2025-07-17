"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, BookOpen } from "lucide-react"
import { Weakness, WeaknessPriority } from "@/types/pronunciation"
import {
  generateErrorDescription,
  generateErrorLabel,
  getErrorRate,
} from "@/lib/utils/weakness"

const getPriorityStyle = (priority: WeaknessPriority) => {
  switch (priority) {
    case "critical":
      return {
        bg: "bg-red-50 dark:bg-red-950/20",
        border: "border-red-200 dark:border-red-800",
        text: "text-red-800 dark:text-red-200",
        icon: "text-red-500",
        badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      }
    case "high":
      return {
        bg: "bg-orange-50 dark:bg-orange-950/20",
        border: "border-orange-200 dark:border-orange-800",
        text: "text-orange-800 dark:text-orange-200",
        icon: "text-orange-500",
        badge:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      }
    case "medium":
      return {
        bg: "bg-yellow-50 dark:bg-yellow-950/20",
        border: "border-yellow-200 dark:border-yellow-800",
        text: "text-yellow-800 dark:text-yellow-200",
        icon: "text-yellow-500",
        badge:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      }
    default:
      return {
        bg: "bg-blue-50 dark:bg-blue-950/20",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-800 dark:text-blue-200",
        icon: "text-blue-500",
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      }
  }
}

// Map priority level to Badge variant
const getPriorityBadgeVariant = (
  level: string
): "default" | "secondary" | "destructive" | "outline" => {
  switch (level) {
    case "critical":
      return "destructive"
    case "high":
      return "default"
    case "medium":
      return "secondary"
    default:
      return "outline"
  }
}

// Format last practiced date helper
// const formatLastPracticed = (dateString: string) => {
//   const date = new Date(dateString)
//   const now = new Date()
//   const diffMs = now.getTime() - date.getTime()
//   const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

//   if (diffDays === 0) return "Today"
//   if (diffDays === 1) return "Yesterday"
//   if (diffDays < 7) return `${diffDays} days ago`
//   if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
//   return `${Math.floor(diffDays / 30)} months ago`
// }

// Progress bar color helper
const getProgressBarColor = (errorRate: number) => {
  if (errorRate <= 20) return "bg-green-500"
  if (errorRate <= 40) return "bg-yellow-500"
  if (errorRate <= 60) return "bg-orange-500"
  return "bg-red-500"
}

// Improvement trend indicator
const TrendIndicator = ({ weakness }: { weakness: Weakness }) => {
  const errorRate = getErrorRate(weakness)

  if (weakness.total_attempts >= 5) {
    if (errorRate <= 30) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-green-600"></div>
          <span className="font-medium">Improving</span>
        </div>
      )
    } else if (errorRate <= 60) {
      return (
        <div className="flex items-center gap-1 text-yellow-600">
          <div className="w-3 h-0.5 bg-yellow-600"></div>
          <span className="font-medium">Stable</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-orange-600">
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-orange-600"></div>
          <span className="font-medium">Needs Focus</span>
        </div>
      )
    }
  }
  return <span className="text-muted-foreground font-medium">New Area</span>
}

interface ResultsActionCardProps {
  weakness: Weakness
}

export function ResultsActionCard({ weakness }: ResultsActionCardProps) {
  const style = getPriorityStyle(weakness.priority)
  const errorRate = getErrorRate(weakness)

  return (
    <Card className={`${style.border} ${style.bg}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Priority and title */}
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={getPriorityBadgeVariant(weakness.priority)}
                className={`rounded-full ${style.badge}`}
              >
                {weakness.priority.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {generateErrorLabel(weakness.error_type)}
              </span>
            </div>

            {/* Issue description */}
            <h3 className={`font-semibold mb-2 ${style.text}`}>
              {generateErrorDescription(weakness.error_type)}
            </h3>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                {errorRate}% error rate
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {weakness.total_attempts} attempts
              </div>
              {/* <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatLastPracticed(weakness.last_practiced)}
              </div> */}
            </div>

            {/* Progress Visualization */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>
                  {weakness.failed_attempts}/{weakness.total_attempts} needs
                  work
                </span>
              </div>
              <Progress
                value={Math.max(5, 100 - errorRate)}
                className={`h-2 transition-all duration-500 ${getProgressBarColor(
                  errorRate
                )}`}
              />

              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Accuracy</span>
                <span
                  className={`font-medium ${
                    errorRate <= 20
                      ? "text-green-600"
                      : errorRate <= 40
                      ? "text-yellow-600"
                      : errorRate <= 60
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                >
                  {(100 - errorRate).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Improvement Trend Indicator */}
            <div className="mb-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Trend:</span>
                <TrendIndicator weakness={weakness} />
              </div>
            </div>

            {/* Recommendation */}
            <p className={`text-sm ${style.text} font-medium mb-3`}>
              💡 {weakness.recommendation}
            </p>

            {/* Sample mistakes */}
            {weakness.example_words.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Common mistakes:
                </div>
                <div className="flex flex-wrap gap-1">
                  {weakness.example_words.slice(0, 3).map((mistake, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-muted rounded-full"
                    >
                      {mistake}
                    </span>
                  ))}
                  {weakness.example_words.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{weakness.example_words.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => onFocusPractice(weakness)}
            className="ml-4"
          >
            Practice
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button> */}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, BarChart3, Zap, AlertTriangle } from "lucide-react"
import { AnalysisData, WeaknessPriority } from "@/types/pronunciation"
import {
  generateErrorDescription,
  generateErrorLabel,
} from "@/lib/utils/weakness"

const getPriorityColor = (priority: WeaknessPriority) => {
  switch (priority) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200"
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
    case "low":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200"
  }
}

const getErrorRateColor = (errorRate: number) => {
  if (errorRate >= 60) return "bg-red-500"
  if (errorRate >= 40) return "bg-orange-500"
  if (errorRate >= 25) return "bg-yellow-500"
  return "bg-green-500"
}

interface ResultsAlgorithmView {
  analysisData: AnalysisData
  isAnalyzing?: boolean
}

export function ResultsAlgorithmView({
  analysisData,
  isAnalyzing = false,
}: ResultsAlgorithmView) {
  const weaknesses = analysisData.weaknesses

  // export interface Weakness {
  //   frequency: number
  //   priority: WeaknessPriority
  //   example_words: string[]
  // }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Algorithm Analysis
          {isAnalyzing && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">
                Analyzing...
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Pattern Analysis */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Error Pattern Detection
          </h3>

          <div className="space-y-3">
            {weaknesses.map((weakness, index) => {
              const errorRate =
                (weakness.failed_attempts / weakness.total_attempts) * 100

              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm capitalize">
                        {generateErrorLabel(weakness.error_type)}
                      </span>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(weakness.priority)}
                      >
                        {weakness.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {generateErrorDescription(weakness.error_type)}
                    </p>
                  </div>

                  {/* Error Rate Visualization */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Accuracy Progress</span>
                      <span>
                        {weakness.failed_attempts}/{weakness.total_attempts}{" "}
                        need work
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getErrorRateColor(
                          errorRate
                        )}`}
                        style={{
                          width: `${Math.max(5, 100 - errorRate)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Algorithm Factors */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">
                        {weakness.total_attempts}
                      </div>
                      <div className="text-muted-foreground">Attempts</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">
                        {weakness.total_attempts >= 10
                          ? "High"
                          : weakness.total_attempts >= 5
                          ? "Med"
                          : "Low"}
                      </div>
                      <div className="text-muted-foreground">Frequency</div>
                    </div>
                  </div>

                  {/* Smart Recommendation */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Smart Recommendation
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {weakness.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Algorithm Explanation */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            How Priority is Calculated
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 border rounded-lg">
              <div className="font-medium mb-1 text-red-600">
                Error Frequency
              </div>
              <p className="text-muted-foreground">
                Higher frequency of errors = higher priority
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium mb-1 text-orange-600">Error Type</div>
              <p className="text-muted-foreground">
                Critical errors like tones, vowel length, and consonants get
                higher priority
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium mb-1 text-yellow-600">
                Priority Thresholds
              </div>
              <p className="text-muted-foreground">
                Critical: {">"}70% frequency, High: {">"}40%, Medium: {">"}20%,
                Low: ≤20%
              </p>
            </div>
          </div>

          {/* //TODO: get more content */}
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium">Critical Error Types</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tone errors, vowel length, and consonant errors are marked as
              critical when they occur in {">"}50% of attempts
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

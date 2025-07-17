"use client"

import { CardContent, CardTitle } from "@/components/ui"
import { AnalysisData } from "@/types/pronunciation"

interface ResultsInsightsProps {
  analysisData: AnalysisData
}

//TODO: improve UI
export function ResultsInsights({ analysisData }: ResultsInsightsProps) {
  if (analysisData.learning_insights.length === 0) return <></>

  return (
    <CardContent className="p-6 py-4">
      <div className="space-y-3">
        <CardTitle className="flex items-center gap-2 mb-2">
          {/* <Target className="w-5 h-5" /> */}
          Learning Insights
        </CardTitle>

        {analysisData.learning_insights.map((insight, index) => (
          <div
            key={index}
            className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <h4 className="font-medium text-sm mb-1 text-blue-900 dark:text-blue-100">
              {insight.title}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              {insight.description}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {insight.actionable_tip}
            </p>
          </div>
        ))}
      </div>
    </CardContent>
  )
}

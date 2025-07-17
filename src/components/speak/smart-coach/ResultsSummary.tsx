"use client"

import { CardContent, CardTitle } from "@/components/ui/card"
import { AnalysisData } from "@/types/pronunciation"

interface ResultsSummaryProps {
  analysisData: AnalysisData
}

export function ResultsSummary({ analysisData }: ResultsSummaryProps) {
  const summary = analysisData.summary

  return (
    <CardContent className="p-6 py-4">
      <div className="space-y-3">
        <CardTitle className="flex items-center gap-2 mb-2">
          Performance Summary
        </CardTitle>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Issues Stats */}
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-muted-foreground">
              {summary.total_issues}
            </div>
            <div className="text-sm text-muted-foreground">Total Issues</div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-red-600">
              {summary.critical_issues}
            </div>
            <div className="text-sm text-muted-foreground">Critical Issues</div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-orange-600">
              {summary.high_priority_issues}
            </div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </div>

          {/* Progress Indicators */}
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-blue-600 capitalize">
              {summary.estimated_proficiency_level}
            </div>
            <div className="text-sm text-muted-foreground">
              Proficiency Level
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-purple-600 capitalize">
              {summary.overall_improvement_trend}
            </div>
            <div className="text-sm text-muted-foreground">Progress Trend</div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-green-600">
              {summary.suggested_daily_practice_time}m
            </div>
            <div className="text-sm text-muted-foreground">
              Recommended Practice
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  )
}

"use client"

import { CardContent, CardTitle } from "@/components/ui"
import { AnalysisData } from "@/types/pronunciation"
import { ResultsActionCard } from "./ResultsActionCard"

interface ResultsActionListProps {
  analysisData: AnalysisData
}

export function ResultsActionList({ analysisData }: ResultsActionListProps) {
  if (analysisData.weaknesses.length === 0) return <></>

  return (
    <CardContent className="p-6 py-4">
      <div className="space-y-3">
        <CardTitle className="flex items-center gap-2 mb-2">
          Weak areas
        </CardTitle>

        {analysisData.weaknesses.map((weakness, index) => (
          <ResultsActionCard
            key={index}
            weakness={weakness}
            // onFocusPractice={onFocusPractice}
          />
        ))}
      </div>
    </CardContent>
  )
}

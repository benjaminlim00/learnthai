"use client"

import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, BarChart3 } from "lucide-react"
import { AnalysisData } from "@/types/pronunciation"

interface RsultsHeaderProps {
  analysisData: AnalysisData
  selectedTimeframe: number
  onTimeframeChange: (timeframe: number) => void
  showAlgorithmView: boolean
  onToggleAlgorithmView: () => void
}

const AVAILABLE_TIMEFRAMES = [7, 30, 90]

export function ResultsHeader({
  analysisData,
  selectedTimeframe,
  onTimeframeChange,
  showAlgorithmView,
  onToggleAlgorithmView,
}: RsultsHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Smart Pronunciation Coach
        </CardTitle>

        {analysisData.weaknesses.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant={"outline"}
              size="sm"
              onClick={onToggleAlgorithmView}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              {showAlgorithmView ? "Hide" : "Show"} Algorithm
            </Button>
          </div>
        )}
      </div>

      {/* timeframe selector */}
      <div className="flex items-center gap-2 text-sm mt-2">
        <span className="text-muted-foreground">Analysis period:</span>
        <div className="flex gap-1">
          {AVAILABLE_TIMEFRAMES.map((days) => (
            <Button
              key={days}
              variant={selectedTimeframe === days ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeframeChange(days)}
            >
              {days} days
            </Button>
          ))}
        </div>
      </div>
    </CardHeader>
  )
}

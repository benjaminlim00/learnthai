"use client"

import { Card } from "@/components/ui/card"
import { AnalysisData } from "@/types/pronunciation"
import { ResultsAlgorithmView } from "./ResultsAlgorithmView"
import { ResultsSummary } from "./ResultsSummary"
import { ResultsWeaknessCard } from "./ResultsWeaknessCard"
import { SmartCoachFooter } from "./SmartCoachFooter"
import { ResultsHeader } from "./ResultsHeader"
import { ResultsGoodWork } from "./ResultsGoodWork"
import { ResultsInsights } from "./ResultsInsights"

// Interface for pronunciation weakness analysis

interface SmartCoachResultsProps {
  analysisData: AnalysisData
  selectedTimeframe: number
  onTimeframeChange: (timeframe: number) => void
  showAlgorithmView: boolean
  onToggleAlgorithmView: () => void
  onShowExplainer: () => void
}

export function SmartCoachResults({
  analysisData,
  selectedTimeframe,
  onTimeframeChange,
  showAlgorithmView,
  onToggleAlgorithmView,
  onShowExplainer,
}: // onFocusPractice,
SmartCoachResultsProps) {
  return (
    <article className="space-y-4">
      <Card>
        {/* Header with controls */}
        <ResultsHeader
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={onTimeframeChange}
          showAlgorithmView={showAlgorithmView}
          onToggleAlgorithmView={onToggleAlgorithmView}
          analysisData={analysisData}
        />

        {/* Summary Stats */}
        <ResultsSummary analysisData={analysisData} />
        {/* Good work - only shows when no weakness */}
        <ResultsGoodWork analysisData={analysisData} />
        <ResultsInsights analysisData={analysisData} />
      </Card>

      {/* Algorithm Visualization */}
      {showAlgorithmView && (
        <ResultsAlgorithmView
          analysisData={analysisData}
          //TODO: use react query and delete query cache when we do a new speech session
          // we can get the isAnalyzing from the query loading
          // isAnalyzing={isAnalyzing}
        />
      )}

      {/* Weakness Items */}
      {/* //TODONOW: compare with above weakness stats */}
      <section>
        {analysisData.weaknesses.map((weakness, index) => (
          <ResultsWeaknessCard
            key={index}
            weakness={weakness}
            // onFocusPractice={onFocusPractice}
          />
        ))}
      </section>

      {/* Footer Info */}
      <SmartCoachFooter onShowExplainer={onShowExplainer} />
    </article>
  )
}

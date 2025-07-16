"use client"

import { useState, useEffect } from "react"
import { SmartCoachLoading } from "./SmartCoachLoading"
import { SmartCoachError } from "./SmartCoachError"
import { SmartCoachResults } from "./SmartCoachResults"
import { SmartCoachExplainer } from "./SmartCoachExplainer"
import { AnalysisData } from "@/types/pronunciation"

export function SmartCoach() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState(30)
  const [showExplainer, setShowExplainer] = useState(false)
  const [showAlgorithmView, setShowAlgorithmView] = useState(false)

  // Fetch pronunciation analysis data
  const fetchAnalysis = async (days: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/pronunciation-analysis?days=${days}`)

      if (!response.ok) {
        throw new Error("Failed to load pronunciation analysis")
      }

      const data = await response.json()
      setAnalysisData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analysis")
      console.error("Error fetching pronunciation analysis:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis(selectedTimeframe)
  }, [selectedTimeframe])

  // Show explainer modal
  if (showExplainer) {
    return <SmartCoachExplainer onClose={() => setShowExplainer(false)} />
  }

  // Loading state
  if (isLoading) {
    return <SmartCoachLoading />
  }

  // Error state
  if (error || !analysisData) {
    return (
      <SmartCoachError
        error={error}
        onRetry={() => fetchAnalysis(selectedTimeframe)}
      />
    )
  }

  return (
    <SmartCoachResults
      analysisData={analysisData}
      selectedTimeframe={selectedTimeframe}
      onTimeframeChange={setSelectedTimeframe}
      showAlgorithmView={showAlgorithmView}
      onToggleAlgorithmView={() => setShowAlgorithmView(!showAlgorithmView)}
      onShowExplainer={() => setShowExplainer(true)}
    />
  )
}

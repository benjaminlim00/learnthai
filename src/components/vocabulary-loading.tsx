"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

const loadingSteps = [
  "🧠 Analyzing topic...",
  "📚 Searching Thai vocabulary...",
  "🎯 Selecting relevant words...",
  "💭 Generating examples...",
  "✨ Finalizing vocabulary...",
]

export function VocabularyLoading() {
  const [currentStep, setCurrentStep] = useState(0)
  const [dots, setDots] = useState(1)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length)
    }, 1000)

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev >= 3 ? 1 : prev + 1))
    }, 500)

    return () => {
      clearInterval(stepInterval)
      clearInterval(dotsInterval)
    }
  }, [])

  return (
    <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          {/* Main loading icon */}
          <div className="relative">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl animate-pulse">🇹🇭</span>
            </div>
          </div>

          {/* Loading steps */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Generating Thai Vocabulary
            </h3>
            <p className="text-muted-foreground">
              {loadingSteps[currentStep]}
              {".".repeat(dots)}
            </p>
          </div>

          {/* Progress bars */}
          <div className="space-y-2">
            {/* <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>
                {Math.round(((currentStep + 1) / loadingSteps.length) * 100)}%
              </span>
            </div> */}
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${((currentStep + 1) / loadingSteps.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Fun animated elements */}
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Please wait while we generate your Thai vocabulary...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

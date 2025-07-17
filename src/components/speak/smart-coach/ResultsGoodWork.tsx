"use client"

import { CardContent } from "@/components/ui/card"
import { AnalysisData } from "@/types/pronunciation"
import { CheckCircle, Star, Trophy } from "lucide-react"

interface ResultsGoodWorkProps {
  analysisData: AnalysisData
}

export function ResultsGoodWork({ analysisData }: ResultsGoodWorkProps) {
  if (analysisData.weaknesses.length !== 0) return <></>

  return (
    <CardContent className="p-6 py-4">
      {/* Success Message */}
      <section className="relative text-center py-8 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-lg border border-primary/20 overflow-hidden animate-fade-in">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <Star className="absolute top-4 left-4 w-6 h-6 text-primary/20 animate-pulse" />
          <Star className="absolute top-6 right-6 w-4 h-4 text-primary/30 animate-pulse [animation-delay:0.5s]" />
          <Star className="absolute bottom-4 left-6 w-5 h-5 text-primary/25 animate-pulse [animation-delay:0.3s]" />
          <Star className="absolute bottom-6 right-4 w-6 h-6 text-primary/20 animate-pulse [animation-delay:0.7s]" />
        </div>

        <div className="relative">
          {/* Trophy icon with glow effect */}
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <Trophy className="w-16 h-16 text-primary mx-auto animate-bounce-subtle" />
          </div>

          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
            Great work!
          </h2>
          <p className="text-lg text-muted-foreground mb-3">
            No major pronunciation issues found
          </p>
          <p className="text-sm text-muted-foreground/80 max-w-md mx-auto">
            Keep up the great work—or challenge yourself with more advanced
            vocabulary!
          </p>

          {/* Success badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">
              Excellent Pronunciation
            </span>
          </div>
        </div>
      </section>
    </CardContent>
  )
}

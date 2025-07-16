"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Target } from "lucide-react"

interface SmartCoachErrorProps {
  error: string | null
  onRetry: () => void
}

export function SmartCoachError({ error, onRetry }: SmartCoachErrorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Smart Pronunciation Coach
        </CardTitle>
      </CardHeader>
      <CardContent>
        <section className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {error || "Failed to load analysis"}
          </p>
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        </section>
      </CardContent>
    </Card>
  )
}

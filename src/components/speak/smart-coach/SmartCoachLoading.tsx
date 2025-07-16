"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"

export function SmartCoachLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Smart Pronunciation Coach
        </CardTitle>
      </CardHeader>
      <CardContent>
        <section className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Analyzing your pronunciation patterns...
            </p>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

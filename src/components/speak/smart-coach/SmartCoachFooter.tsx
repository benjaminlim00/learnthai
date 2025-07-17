"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target } from "lucide-react"

interface SmartCoachFooterProps {
  onShowExplainer: () => void
}

export function SmartCoachFooter({ onShowExplainer }: SmartCoachFooterProps) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <aside className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0" />
          <span>
            Smart Coach analyzes your pronunciation patterns using AI and Thai
            linguistic rules.
            <Button
              variant="link"
              className="p-0 h-auto text-sm underline ml-1"
              onClick={onShowExplainer}
            >
              Learn more about how it works
            </Button>
          </span>
        </aside>
      </CardContent>
    </Card>
  )
}

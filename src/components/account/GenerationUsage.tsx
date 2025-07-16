import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface GenerationUsageProps {
  generationStats: {
    dailyUsed: number
    dailyLimit: number
    remaining: number
    resetTime: string
  }
}

export function GenerationUsage({ generationStats }: GenerationUsageProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Generation Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Daily Generation Limit
              </p>
              <p className="text-sm text-muted-foreground">
                {generationStats.dailyUsed} / {generationStats.dailyLimit}{" "}
                generations used today
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {generationStats.remaining}
              </div>
              <div className="text-sm text-muted-foreground">remaining</div>
            </div>
          </div>
          <Progress
            value={
              (generationStats.dailyUsed / generationStats.dailyLimit) * 100
            }
            className="h-2"
          />
          <div className="text-sm text-muted-foreground">
            <span>Resets at {generationStats.resetTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

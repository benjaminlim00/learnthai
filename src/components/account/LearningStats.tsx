import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LearningStatsProps {
  stats: {
    total: number
    new: number
    learning: number
    mastered: number
  }
}

export function LearningStats({ stats }: LearningStatsProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Learning Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {stats.total}
            </div>
            <div className="text-sm text-muted-foreground">Total Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <div className="text-sm text-muted-foreground">New</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.learning}
            </div>
            <div className="text-sm text-muted-foreground">Learning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.mastered}
            </div>
            <div className="text-sm text-muted-foreground">Mastered</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

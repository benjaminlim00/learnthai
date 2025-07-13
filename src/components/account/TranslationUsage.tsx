import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TranslationUsage() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Translation Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Daily Translation Limit
              </p>
              <p className="text-sm text-muted-foreground">
                10 translations per day
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">10</div>
              <div className="text-sm text-muted-foreground">per day</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold text-foreground">500</div>
              <div className="text-sm text-muted-foreground">
                Character limit
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold text-foreground">Free</div>
              <div className="text-sm text-muted-foreground">No usage fees</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>• Text input limited to 500 characters per translation</p>
            <p>• Rate limit resets every day at midnight (UTC)</p>
            <p>• Supports Thai ↔ English with romanization</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

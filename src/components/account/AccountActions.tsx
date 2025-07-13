import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AccountActionsProps {
  onSignOut: () => void
}

export function AccountActions({ onSignOut }: AccountActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Sign Out</h3>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <Button onClick={onSignOut} variant="destructive">
              Sign Out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

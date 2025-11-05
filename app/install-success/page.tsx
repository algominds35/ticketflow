import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function InstallSuccessPage({
  searchParams,
}: {
  searchParams: { team?: string }
}) {
  const teamName = searchParams.team || 'your workspace'

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">🎉 Installation Complete!</CardTitle>
          <CardDescription>
            TicketFlow has been added to {teamName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">🚀 Quick Start:</h3>
              <ol className="space-y-2 text-sm">
                <li>1. Go to any Slack channel</li>
                <li>2. Type <code className="bg-background px-2 py-1 rounded">/ticket</code></li>
                <li>3. Fill in the form and create your first ticket!</li>
              </ol>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">💡 Pro Tip:</h3>
              <p className="text-sm">
                Right-click any message → "Create ticket" to turn conversations into tickets instantly!
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <h3 className="font-semibold mb-2 text-blue-900">📊 Dashboard Access:</h3>
              <p className="text-sm text-blue-800 mb-3">
                View and manage all your tickets at:
              </p>
              <Link href="/signup">
                <Button className="w-full" size="lg">
                  Create Dashboard Account
                </Button>
              </Link>
              <p className="text-xs text-blue-700 mt-2">
                Use your work email to sign up
              </p>
            </div>
          </div>

          <div className="text-center">
            <a 
              href="slack://open"
              className="text-sm text-primary hover:underline"
            >
              ← Back to Slack
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


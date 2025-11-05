'use client'

import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export function ConnectSlackBanner() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Connect Your Slack Workspace
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Link your Slack account to view and manage tickets from your organization.
            </p>
          </div>
        </div>
        <Link
          href="/api/slack/oauth/connect"
          className="ml-4 flex-shrink-0 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Connect Slack
        </Link>
      </div>
    </div>
  )
}


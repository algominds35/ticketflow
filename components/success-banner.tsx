'use client'

import { CheckCircle2, X } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SuccessBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get('connected') === 'true') {
      setShow(true)
    }
  }, [searchParams])

  if (!show) return null

  const handleClose = () => {
    setShow(false)
    // Remove the query param
    router.push('/dashboard')
  }

  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircle2 className="h-5 w-5 text-green-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Slack Connected Successfully!
            </h3>
            <p className="text-sm text-green-700 mt-1">
              You can now view and manage tickets from your organization.
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="ml-4 flex-shrink-0 text-green-700 hover:text-green-900"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}


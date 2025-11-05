import { Badge } from '@/components/ui/badge'
import { TicketStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: TicketStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    open: {
      label: 'Open',
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    in_progress: {
      label: 'In Progress',
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
    closed: {
      label: 'Closed',
      className: 'bg-green-500 hover:bg-green-600 text-white',
    },
  }

  const { label, className: statusClassName } = config[status]

  return (
    <Badge className={cn(statusClassName, className)}>
      {label}
    </Badge>
  )
}


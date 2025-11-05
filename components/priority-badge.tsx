import { Badge } from '@/components/ui/badge'
import { TicketPriority } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PriorityBadgeProps {
  priority: TicketPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = {
    low: {
      label: 'Low',
      className: 'bg-gray-500 hover:bg-gray-600 text-white',
    },
    medium: {
      label: 'Medium',
      className: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
    high: {
      label: 'High',
      className: 'bg-red-500 hover:bg-red-600 text-white',
    },
  }

  const { label, className: priorityClassName } = config[priority]

  return (
    <Badge className={cn(priorityClassName, className)}>
      {label}
    </Badge>
  )
}


'use client'

import { Badge } from '@/components/ui/badge'

interface ProgressBadgeProps {
  filled: number
  total: number
  completed: number
}

export function ProgressBadge({ filled, total, completed }: ProgressBadgeProps) {
  return (
    <Badge variant="secondary" className="text-xs font-normal whitespace-nowrap">
      {filled}/{total} filled, {completed} done
    </Badge>
  )
}

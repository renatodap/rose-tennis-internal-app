'use client'

import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

interface BudgetBarProps {
  estimated: number
  purchased: number
  itemsTotal: number
  itemsPurchased: number
}

export function BudgetBar({ estimated, purchased, itemsTotal, itemsPurchased }: BudgetBarProps) {
  const percent = estimated > 0 ? Math.round((purchased / estimated) * 100) : 0

  return (
    <Card className="border-rose-silver/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-rose-red" />
          <span className="font-semibold text-sm">Budget</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            ${purchased.toFixed(2)} / ${estimated.toFixed(2)} estimated
          </span>
          <span className="text-xs text-muted-foreground">
            {itemsPurchased}/{itemsTotal} items
          </span>
        </div>
        <Progress value={percent} className="h-2" />
      </CardContent>
    </Card>
  )
}

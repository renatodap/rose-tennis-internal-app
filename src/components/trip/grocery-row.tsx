'use client'

import { Checkbox } from '@/components/ui/checkbox'
import type { TripGroceryItem } from '@/types/database'

interface GroceryRowProps {
  item: TripGroceryItem
  playerId: number | null
  onToggle: (itemId: number) => void
  isPending: boolean
}

export function GroceryRow({ item, playerId, onToggle, isPending }: GroceryRowProps) {
  const canToggle = playerId !== null
  const purchaserName = item.purchaser
    ? `${item.purchaser.first_name} ${item.purchaser.last_name}`
    : null

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-muted/50 min-h-[44px]">
      {canToggle ? (
        <Checkbox
          checked={item.is_purchased}
          disabled={isPending}
          onCheckedChange={() => onToggle(item.id)}
          className="shrink-0"
        />
      ) : (
        <div className="w-4 h-4 shrink-0 rounded-sm border border-muted-foreground/30" />
      )}

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            item.is_purchased
              ? 'line-through text-muted-foreground'
              : 'text-foreground'
          }`}
        >
          {item.item_name}
        </p>
        {item.is_purchased && purchaserName && (
          <p className="text-xs text-muted-foreground">by {purchaserName}</p>
        )}
      </div>

      {item.quantity && (
        <span className="text-xs text-muted-foreground shrink-0">
          {item.quantity}
        </span>
      )}

      {item.estimated_price !== null && item.estimated_price > 0 && (
        <span className="text-xs font-medium text-muted-foreground shrink-0 w-[50px] text-right">
          ${item.estimated_price.toFixed(2)}
        </span>
      )}
    </div>
  )
}

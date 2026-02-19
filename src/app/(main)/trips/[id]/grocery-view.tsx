'use client'

import { useMemo, useState, useTransition } from 'react'
import { useUser } from '@/hooks/use-user'
import { toggleGroceryPurchased } from '@/lib/actions/trip-details'
import { BudgetBar } from '@/components/trip/budget-bar'
import { GroceryRow } from '@/components/trip/grocery-row'
import type { TripGroceryItem, GroceryCategory } from '@/types/database'

const CATEGORY_LABELS: Record<GroceryCategory, string> = {
  produce: 'Produce',
  meat: 'Meat',
  dairy: 'Dairy',
  bakery: 'Bakery',
  frozen: 'Frozen',
  canned: 'Canned',
  dry_goods: 'Dry Goods',
  condiments: 'Condiments',
  spices: 'Spices',
  breakfast: 'Breakfast',
  snacks: 'Snacks',
  beverages: 'Beverages',
  household: 'Household',
}

interface GroceryViewProps {
  groceryItems: TripGroceryItem[]
  groceryBudget: {
    estimated_total: number
    purchased_total: number
    items_total: number
    items_purchased: number
  }
}

export function GroceryView({ groceryItems, groceryBudget }: GroceryViewProps) {
  const { player } = useUser()
  const [isPending, startTransition] = useTransition()
  const [activeCategory, setActiveCategory] = useState<GroceryCategory | 'all'>('all')
  const playerId = player?.id ?? null

  const categories = useMemo(() => {
    const cats = new Set(groceryItems.map((item) => item.category))
    return Array.from(cats).sort() as GroceryCategory[]
  }, [groceryItems])

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return groceryItems
    return groceryItems.filter((item) => item.category === activeCategory)
  }, [groceryItems, activeCategory])

  const groupedItems = useMemo(() => {
    const groups: Record<string, TripGroceryItem[]> = {}
    for (const item of filteredItems) {
      const key = item.category
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    }
    return groups
  }, [filteredItems])

  function handleToggle(itemId: number) {
    if (!playerId) return
    startTransition(async () => {
      await toggleGroceryPurchased(itemId, playerId)
    })
  }

  return (
    <div className="space-y-4">
      <BudgetBar
        estimated={groceryBudget.estimated_total}
        purchased={groceryBudget.purchased_total}
        itemsTotal={groceryBudget.items_total}
        itemsPurchased={groceryBudget.items_purchased}
      />

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-h-[36px] transition-colors ${
            activeCategory === 'all'
              ? 'bg-rose-red text-white'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-h-[36px] transition-colors ${
              activeCategory === cat
                ? 'bg-rose-red text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Grouped items */}
      {Object.keys(groupedItems).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wide">
                {CATEGORY_LABELS[category as GroceryCategory] ?? category}
              </h3>
              <div className="space-y-1">
                {items.map((item) => (
                  <GroceryRow
                    key={item.id}
                    item={item}
                    playerId={playerId}
                    onToggle={handleToggle}
                    isPending={isPending}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-8">
          No grocery items found.
        </p>
      )}
    </div>
  )
}

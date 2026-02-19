'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, Clock } from 'lucide-react'
import type { TripMeal } from '@/types/database'

const MEAL_BADGE_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-100 text-amber-700',
  lunch: 'bg-green-100 text-green-700',
  dinner: 'bg-rose-red/10 text-rose-red',
  snack: 'bg-gray-100 text-gray-600',
}

interface MealCardProps {
  meal: TripMeal
}

export function MealCard({ meal }: MealCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const hasRecipe = !!meal.recipe_content

  return (
    <Card className="border-rose-silver/30">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={MEAL_BADGE_COLORS[meal.meal_type] ?? MEAL_BADGE_COLORS.snack}>
                {meal.meal_type}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm">{meal.name}</h3>
          </div>
          {(meal.prep_time_min || meal.cook_time_min) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" />
              <span>
                {meal.prep_time_min ? `${meal.prep_time_min}m prep` : ''}
                {meal.prep_time_min && meal.cook_time_min ? ' + ' : ''}
                {meal.cook_time_min ? `${meal.cook_time_min}m cook` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {meal.description && (
          <p className="text-xs text-muted-foreground mb-2">{meal.description}</p>
        )}

        {/* Nutrition chips */}
        {meal.nutrition && (
          <div className="flex gap-2 flex-wrap mb-2">
            <NutritionChip label="kcal" value={meal.nutrition.kcal} />
            <NutritionChip label="carbs" value={`${meal.nutrition.carbs_g}g`} />
            <NutritionChip label="protein" value={`${meal.nutrition.protein_g}g`} />
            <NutritionChip label="fat" value={`${meal.nutrition.fat_g}g`} />
          </div>
        )}

        {/* Recipe collapsible */}
        {hasRecipe && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-xs min-h-[44px] px-0 hover:bg-transparent text-rose-red hover:text-rose-red/80"
              >
                <span>{isOpen ? 'Hide Recipe' : 'View Recipe'}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2 border-t border-rose-silver/20">
                <RecipeContent content={meal.recipe_content!} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}

function NutritionChip({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
      <span className="font-medium">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  )
}

function RecipeContent({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-1 text-sm">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={i} className="h-2" />
        if (trimmed.startsWith('## ')) {
          return (
            <p key={i} className="font-semibold text-sm mt-2">
              {trimmed.replace('## ', '')}
            </p>
          )
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return (
            <p key={i} className="font-semibold text-sm mt-2">
              {trimmed.replace(/\*\*/g, '')}
            </p>
          )
        }
        return (
          <p key={i} className="text-xs text-muted-foreground">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, UserPlus, X } from 'lucide-react'
import type { TripTask } from '@/types/database'

const CATEGORY_COLORS: Record<string, string> = {
  cooking: 'bg-orange-100 text-orange-700',
  dishes: 'bg-blue-100 text-blue-700',
  cleanup: 'bg-green-100 text-green-700',
  shopping: 'bg-purple-100 text-purple-700',
  packing: 'bg-amber-100 text-amber-700',
  driving: 'bg-gray-100 text-gray-700',
  night_prep: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-600',
}

interface TaskCardProps {
  task: TripTask
  playerId: number | null
  onSignUp: (taskId: number) => void
  onWithdraw: (taskId: number) => void
  onMarkDone: (signupId: number) => void
  isPending: boolean
}

export function TaskCard({
  task,
  playerId,
  onSignUp,
  onWithdraw,
  onMarkDone,
  isPending,
}: TaskCardProps) {
  const signups = task.signups ?? []
  const filledSlots = signups.length
  const isFull = filledSlots >= task.slots_needed

  const mySignup = playerId
    ? signups.find((s) => s.player_id === playerId)
    : null
  const isSignedUp = !!mySignup
  const isDone = !!mySignup?.completed_at

  const canSignUp = playerId !== null && !isSignedUp && !isFull
  const canWithdraw = playerId !== null && isSignedUp && !isDone
  const canMarkDone = playerId !== null && isSignedUp && !isDone

  return (
    <Card className="border-rose-silver/30">
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-sm flex-1">{task.title}</h4>
          <Badge className={CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.other}>
            {task.category.replace('_', ' ')}
          </Badge>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
        )}

        {/* Time slot */}
        {task.time_slot && (
          <p className="text-xs text-muted-foreground mb-2">{task.time_slot}</p>
        )}

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            {Array.from({ length: task.slots_needed }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < filledSlots ? 'bg-rose-red' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {filledSlots}/{task.slots_needed} filled
          </span>
        </div>

        {/* Signed up players */}
        {signups.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {signups.map((signup) => {
              const initials = signup.player
                ? `${signup.player.first_name[0]}${signup.player.last_name[0]}`
                : '??'
              const isCompleted = !!signup.completed_at
              return (
                <div
                  key={signup.id}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  title={
                    signup.player
                      ? `${signup.player.first_name} ${signup.player.last_name}`
                      : 'Unknown'
                  }
                >
                  {isCompleted && (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  )}
                  <span>{initials}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Action buttons */}
        {playerId !== null && (
          <div className="flex gap-2 mt-2">
            {canSignUp && (
              <Button
                size="sm"
                variant="outline"
                className="min-h-[44px] text-xs"
                disabled={isPending}
                onClick={() => onSignUp(task.id)}
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Sign Up
              </Button>
            )}
            {canWithdraw && (
              <Button
                size="sm"
                variant="outline"
                className="min-h-[44px] text-xs text-destructive border-destructive/30"
                disabled={isPending}
                onClick={() => onWithdraw(task.id)}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Withdraw
              </Button>
            )}
            {canMarkDone && mySignup && (
              <Button
                size="sm"
                className="min-h-[44px] text-xs bg-green-600 hover:bg-green-700"
                disabled={isPending}
                onClick={() => onMarkDone(mySignup.id)}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Mark Done
              </Button>
            )}
            {isDone && (
              <Badge className="bg-green-100 text-green-700">Completed</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

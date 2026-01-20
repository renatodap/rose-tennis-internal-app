import { Suspense } from 'react'
import { getPlayers } from '@/lib/actions/players'
import { getTags } from '@/lib/actions/tags'
import { PlayerCard } from '@/components/player-card'
import { Skeleton } from '@/components/ui/skeleton'
import { RosterFilters } from './roster-filters'
import type { Gender } from '@/types/database'

interface RosterPageProps {
  searchParams: Promise<{ gender?: string; tag?: string }>
}

function PlayersSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  )
}

export default async function RosterPage({ searchParams }: RosterPageProps) {
  const params = await searchParams
  const genderFilter = params.gender as Gender | undefined
  const tagFilter = params.tag ? parseInt(params.tag) : undefined

  const [players, tags] = await Promise.all([
    getPlayers({ gender: genderFilter, tagId: tagFilter }),
    getTags(),
  ])

  const menCount = players?.filter(p => p.gender === 'male').length || 0
  const womenCount = players?.filter(p => p.gender === 'female').length || 0

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Roster</h1>
          <p className="text-sm text-muted-foreground">
            {menCount} men, {womenCount} women
          </p>
        </div>
      </div>

      {/* Filters */}
      <RosterFilters tags={tags || []} />

      {/* Players List */}
      <Suspense fallback={<PlayersSkeleton />}>
        <div className="space-y-3 mt-4">
          {players && players.length > 0 ? (
            players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No players found
            </div>
          )}
        </div>
      </Suspense>
    </div>
  )
}

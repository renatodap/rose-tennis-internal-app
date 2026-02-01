import Link from 'next/link'
import { getPlayers } from '@/lib/actions/players'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, FileText } from 'lucide-react'
import { RosterFilter } from './roster-filter'
import type { Gender } from '@/types/database'

interface PageProps {
  searchParams: Promise<{ gender?: string; q?: string }>
}

export default async function RosterPage({ searchParams }: PageProps) {
  const params = await searchParams
  const gender = params.gender as Gender | undefined
  const search = params.q?.toLowerCase()

  const players = await getPlayers(gender ? { gender } : undefined)

  const filtered = search
    ? players.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(search)
      )
    : players

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Roster</h1>

      <RosterFilter currentGender={gender} currentSearch={search} />

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map(player => (
            <Link key={player.id} href={`/roster/${player.id}`}>
              <Card className="border-rose-silver/30 hover:border-rose-red/30 transition-colors">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {player.is_captain && <Star className="h-4 w-4 text-rose-orange fill-rose-orange" />}
                    <div>
                      <p className="font-medium text-sm">
                        {player.first_name} {player.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {player.gender === 'male' ? "Men's" : "Women's"}
                        {player.is_captain && ' · Captain'}
                        {player.class_year && ` · ${player.class_year}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-rose-silver/30">
          <CardContent className="p-6 text-center text-muted-foreground">
            No players found
          </CardContent>
        </Card>
      )}
    </div>
  )
}

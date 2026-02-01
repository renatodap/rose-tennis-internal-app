import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPlayer } from '@/lib/actions/players'
import { getPlayerNotes } from '@/lib/actions/notes'
import { NoteCard } from '@/components/note-card'
import { getPlayers } from '@/lib/actions/players'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Star } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PlayerDetailPage({ params }: PageProps) {
  const { id } = await params
  const playerId = parseInt(id)
  if (isNaN(playerId)) notFound()

  const [player, notes, allPlayers] = await Promise.all([
    getPlayer(playerId),
    getPlayerNotes(playerId),
    getPlayers(),
  ])

  if (!player) notFound()

  const playerNames: Record<number, string> = {}
  for (const p of allPlayers) {
    playerNames[p.id] = `${p.first_name} ${p.last_name.charAt(0)}.`
  }

  return (
    <div className="p-4 space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/roster">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Roster
        </Link>
      </Button>

      <div>
        <div className="flex items-center gap-2">
          {player.is_captain && <Star className="h-5 w-5 text-rose-orange fill-rose-orange" />}
          <h1 className="text-xl font-semibold">{player.first_name} {player.last_name}</h1>
        </div>
        <div className="flex gap-2 mt-1">
          <Badge variant="outline">{player.gender === 'male' ? "Men's" : "Women's"}</Badge>
          {player.class_year && <Badge variant="outline">{player.class_year}</Badge>}
          {player.is_captain && <Badge className="bg-rose-orange text-white">Captain</Badge>}
        </div>
        {player.player_tags && player.player_tags.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {player.player_tags.map(pt => (
              <Badge key={pt.tags.id} style={{ backgroundColor: pt.tags.color }} className="text-white text-xs">
                {pt.tags.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Notes ({notes.length})
        </h2>
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map(note => (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <NoteCard note={note} playerNames={playerNames} />
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-rose-silver/30">
            <CardContent className="p-6 text-center text-muted-foreground">
              No notes mentioning this player
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

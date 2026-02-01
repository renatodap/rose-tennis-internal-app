import Link from 'next/link'
import { getNotes } from '@/lib/actions/notes'
import { getPlayers } from '@/lib/actions/players'
import { NoteCard } from '@/components/note-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import type { NoteType } from '@/types/database'
import { NotesFilter } from './notes-filter'

interface PageProps {
  searchParams: Promise<{ type?: string; q?: string }>
}

export default async function NotesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const noteType = params.type as NoteType | undefined
  const search = params.q

  const [notes, players] = await Promise.all([
    getNotes({
      note_type: noteType,
      search: search || undefined,
    }),
    getPlayers(),
  ])

  const playerNames: Record<number, string> = {}
  for (const p of players) {
    playerNames[p.id] = `${p.first_name} ${p.last_name.charAt(0)}.`
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notes</h1>
        <Button size="sm" asChild className="bg-rose-red hover:bg-rose-red/90">
          <Link href="/notes/new">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Link>
        </Button>
      </div>

      <NotesFilter currentType={noteType} currentSearch={search} />

      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <NoteCard note={note} playerNames={playerNames} />
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-rose-silver/30">
          <CardContent className="p-6 text-center text-muted-foreground">
            {search ? `No notes matching "${search}"` : 'No notes yet'}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

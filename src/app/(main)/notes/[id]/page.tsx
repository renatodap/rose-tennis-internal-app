import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNote } from '@/lib/actions/notes'
import { getPlayers } from '@/lib/actions/players'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { NoteActions } from './note-actions'

const noteTypeConfig: Record<string, { label: string; color: string }> = {
  practice: { label: 'Practice', color: 'bg-blue-500 text-white' },
  match: { label: 'Match Notes', color: 'bg-rose-red text-white' },
  pre_match: { label: 'Pre-Match', color: 'bg-rose-orange text-white' },
  post_match: { label: 'Post-Match', color: 'bg-amber-600 text-white' },
  practice_plan: { label: 'Practice Plan', color: 'bg-indigo-500 text-white' },
  film_review: { label: 'Film Review', color: 'bg-yellow-600 text-white' },
  general: { label: 'General', color: 'bg-slate-500 text-white' },
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NoteDetailPage({ params }: PageProps) {
  const { id } = await params
  const noteId = parseInt(id)
  if (isNaN(noteId)) notFound()

  const [note, players] = await Promise.all([
    getNote(noteId),
    getPlayers(),
  ])

  if (!note) notFound()

  const config = noteTypeConfig[note.note_type] ?? noteTypeConfig.general
  const mentionedPlayers = players.filter(p => note.player_mentions.includes(p.id))

  const visibilityLabel = {
    private: 'Private',
    team: 'Shared with team',
    specific: 'Shared with specific players',
  }[note.visibility]

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/notes">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <NoteActions noteId={note.id} />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge className={config.color}>{config.label}</Badge>
          <span className="text-sm text-muted-foreground">
            {format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}
          </span>
        </div>
        <h1 className="text-xl font-semibold">{note.title}</h1>
      </div>

      {note.content && (
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-foreground">{note.content}</p>
        </div>
      )}

      {note.key_points.length > 0 && (
        <Card className="border-rose-silver/30">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Key Points</h3>
            <ul className="space-y-1">
              {note.key_points.map((point, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-rose-red">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {mentionedPlayers.length > 0 && (
        <Card className="border-rose-silver/30">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Players</h3>
            <div className="flex flex-wrap gap-2">
              {mentionedPlayers.map(p => (
                <Link key={p.id} href={`/roster/${p.id}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-rose-silver/20">
                    {p.first_name} {p.last_name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {note.ai_raw_output?.related_notes && note.ai_raw_output.related_notes.length > 0 && (
        <Card className="border-rose-silver/30">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Related Notes</h3>
            <div className="space-y-1">
              {note.ai_raw_output.related_notes.map(rn => (
                <Link key={rn.id} href={`/notes/${rn.id}`} className="block text-sm text-rose-red hover:underline">
                  {rn.title}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">{visibilityLabel}</p>
    </div>
  )
}

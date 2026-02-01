import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Note } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'

const noteTypeConfig: Record<string, { label: string; color: string }> = {
  practice: { label: 'Practice', color: 'bg-blue-500 text-white' },
  match: { label: 'Match', color: 'bg-rose-red text-white' },
  pre_match: { label: 'Pre-Match', color: 'bg-rose-orange text-white' },
  post_match: { label: 'Post-Match', color: 'bg-amber-600 text-white' },
  practice_plan: { label: 'Practice Plan', color: 'bg-indigo-500 text-white' },
  film_review: { label: 'Film Review', color: 'bg-yellow-600 text-white' },
  general: { label: 'General', color: 'bg-slate-500 text-white' },
}

interface NoteCardProps {
  note: Note
  playerNames?: Record<number, string>
}

export function NoteCard({ note, playerNames }: NoteCardProps) {
  const config = noteTypeConfig[note.note_type] ?? noteTypeConfig.general
  const timeAgo = formatDistanceToNow(new Date(note.created_at), { addSuffix: true })

  return (
    <Card className="border-rose-silver/30">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={config.color}>{config.label}</Badge>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
            <h3 className="font-medium text-foreground truncate">{note.title}</h3>
            {note.content && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {note.content}
              </p>
            )}
          </div>
        </div>
        {note.player_mentions.length > 0 && playerNames && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {note.player_mentions.map(id => (
              playerNames[id] ? (
                <span key={id} className="text-xs bg-rose-silver/20 text-muted-foreground px-2 py-0.5 rounded-full">
                  {playerNames[id]}
                </span>
              ) : null
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createNote } from '@/lib/actions/notes'
import { buildAIContext, parseNoteImages } from '@/lib/actions/ai'
import { getPlayers } from '@/lib/actions/players'
import { getUpcomingEvents } from '@/lib/actions/events'
import { useUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Camera, Image, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NoteType, AIParsedResult, Player, Event } from '@/types/database'

const noteTypes: { value: NoteType; label: string }[] = [
  { value: 'practice', label: 'Practice' },
  { value: 'match', label: 'Match' },
  { value: 'pre_match', label: 'Pre-Match' },
  { value: 'post_match', label: 'Post-Match' },
  { value: 'practice_plan', label: 'Practice Plan' },
  { value: 'film_review', label: 'Film Review' },
  { value: 'general', label: 'General' },
]

type Step = 'input' | 'review'

export default function NewNotePage() {
  const router = useRouter()
  const { user } = useUser()

  const [step, setStep] = useState<Step>('input')
  const [noteType, setNoteType] = useState<NoteType>('general')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [eventId, setEventId] = useState<number | null>(null)
  const [visibility, setVisibility] = useState<'private' | 'team' | 'specific'>('private')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // AI review state
  const [aiResult, setAiResult] = useState<AIParsedResult | null>(null)
  const [editedText, setEditedText] = useState('')
  const [selectedPlayers, setSelectedPlayers] = useState<{ id: number; name: string }[]>([])
  const [editedKeyPoints, setEditedKeyPoints] = useState<string[]>([])

  // Data loaded for review
  const [players, setPlayers] = useState<Player[]>([])
  const [events, setEvents] = useState<Event[]>([])

  function handleImageCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    Array.from(files).slice(0, 5 - images.length).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  async function handleParseAndReview() {
    if (!user) return
    setLoading(true)

    try {
      const [playersData, eventsData, context] = await Promise.all([
        getPlayers(),
        getUpcomingEvents(20),
        buildAIContext(user.id),
      ])

      setPlayers(playersData)
      setEvents(eventsData)

      const result = await parseNoteImages(images, context)
      setAiResult(result)
      setEditedText(result.extracted_text)
      setEditedKeyPoints([...result.key_points])

      // Match player names to IDs
      const matched = result.players_mentioned
        .map(name => {
          const player = playersData.find(p =>
            `${p.first_name} ${p.last_name}`.toLowerCase() === name.toLowerCase()
          )
          return player ? { id: player.id, name: `${player.first_name} ${player.last_name}` } : null
        })
        .filter(Boolean) as { id: number; name: string }[]

      setSelectedPlayers(matched)

      if (result.related_events?.[0]) {
        setEventId(result.related_events[0].id)
      }

      setStep('review')
    } catch (err) {
      console.error('AI parse error:', err)
      alert('Failed to parse images. Please try again or enter text manually.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!user || !title.trim()) return
    setSaving(true)

    try {
      const finalContent = step === 'review' ? editedText : content
      const finalMentions = step === 'review' ? selectedPlayers.map(p => p.id) : []
      const finalKeyPoints = step === 'review' ? editedKeyPoints.filter(Boolean) : []

      await createNote({
        author_id: user.id,
        note_type: noteType,
        title: title.trim(),
        content: finalContent,
        event_id: eventId,
        visibility,
        player_mentions: finalMentions,
        key_points: finalKeyPoints,
        ai_raw_output: aiResult as unknown as Record<string, unknown> | null,
      })

      router.push('/notes')
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save note.')
    } finally {
      setSaving(false)
    }
  }

  function togglePlayer(player: { id: number; name: string }) {
    setSelectedPlayers(prev =>
      prev.some(p => p.id === player.id)
        ? prev.filter(p => p.id !== player.id)
        : [...prev, player]
    )
  }

  if (step === 'review' && aiResult) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setStep('input')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">Review AI Results</h1>
        </div>
        <p className="text-sm text-muted-foreground">Review and edit before saving</p>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title" />
        </div>

        <div className="space-y-2">
          <Label>Extracted Text</Label>
          <Textarea
            value={editedText}
            onChange={e => setEditedText(e.target.value)}
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label>Players Mentioned</Label>
          <div className="flex flex-wrap gap-2">
            {players.map(p => {
              const fullName = `${p.first_name} ${p.last_name}`
              const isSelected = selectedPlayers.some(sp => sp.id === p.id)
              return (
                <button key={p.id} onClick={() => togglePlayer({ id: p.id, name: fullName })}>
                  <Badge
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn('cursor-pointer', isSelected && 'bg-rose-red hover:bg-rose-red/90')}
                  >
                    {isSelected ? '✓ ' : ''}{p.first_name} {p.last_name.charAt(0)}.
                  </Badge>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Key Points</Label>
          {editedKeyPoints.map((point, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={point}
                onChange={e => {
                  const copy = [...editedKeyPoints]
                  copy[i] = e.target.value
                  setEditedKeyPoints(copy)
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditedKeyPoints(prev => prev.filter((_, idx) => idx !== i))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditedKeyPoints(prev => [...prev, ''])}
          >
            + Add point
          </Button>
        </div>

        {aiResult.related_events && aiResult.related_events.length > 0 && (
          <div className="space-y-2">
            <Label>Suggested Event</Label>
            <Card className="border-rose-silver/30">
              <CardContent className="p-3 text-sm">
                {aiResult.related_events[0].title}
              </CardContent>
            </Card>
          </div>
        )}

        {aiResult.related_notes && aiResult.related_notes.length > 0 && (
          <div className="space-y-2">
            <Label>Related Notes</Label>
            {aiResult.related_notes.map(rn => (
              <Card key={rn.id} className="border-rose-silver/30">
                <CardContent className="p-3 text-sm text-rose-red">
                  {rn.title}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label>Visibility</Label>
          <div className="flex gap-2">
            {(['private', 'team', 'specific'] as const).map(v => (
              <button key={v} onClick={() => setVisibility(v)}>
                <Badge
                  variant={visibility === v ? 'default' : 'outline'}
                  className={cn('cursor-pointer capitalize', visibility === v && 'bg-rose-red hover:bg-rose-red/90')}
                >
                  {v}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="w-full bg-rose-red hover:bg-rose-red/90"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Note
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/notes">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">New Note</h1>
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex flex-wrap gap-2">
          {noteTypes.map(t => (
            <button key={t.value} onClick={() => setNoteType(t.value)}>
              <Badge
                variant={noteType === t.value ? 'default' : 'outline'}
                className={cn('cursor-pointer', noteType === t.value && 'bg-rose-red hover:bg-rose-red/90')}
              >
                {t.label}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title" />
      </div>

      <div className="space-y-2">
        <Label>Photos (optional, max 5)</Label>
        <Card className="border-rose-silver/30 border-dashed">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Capture handwritten notes to parse with AI
            </p>
            <div className="flex justify-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageCapture}
                  disabled={images.length >= 5}
                />
                <Button variant="outline" size="sm" asChild>
                  <span><Camera className="h-4 w-4 mr-1" /> Camera</span>
                </Button>
              </label>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageCapture}
                  disabled={images.length >= 5}
                />
                <Button variant="outline" size="sm" asChild>
                  <span><Image className="h-4 w-4 mr-1" /> Gallery</span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
        {images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <div key={i} className="relative flex-shrink-0 w-20 h-20 rounded overflow-hidden">
                <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Additional text (optional)</Label>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type your notes here..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Visibility</Label>
        <div className="flex gap-2">
          {(['private', 'team', 'specific'] as const).map(v => (
            <button key={v} onClick={() => setVisibility(v)}>
              <Badge
                variant={visibility === v ? 'default' : 'outline'}
                className={cn('cursor-pointer capitalize', visibility === v && 'bg-rose-red hover:bg-rose-red/90')}
              >
                {v}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {images.length > 0 ? (
        <Button
          onClick={handleParseAndReview}
          disabled={loading || !title.trim()}
          className="w-full bg-rose-red hover:bg-rose-red/90"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Parse & Review
        </Button>
      ) : (
        <Button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="w-full bg-rose-red hover:bg-rose-red/90"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Note
        </Button>
      )}
    </div>
  )
}

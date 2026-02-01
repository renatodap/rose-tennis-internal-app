'use server'

import { createClient } from '@/lib/supabase/server'
import type { AIParsedResult } from '@/types/database'

interface AIContext {
  players: { id: number; first_name: string; last_name: string; gender: string; class_year: string | null }[]
  recentEvents: { id: number; title: string; event_type: string; event_date: string }[]
  recentNotes: { id: number; title: string; note_type: string; key_points: string[]; created_at: string }[]
}

export async function buildAIContext(authorId: string): Promise<AIContext> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [playersRes, eventsRes, notesRes] = await Promise.all([
    supabase
      .from('players')
      .select('id, first_name, last_name, gender, class_year')
      .eq('is_active', true)
      .order('last_name'),
    supabase
      .from('events')
      .select('id, title, event_type, event_date')
      .lte('event_date', today)
      .order('event_date', { ascending: false })
      .limit(20),
    supabase
      .from('notes')
      .select('id, title, note_type, key_points, created_at')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return {
    players: (playersRes.data ?? []) as AIContext['players'],
    recentEvents: (eventsRes.data ?? []) as AIContext['recentEvents'],
    recentNotes: (notesRes.data ?? []) as AIContext['recentNotes'],
  }
}

export async function parseNoteImages(
  base64Images: string[],
  context: AIContext
): Promise<AIParsedResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const rosterText = context.players
    .map(p => `${p.id}: ${p.first_name} ${p.last_name} (${p.gender}, ${p.class_year ?? 'N/A'})`)
    .join('\n')

  const eventsText = context.recentEvents
    .map(e => `${e.id}: ${e.title} (${e.event_type}, ${e.event_date})`)
    .join('\n')

  const notesText = context.recentNotes
    .map(n => `${n.id}: "${n.title}" (${n.note_type}) - Key points: ${n.key_points.join('; ')}`)
    .join('\n')

  const systemPrompt = `You are an AI assistant for a college tennis team coaching app. You have access to the following context:

TEAM ROSTER:
${rosterText}

RECENT EVENTS:
${eventsText}

RECENT NOTES BY THIS AUTHOR:
${notesText}

TASK: Parse the handwritten notes in the image(s). Return ONLY valid JSON with this structure:
{
  "extracted_text": "full transcription of the handwritten notes",
  "players_mentioned": ["Full Name 1", "Full Name 2"],
  "key_points": ["point 1", "point 2"],
  "suggested_event_id": null,
  "suggested_event_reason": "",
  "related_note_ids": [],
  "related_note_reasons": []
}

Match player names to the roster above. If you see partial names or nicknames, match to the closest roster entry. Return the full name from the roster.`

  const imageContent = base64Images.map(img => ({
    type: 'image_url' as const,
    image_url: { url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}` },
  }))

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Please parse the handwritten notes in these images.' },
            ...imageContent,
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${errText}`)
  }

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content ?? ''

  // Extract JSON from response (may be wrapped in markdown code block)
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('AI did not return valid JSON')
  }

  const parsed = JSON.parse(jsonMatch[0])

  // Map suggested events/notes to the expected format
  const relatedEvents: AIParsedResult['related_events'] = []
  if (parsed.suggested_event_id) {
    const event = context.recentEvents.find(e => e.id === parsed.suggested_event_id)
    if (event) {
      relatedEvents.push({ id: event.id, title: event.title })
    }
  }

  const relatedNotes: AIParsedResult['related_notes'] = (parsed.related_note_ids ?? [])
    .map((id: number) => {
      const note = context.recentNotes.find(n => n.id === id)
      return note ? { id: note.id, title: note.title } : null
    })
    .filter(Boolean) as AIParsedResult['related_notes']

  return {
    extracted_text: parsed.extracted_text ?? '',
    players_mentioned: parsed.players_mentioned ?? [],
    key_points: parsed.key_points ?? [],
    related_events: relatedEvents,
    related_notes: relatedNotes,
  }
}

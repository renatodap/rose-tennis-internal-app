'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Note, NoteType } from '@/types/database'

export async function createNote(data: {
  author_id: string
  note_type: NoteType
  title: string
  content: string
  event_id?: number | null
  visibility: 'private' | 'team' | 'specific'
  player_mentions?: number[]
  key_points?: string[]
  ai_raw_output?: Record<string, unknown> | null
}): Promise<Note> {
  const supabase = await createClient()

  const { data: note, error } = await supabase
    .from('notes')
    .insert({
      author_id: data.author_id,
      note_type: data.note_type,
      title: data.title,
      content: data.content,
      event_id: data.event_id ?? null,
      visibility: data.visibility,
      player_mentions: data.player_mentions ?? [],
      key_points: data.key_points ?? [],
      ai_raw_output: data.ai_raw_output ?? null,
    } as never)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/notes')
  revalidatePath('/')
  return note as Note
}

export async function getNotes(filters?: {
  note_type?: NoteType
  event_id?: number
  author_id?: string
  player_id?: number
  search?: string
  limit?: number
}): Promise<Note[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(filters?.limit ?? 50)

    if (filters?.note_type) {
      query = query.eq('note_type', filters.note_type)
    }
    if (filters?.event_id) {
      query = query.eq('event_id', filters.event_id)
    }
    if (filters?.author_id) {
      query = query.eq('author_id', filters.author_id)
    }
    if (filters?.player_id) {
      query = query.contains('player_mentions', [filters.player_id])
    }
    if (filters?.search) {
      query = query.textSearch('fts', filters.search, { type: 'websearch' })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching notes:', error)
      return []
    }
    return (data ?? []) as Note[]
  } catch (err) {
    console.error('Error in getNotes:', err)
    return []
  }
}

export async function getNote(id: number): Promise<Note | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching note:', error)
    return null
  }
  return data as Note
}

export async function updateNote(id: number, updates: Partial<Pick<Note, 'title' | 'content' | 'note_type' | 'event_id' | 'visibility' | 'player_mentions' | 'key_points'>>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notes')
    .update(updates as never)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/notes')
  revalidatePath(`/notes/${id}`)
}

export async function deleteNote(id: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/notes')
  revalidatePath('/')
}

export async function searchNotes(query: string): Promise<Note[]> {
  return getNotes({ search: query, limit: 20 })
}

export async function shareNoteWithPlayers(noteId: number, playerIds: number[]) {
  const supabase = await createClient()

  // Remove existing shares
  await supabase.from('note_shares').delete().eq('note_id', noteId)

  if (playerIds.length > 0) {
    const shares = playerIds.map(player_id => ({ note_id: noteId, player_id }))
    const { error } = await supabase
      .from('note_shares')
      .insert(shares as never)

    if (error) throw error
  }

  revalidatePath(`/notes/${noteId}`)
}

export async function getPlayerNotes(playerId: number): Promise<Note[]> {
  return getNotes({ player_id: playerId })
}

export async function getPlayerNoteCount(playerId: number): Promise<number> {
  try {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .contains('player_mentions', [playerId])

    if (error) {
      console.error('Error counting player notes:', error)
      return 0
    }
    return count ?? 0
  } catch {
    return 0
  }
}

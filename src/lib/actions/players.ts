'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Player, Gender } from '@/types/database'

export async function getPlayers(filters?: { gender?: Gender; tagId?: number }) {
  const supabase = await createClient()

  let query = supabase
    .from('players')
    .select(`
      *,
      player_tags (
        tags (id, name, color)
      )
    `)
    .eq('is_active', true)
    .order('last_name')

  if (filters?.gender) {
    query = query.eq('gender', filters.gender)
  }

  const { data, error } = await query

  if (error) throw error

  // Filter by tag if specified
  if (filters?.tagId && data) {
    return data.filter(player =>
      player.player_tags?.some(pt => pt.tags.id === filters.tagId)
    )
  }

  return data
}

export async function getPlayer(id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('players')
    .select(`
      *,
      player_tags (
        tags (id, name, color)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createPlayer(data: Omit<Player, 'id' | 'created_at' | 'player_tags'>) {
  const supabase = await createClient()

  const { data: player, error } = await supabase
    .from('players')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/roster')
  revalidatePath('/admin/players')
  return player
}

export async function updatePlayer(id: number, data: Partial<Player>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('players')
    .update(data)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/roster')
  revalidatePath(`/roster/${id}`)
  revalidatePath('/admin/players')
}

export async function addPlayerTag(playerId: number, tagId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('player_tags')
    .insert({ player_id: playerId, tag_id: tagId })

  if (error) throw error
  revalidatePath('/roster')
  revalidatePath(`/roster/${playerId}`)
}

export async function removePlayerTag(playerId: number, tagId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('player_tags')
    .delete()
    .eq('player_id', playerId)
    .eq('tag_id', tagId)

  if (error) throw error
  revalidatePath('/roster')
  revalidatePath(`/roster/${playerId}`)
}

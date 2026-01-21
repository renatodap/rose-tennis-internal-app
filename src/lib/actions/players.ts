'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Player, Gender, Tag, PlayerTag } from '@/types/database'

type PlayerWithTags = Player & {
  player_tags?: { tags: Tag }[]
}

export async function getPlayers(filters?: { gender?: Gender; tagId?: number }): Promise<PlayerWithTags[]> {
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

  const players = (data ?? []) as PlayerWithTags[]

  // Filter by tag if specified
  if (filters?.tagId) {
    return players.filter(player =>
      player.player_tags?.some((pt: { tags: Tag }) => pt.tags.id === filters.tagId)
    )
  }

  return players
}

export async function getPlayer(id: number): Promise<PlayerWithTags | null> {
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
  return data as PlayerWithTags | null
}

export async function createPlayer(playerData: Omit<Player, 'id' | 'created_at' | 'player_tags'>): Promise<Player> {
  const supabase = await createClient()

  const { data: player, error } = await supabase
    .from('players')
    .insert(playerData as never)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/roster')
  revalidatePath('/admin/players')
  return player as Player
}

export async function updatePlayer(id: number, playerData: Partial<Player>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('players')
    .update(playerData as never)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/roster')
  revalidatePath(`/roster/${id}`)
  revalidatePath('/admin/players')
}

export async function addPlayerTag(playerId: number, tagId: number) {
  const supabase = await createClient()

  const tagData: PlayerTag = { player_id: playerId, tag_id: tagId }

  const { error } = await supabase
    .from('player_tags')
    .insert(tagData as never)

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

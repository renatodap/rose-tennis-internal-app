'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Announcement } from '@/types/database'

export async function getAnnouncements(filters?: { gender?: 'male' | 'female' }) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const query = supabase
    .from('announcements')
    .select('*')
    .lte('publish_at', now)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('priority', { ascending: false })
    .order('publish_at', { ascending: false })

  const { data, error } = await query

  if (error) throw error

  // Filter by gender if specified
  if (filters?.gender && data) {
    return data.filter(announcement =>
      filters.gender === 'male' ? announcement.for_mens : announcement.for_womens
    )
  }

  return data
}

export async function getRecentAnnouncements(limit: number = 3) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .lte('publish_at', now)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('priority', { ascending: false })
    .order('publish_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function createAnnouncement(data: Omit<Announcement, 'id' | 'created_at'>) {
  const supabase = await createClient()

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert(data)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/updates')
  revalidatePath('/')
  return announcement
}

export async function updateAnnouncement(id: number, data: Partial<Announcement>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('announcements')
    .update(data)
    .eq('id', id)

  if (error) throw error

  revalidatePath('/updates')
  revalidatePath('/')
}

export async function deleteAnnouncement(id: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/updates')
  revalidatePath('/')
}

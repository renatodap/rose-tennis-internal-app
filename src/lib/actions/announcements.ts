'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Announcement } from '@/types/database'

export async function getAnnouncements(filters?: { gender?: 'male' | 'female' }): Promise<Announcement[]> {
  try {
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

    if (error) {
      console.error('Error fetching announcements:', error)
      return []
    }

    const announcements = (data ?? []) as Announcement[]

    // Filter by gender if specified
    if (filters?.gender) {
      return announcements.filter(announcement =>
        filters.gender === 'male' ? announcement.for_mens : announcement.for_womens
      )
    }

    return announcements
  } catch (err) {
    console.error('Error in getAnnouncements:', err)
    return []
  }
}

export async function getRecentAnnouncements(limit: number = 3): Promise<Announcement[]> {
  try {
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

    if (error) {
      console.error('Error fetching announcements:', error)
      return []
    }
    return (data ?? []) as Announcement[]
  } catch (err) {
    console.error('Error in getRecentAnnouncements:', err)
    return []
  }
}

export async function createAnnouncement(announcementData: Omit<Announcement, 'id' | 'created_at'>) {
  const supabase = await createClient()

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert(announcementData as never)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/updates')
  revalidatePath('/')
  return announcement as Announcement
}

export async function updateAnnouncement(id: number, announcementData: Partial<Announcement>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('announcements')
    .update(announcementData as never)
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

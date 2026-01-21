'use server'

import { createClient } from '@/lib/supabase/server'
import type { Tag } from '@/types/database'

export async function getTags(): Promise<Tag[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching tags:', error)
      return []
    }
    return (data ?? []) as Tag[]
  } catch (err) {
    console.error('Error in getTags:', err)
    return []
  }
}

export async function createTag(tagData: Omit<Tag, 'id'>): Promise<Tag> {
  const supabase = await createClient()

  const { data: tag, error } = await supabase
    .from('tags')
    .insert(tagData as never)
    .select()
    .single()

  if (error) throw error
  return tag as Tag
}

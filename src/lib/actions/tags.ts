'use server'

import { createClient } from '@/lib/supabase/server'
import type { Tag } from '@/types/database'

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  if (error) throw error
  return (data ?? []) as Tag[]
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

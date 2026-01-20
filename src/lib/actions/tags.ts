'use server'

import { createClient } from '@/lib/supabase/server'
import type { Tag } from '@/types/database'

export async function getTags() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function createTag(data: Omit<Tag, 'id'>) {
  const supabase = await createClient()

  const { data: tag, error } = await supabase
    .from('tags')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return tag
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Form, FormQuestion, FormResponse } from '@/types/database'

export async function getForms() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .select(`
      *,
      form_questions (*)
    `)
    .eq('is_active', true)
    .order('due_date', { ascending: true, nullsFirst: false })

  if (error) throw error
  return data
}

export async function getForm(id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .select(`
      *,
      form_questions (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  // Sort questions by sort_order
  if (data?.form_questions) {
    data.form_questions.sort((a, b) => a.sort_order - b.sort_order)
  }

  return data
}

export async function createForm(
  data: Omit<Form, 'id' | 'created_at' | 'form_questions'>,
  questions: Omit<FormQuestion, 'id' | 'form_id'>[]
) {
  const supabase = await createClient()

  const { data: form, error } = await supabase
    .from('forms')
    .insert(data)
    .select()
    .single()

  if (error) throw error

  if (questions.length > 0 && form) {
    const questionsWithFormId = questions.map((q, index) => ({
      ...q,
      form_id: form.id,
      sort_order: index,
    }))

    const { error: questionsError } = await supabase
      .from('form_questions')
      .insert(questionsWithFormId)

    if (questionsError) throw questionsError
  }

  revalidatePath('/updates')
  revalidatePath('/admin/forms')
  return form
}

export async function submitFormResponse(
  formId: number,
  playerId: number,
  responses: Record<string, string | string[] | boolean>
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_responses')
    .upsert({
      form_id: formId,
      player_id: playerId,
      responses,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/updates')
  revalidatePath(`/updates/forms/${formId}`)
  return data
}

export async function getFormResponse(formId: number, playerId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .eq('player_id', playerId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getFormResponses(formId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_responses')
    .select(`
      *,
      players (id, first_name, last_name, email)
    `)
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data
}

export async function deleteForm(id: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/updates')
  revalidatePath('/admin/forms')
}

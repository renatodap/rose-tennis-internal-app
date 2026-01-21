'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Form, FormQuestion, FormResponse } from '@/types/database'

export async function getForms(): Promise<Form[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('forms')
      .select(`
        *,
        form_questions (*)
      `)
      .eq('is_active', true)
      .order('due_date', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Error fetching forms:', error)
      return []
    }
    return (data ?? []) as Form[]
  } catch (err) {
    console.error('Error in getForms:', err)
    return []
  }
}

export async function getForm(id: number): Promise<Form | null> {
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

  const form = data as Form | null

  // Sort questions by sort_order
  if (form?.form_questions) {
    form.form_questions.sort((a: FormQuestion, b: FormQuestion) => a.sort_order - b.sort_order)
  }

  return form
}

export async function createForm(
  formData: Omit<Form, 'id' | 'created_at' | 'form_questions'>,
  questions: Omit<FormQuestion, 'id' | 'form_id'>[]
): Promise<Form> {
  const supabase = await createClient()

  const { data: form, error } = await supabase
    .from('forms')
    .insert(formData as never)
    .select()
    .single()

  if (error) throw error

  const createdForm = form as { id: number }

  if (questions.length > 0 && createdForm) {
    const questionsWithFormId = questions.map((q, index) => ({
      ...q,
      form_id: createdForm.id,
      sort_order: index,
    }))

    const { error: questionsError } = await supabase
      .from('form_questions')
      .insert(questionsWithFormId as never[])

    if (questionsError) throw questionsError
  }

  revalidatePath('/updates')
  revalidatePath('/admin/forms')
  return createdForm as Form
}

export async function submitFormResponse(
  formId: number,
  playerId: number,
  responses: Record<string, string | string[] | boolean>
): Promise<FormResponse> {
  const supabase = await createClient()

  const responseData = {
    form_id: formId,
    player_id: playerId,
    responses,
  }

  const { data, error } = await supabase
    .from('form_responses')
    .upsert(responseData as never)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/updates')
  revalidatePath(`/updates/forms/${formId}`)
  return data as FormResponse
}

export async function getFormResponse(formId: number, playerId: number): Promise<FormResponse | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .eq('player_id', playerId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data ?? null) as FormResponse | null
}

export async function getFormResponses(formId: number): Promise<(FormResponse & { players: { id: number; first_name: string; last_name: string; email: string } | null })[]> {
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
  return (data ?? []) as (FormResponse & { players: { id: number; first_name: string; last_name: string; email: string } | null })[]
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

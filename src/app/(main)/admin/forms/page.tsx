'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createForm } from '@/lib/actions/forms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'
import type { QuestionType } from '@/types/database'

interface Question {
  question_text: string
  question_type: QuestionType
  options: string[] | null
  is_required: boolean
  sort_order: number
}

export default function AdminFormsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'text',
        options: null,
        is_required: false,
        sort_order: questions.length,
      },
    ])
  }

  const updateQuestion = (index: number, field: keyof Question, value: string | boolean | string[] | null) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const formInfo = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      due_date: formData.get('due_date') ? new Date(formData.get('due_date') as string).toISOString() : null,
      is_active: true,
      for_mens: formData.get('for_mens') === 'on',
      for_womens: formData.get('for_womens') === 'on',
      target_tags: null,
      created_by: null,
    }

    try {
      await createForm(formInfo, questions)
      setShowForm(false)
      setQuestions([])
      router.refresh()
    } catch (error) {
      console.error('Failed to create form:', error)
    }

    setLoading(false)
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Forms</h1>
        </div>
        <Button
          className="bg-rose-red hover:bg-rose-red/90"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Form
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <Card className="border-rose-silver/30">
            <CardHeader>
              <CardTitle className="text-base">Form Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required placeholder="Form title" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Form description..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input id="due_date" name="due_date" type="date" />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="for_mens" defaultChecked className="rounded" />
                  <span className="text-sm">Men&apos;s Team</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="for_womens" defaultChecked className="rounded" />
                  <span className="text-sm">Women&apos;s Team</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card className="border-rose-silver/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Questions</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No questions added yet
                </p>
              ) : (
                questions.map((q, index) => (
                  <div key={index} className="p-3 border rounded-md space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Question text"
                          value={q.question_text}
                          onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select
                        value={q.question_type}
                        onValueChange={(v) => updateQuestion(index, 'question_type', v as QuestionType)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="textarea">Long Text</SelectItem>
                          <SelectItem value="select">Dropdown</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="time">Time</SelectItem>
                          <SelectItem value="boolean">Yes/No</SelectItem>
                        </SelectContent>
                      </Select>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={q.is_required}
                          onChange={(e) => updateQuestion(index, 'is_required', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Required</span>
                      </label>
                    </div>
                    {q.question_type === 'select' && (
                      <Input
                        placeholder="Options (comma-separated)"
                        value={q.options?.join(', ') || ''}
                        onChange={(e) =>
                          updateQuestion(index, 'options', e.target.value.split(',').map(s => s.trim()))
                        }
                      />
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setQuestions([])
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-rose-red hover:bg-rose-red/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Form'
              )}
            </Button>
          </div>
        </form>
      )}

      <Card className="border-rose-silver/30">
        <CardContent className="p-6 text-center text-muted-foreground">
          View forms on the Updates page
          <br />
          <Link href="/updates" className="text-rose-red hover:underline">
            Go to Updates
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

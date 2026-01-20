'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitFormResponse } from '@/lib/actions/forms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle } from 'lucide-react'
import type { Form, FormQuestion, FormResponse } from '@/types/database'

interface FormRendererProps {
  form: Form & { form_questions: FormQuestion[] }
  playerId: number
  existingResponse?: FormResponse | null
}

export function FormRenderer({ form, playerId, existingResponse }: FormRendererProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(!!existingResponse)
  const [responses, setResponses] = useState<Record<string, string | string[] | boolean>>(
    existingResponse?.responses || {}
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateResponse = (questionId: number, value: string | string[] | boolean) => {
    setResponses(prev => ({ ...prev, [questionId.toString()]: value }))
    setErrors(prev => ({ ...prev, [questionId.toString()]: '' }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    form.form_questions.forEach(q => {
      if (q.is_required) {
        const value = responses[q.id.toString()]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[q.id.toString()] = 'This field is required'
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await submitFormResponse(form.id, playerId, responses)
      setSubmitted(true)
    } catch (error) {
      console.error('Failed to submit form:', error)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-green-800">Response Submitted</h3>
          <p className="text-sm text-green-600 mt-1">
            Your response has been recorded.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSubmitted(false)}
          >
            Edit Response
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {form.form_questions.map((question) => (
        <div key={question.id} className="space-y-2">
          <Label htmlFor={`q-${question.id}`}>
            {question.question_text}
            {question.is_required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {question.question_type === 'text' && (
            <Input
              id={`q-${question.id}`}
              value={(responses[question.id.toString()] as string) || ''}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              placeholder="Enter your answer"
            />
          )}

          {question.question_type === 'textarea' && (
            <Textarea
              id={`q-${question.id}`}
              value={(responses[question.id.toString()] as string) || ''}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              placeholder="Enter your answer"
              rows={4}
            />
          )}

          {question.question_type === 'select' && question.options && (
            <Select
              value={(responses[question.id.toString()] as string) || ''}
              onValueChange={(v) => updateResponse(question.id, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {question.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {question.question_type === 'date' && (
            <Input
              id={`q-${question.id}`}
              type="date"
              value={(responses[question.id.toString()] as string) || ''}
              onChange={(e) => updateResponse(question.id, e.target.value)}
            />
          )}

          {question.question_type === 'time' && (
            <Input
              id={`q-${question.id}`}
              type="time"
              value={(responses[question.id.toString()] as string) || ''}
              onChange={(e) => updateResponse(question.id, e.target.value)}
            />
          )}

          {question.question_type === 'boolean' && (
            <Select
              value={responses[question.id.toString()]?.toString() || ''}
              onValueChange={(v) => updateResponse(question.id, v === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          )}

          {errors[question.id.toString()] && (
            <p className="text-sm text-destructive">{errors[question.id.toString()]}</p>
          )}
        </div>
      ))}

      <Button
        type="submit"
        className="w-full bg-rose-red hover:bg-rose-red/90"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Response'
        )}
      </Button>
    </form>
  )
}

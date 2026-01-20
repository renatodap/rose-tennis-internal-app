'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createEvent } from '@/lib/actions/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { EventType } from '@/types/database'

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isMatch, setIsMatch] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const eventData = {
      title: formData.get('title') as string,
      event_type: formData.get('event_type') as EventType,
      event_date: formData.get('event_date') as string,
      start_time: formData.get('start_time') as string || null,
      end_time: formData.get('end_time') as string || null,
      location: formData.get('location') as string || null,
      for_mens: formData.get('for_mens') === 'on',
      for_womens: formData.get('for_womens') === 'on',
      notes: formData.get('notes') as string || null,
      meeting_notes: null,
      created_by: null,
    }

    const matchDetails = isMatch ? {
      opponent: formData.get('opponent') as string,
      home_away: formData.get('home_away') as 'home' | 'away' | 'neutral',
      mens_score: null,
      womens_score: null,
      result: null,
    } : undefined

    try {
      await createEvent(eventData, matchDetails)
      router.push('/admin/events')
    } catch (error) {
      console.error('Failed to create event:', error)
    }

    setLoading(false)
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">New Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-rose-silver/30">
          <CardHeader>
            <CardTitle className="text-base">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required placeholder="Practice, Match vs Team, etc." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Type *</Label>
              <Select
                name="event_type"
                defaultValue="practice"
                onValueChange={(v) => setIsMatch(v === 'match')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="match">Match</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="scrimmage">Scrimmage</SelectItem>
                  <SelectItem value="trip">Trip</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Date *</Label>
                <Input id="event_date" name="event_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="Hulbert Courts" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input id="start_time" name="start_time" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input id="end_time" name="end_time" type="time" />
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Additional information..." />
            </div>
          </CardContent>
        </Card>

        {isMatch && (
          <Card className="border-rose-silver/30">
            <CardHeader>
              <CardTitle className="text-base">Match Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent *</Label>
                <Input id="opponent" name="opponent" required placeholder="DePauw University" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="home_away">Location *</Label>
                <Select name="home_away" defaultValue="home">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          className="w-full bg-rose-red hover:bg-rose-red/90"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Event'
          )}
        </Button>
      </form>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createAnnouncement } from '@/lib/actions/announcements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import type { Priority } from '@/types/database'

export default function AdminAnnouncementsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const announcementData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      priority: formData.get('priority') as Priority,
      for_mens: formData.get('for_mens') === 'on',
      for_womens: formData.get('for_womens') === 'on',
      publish_at: new Date().toISOString(),
      expires_at: formData.get('expires_at') ? new Date(formData.get('expires_at') as string).toISOString() : null,
      created_by: null,
    }

    try {
      await createAnnouncement(announcementData)
      setShowForm(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to create announcement:', error)
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
          <h1 className="text-xl font-semibold">Announcements</h1>
        </div>
        <Button
          className="bg-rose-red hover:bg-rose-red/90"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <Card className="border-rose-silver/30">
            <CardHeader>
              <CardTitle className="text-base">New Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required placeholder="Announcement title" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  required
                  placeholder="Announcement content..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expires On</Label>
                  <Input id="expires_at" name="expires_at" type="date" />
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

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
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
                    'Create'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      <Card className="border-rose-silver/30">
        <CardContent className="p-6 text-center text-muted-foreground">
          View announcements on the Updates page
          <br />
          <Link href="/updates" className="text-rose-red hover:underline">
            Go to Updates
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

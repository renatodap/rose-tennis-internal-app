'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPlayer } from '@/lib/actions/players'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { Gender, ClassYear } from '@/types/database'

export default function NewPlayerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const playerData = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
      gender: formData.get('gender') as Gender,
      class_year: (formData.get('class_year') as ClassYear) || null,
      is_captain: formData.get('is_captain') === 'on',
      is_active: true,
    }

    try {
      await createPlayer(playerData)
      router.push('/admin/players')
    } catch (error) {
      console.error('Failed to create player:', error)
    }

    setLoading(false)
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/players">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Add Player</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-rose-silver/30">
          <CardHeader>
            <CardTitle className="text-base">Player Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input id="first_name" name="first_name" required placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" name="last_name" required placeholder="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="doej@rose-hulman.edu"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Team *</Label>
                <Select name="gender" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Men&apos;s</SelectItem>
                    <SelectItem value="female">Women&apos;s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_year">Class Year</Label>
                <Select name="class_year">
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fr">Freshman</SelectItem>
                    <SelectItem value="So">Sophomore</SelectItem>
                    <SelectItem value="Jr">Junior</SelectItem>
                    <SelectItem value="Sr">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_captain" className="rounded" />
              <span className="text-sm">Team Captain</span>
            </label>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-rose-red hover:bg-rose-red/90"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Player'
          )}
        </Button>
      </form>
    </div>
  )
}

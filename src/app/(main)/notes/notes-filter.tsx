'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NoteType } from '@/types/database'

const noteTypes: { value: NoteType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'practice', label: 'Practice' },
  { value: 'match', label: 'Match' },
  { value: 'practice_plan', label: 'Plans' },
  { value: 'film_review', label: 'Film' },
  { value: 'pre_match', label: 'Pre-Match' },
  { value: 'post_match', label: 'Post-Match' },
  { value: 'general', label: 'General' },
]

interface NotesFilterProps {
  currentType?: NoteType
  currentSearch?: string
}

export function NotesFilter({ currentType, currentSearch }: NotesFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch ?? '')

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/notes?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams('q', search || null)
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {noteTypes.map((type) => {
          const isActive = type.value === 'all' ? !currentType : currentType === type.value
          return (
            <button
              key={type.value}
              onClick={() => updateParams('type', type.value === 'all' ? null : type.value)}
              className="flex-shrink-0"
            >
              <Badge
                variant={isActive ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer whitespace-nowrap',
                  isActive && 'bg-rose-red hover:bg-rose-red/90'
                )}
              >
                {type.label}
              </Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Tag } from '@/types/database'

interface RosterFiltersProps {
  tags: Tag[]
}

export function RosterFilters({ tags }: RosterFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentGender = searchParams.get('gender') || 'all'
  const currentTag = searchParams.get('tag') || 'all'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/roster?${params.toString()}`)
  }

  return (
    <div className="flex gap-3">
      <Select value={currentGender} onValueChange={(v) => updateFilter('gender', v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Teams" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Teams</SelectItem>
          <SelectItem value="male">Men</SelectItem>
          <SelectItem value="female">Women</SelectItem>
        </SelectContent>
      </Select>

      <Select value={currentTag} onValueChange={(v) => updateFilter('tag', v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Tags" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id.toString()}>
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

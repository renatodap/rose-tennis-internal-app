'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const genderOptions = [
  { value: 'all', label: 'All' },
  { value: 'male', label: "Men's" },
  { value: 'female', label: "Women's" },
]

interface RosterFilterProps {
  currentGender?: string
  currentSearch?: string
}

export function RosterFilter({ currentGender, currentSearch }: RosterFilterProps) {
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
    router.push(`/roster?${params.toString()}`)
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
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </form>

      <div className="flex gap-2">
        {genderOptions.map(opt => {
          const isActive = opt.value === 'all' ? !currentGender : currentGender === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => updateParams('gender', opt.value === 'all' ? null : opt.value)}
            >
              <Badge
                variant={isActive ? 'default' : 'outline'}
                className={cn('cursor-pointer', isActive && 'bg-rose-red hover:bg-rose-red/90')}
              >
                {opt.label}
              </Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}

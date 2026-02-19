'use client'

import { useEffect, useRef } from 'react'
import { format, parseISO } from 'date-fns'

interface DayPickerProps {
  dates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
}

export function DayPicker({ dates, selectedDate, onDateChange }: DayPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current
      const chip = selectedRef.current
      const scrollLeft = chip.offsetLeft - container.offsetWidth / 2 + chip.offsetWidth / 2
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [selectedDate])

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
    >
      {dates.map((date) => {
        const parsed = parseISO(date)
        const dayAbbr = format(parsed, 'EEE')
        const dayNum = format(parsed, 'd')
        const isSelected = date === selectedDate
        return (
          <button
            key={date}
            ref={isSelected ? selectedRef : undefined}
            onClick={() => onDateChange(date)}
            className={`flex flex-col items-center justify-center min-w-[52px] min-h-[52px] px-2 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-rose-red text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <span className="text-xs">{dayAbbr}</span>
            <span className="text-base font-semibold">{dayNum}</span>
          </button>
        )
      })}
    </div>
  )
}

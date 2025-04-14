// src/components/ui/calendar.tsx
import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

export interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
}

export function Calendar({ selected, onSelect }: CalendarProps) {
  return (
    <div className="p-3">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        showOutsideDays
      />
    </div>
  )
}

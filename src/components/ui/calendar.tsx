
import React, { useState } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from "date-fns"

export const CustomCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
        {"<"}
      </button>
      <div className="text-lg font-medium">
        {format(currentMonth, "MMMM yyyy")}
      </div>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
        {">"}
      </button>
    </div>
  )

  const renderDays = () => {
    const days = []
    const start = startOfWeek(currentMonth)
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-medium" key={i}>
          {format(addDays(start, i), "EEE")}
        </div>
      )
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d")
        const cloneDay = day

        const isDisabled = !isSameMonth(day, monthStart)
        const isSelected = selectedDate && isSameDay(day, selectedDate)

        days.push(
          <div
            key={day.toString()}
            className={`text-center p-2 rounded cursor-pointer ${
              isDisabled ? "text-gray-400" : ""
            } ${isSelected ? "bg-blue-500 text-white" : ""}`}
            onClick={() => !isDisabled && setSelectedDate(cloneDay)}
          >
            {formattedDate}
          </div>
        )

        day = addDays(day, 1)
      }

      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>
      )
      days = []
    }

    return <div>{rows}</div>
  }

  return (
    <div className="w-[300px] p-4 border rounded">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  )
}

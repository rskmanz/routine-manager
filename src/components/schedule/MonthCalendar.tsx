'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Routine, Goal } from '@/types'
import {
  getCalendarDays,
  isSameDay,
  isCurrentMonth,
  isToday,
  getDateString,
  isRoutineDueOnDate,
} from '@/lib/schedule/utils'

interface MonthCalendarProps {
  routines: Routine[]
  goals: Goal[]
  locale: string
  currentDate: Date // Controlled by parent
  getCompletionStatus: (routineId: string, date: string) => 'pending' | 'completed' | 'skipped' | null
  onDateClick: (date: Date) => void
}

const dayNames = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ja: ['日', '月', '火', '水', '木', '金', '土'],
}

export function MonthCalendar({
  routines,
  goals,
  locale,
  currentDate,
  getCompletionStatus,
  onDateClick,
}: MonthCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    return getCalendarDays(year, month)
  }, [year, month])

  const getRoutinesDueOnDate = (date: Date): Routine[] => {
    return routines.filter((r) => isRoutineDueOnDate(r, date))
  }

  const getCompletionStats = (date: Date) => {
    const routinesDue = getRoutinesDueOnDate(date)
    const dateStr = getDateString(date)
    const completed = routinesDue.filter(
      (r) => getCompletionStatus(r.id, dateStr) === 'completed'
    ).length
    return { completed, total: routinesDue.length }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateClick(date)
  }

  // Get goal color for a routine
  const getGoalColor = (goalId: string): string => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal?.color) return 'bg-zinc-400'
    // Extract color from tailwind gradient class
    if (goal.color.includes('indigo')) return 'bg-indigo-400'
    if (goal.color.includes('emerald')) return 'bg-emerald-400'
    if (goal.color.includes('rose')) return 'bg-rose-400'
    if (goal.color.includes('amber')) return 'bg-amber-400'
    if (goal.color.includes('violet')) return 'bg-violet-400'
    if (goal.color.includes('cyan')) return 'bg-cyan-400'
    if (goal.color.includes('pink')) return 'bg-pink-400'
    if (goal.color.includes('blue')) return 'bg-blue-400'
    return 'bg-zinc-400'
  }

  return (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Day names header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {(dayNames[locale as keyof typeof dayNames] || dayNames.en).map((day, index) => (
            <div
              key={day}
              className={cn(
                'py-2 text-center text-xs font-medium text-muted-foreground',
                index === 0 && 'text-red-500 dark:text-red-400',
                index === 6 && 'text-blue-500 dark:text-blue-400'
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const stats = getCompletionStats(date)
            const routinesDue = getRoutinesDueOnDate(date)
            const isCurrent = isCurrentMonth(date, currentDate)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isTodayDate = isToday(date)
            const dayOfWeek = date.getDay()

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.005 }}
                onClick={() => handleDateClick(date)}
                className={cn(
                  'relative min-h-[100px] p-2 border-b border-r border-border/50 transition-colors hover:bg-muted/50',
                  !isCurrent && 'opacity-40',
                  isSelected && 'bg-muted',
                  isTodayDate && 'bg-primary/5'
                )}
              >
                {/* Date number */}
                <div
                  className={cn(
                    'text-sm font-medium mb-1',
                    isTodayDate && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto',
                    !isTodayDate && dayOfWeek === 0 && 'text-red-500 dark:text-red-400',
                    !isTodayDate && dayOfWeek === 6 && 'text-blue-500 dark:text-blue-400'
                  )}
                >
                  {date.getDate()}
                </div>

                {/* Routine list */}
                {routinesDue.length > 0 && (
                  <div className="space-y-0.5 mt-1">
                    {routinesDue.slice(0, 3).map((routine) => {
                      const dateStr = getDateString(date)
                      const status = getCompletionStatus(routine.id, dateStr)
                      return (
                        <div
                          key={routine.id}
                          className="flex items-center gap-1 text-[10px] leading-tight"
                        >
                          {status === 'completed' ? (
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-2.5 w-2.5 text-muted-foreground/40 flex-shrink-0" />
                          )}
                          <span
                            className={cn(
                              'truncate',
                              status === 'completed' && 'line-through text-muted-foreground'
                            )}
                          >
                            {routine.title}
                          </span>
                        </div>
                      )
                    })}
                    {routinesDue.length > 3 && (
                      <span className="text-[9px] text-muted-foreground pl-3.5">
                        +{routinesDue.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          <span>{locale === 'ja' ? '完了' : 'Completed'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Circle className="h-3 w-3 text-muted-foreground/30" />
          <span>{locale === 'ja' ? '未完了' : 'Pending'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>{locale === 'ja' ? '今日' : 'Today'}</span>
        </div>
      </div>
    </div>
  )
}

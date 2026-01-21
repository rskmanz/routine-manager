'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, ToggleLeft, ToggleRight, Flame, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { RoutineSchedule, ScheduleFrequency, DayOfWeek, StreakInfo } from '@/types'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { getDayAbbreviation } from '@/lib/schedule/utils'

interface SchedulePanelProps {
  schedule?: RoutineSchedule
  streakInfo?: StreakInfo
  onSave: (schedule: RoutineSchedule) => void
  className?: string
}

const frequencies: ScheduleFrequency[] = ['daily', 'weekly', 'monthly']
const daysOfWeek: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export function SchedulePanel({
  schedule,
  streakInfo,
  onSave,
  className,
}: SchedulePanelProps) {
  const { t, locale } = useTranslation()

  const [enabled, setEnabled] = useState(schedule?.enabled ?? false)
  const [frequency, setFrequency] = useState<ScheduleFrequency>(
    schedule?.frequency ?? 'daily'
  )
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    schedule?.daysOfWeek ?? ['mon', 'tue', 'wed', 'thu', 'fri']
  )
  const [dayOfMonth, setDayOfMonth] = useState(schedule?.dayOfMonth ?? 1)
  const [reminderTime, setReminderTime] = useState(
    schedule?.reminderTime ?? '09:00'
  )
  const [hasChanges, setHasChanges] = useState(false)

  // Reset form when schedule prop changes
  useEffect(() => {
    if (schedule) {
      setEnabled(schedule.enabled)
      setFrequency(schedule.frequency)
      setSelectedDays(schedule.daysOfWeek ?? ['mon', 'tue', 'wed', 'thu', 'fri'])
      setDayOfMonth(schedule.dayOfMonth ?? 1)
      setReminderTime(schedule.reminderTime ?? '09:00')
      setHasChanges(false)
    }
  }, [schedule])

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
    setHasChanges(true)
  }

  const handleSave = () => {
    const newSchedule: RoutineSchedule = {
      frequency,
      enabled,
      daysOfWeek: frequency === 'weekly' ? selectedDays : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      reminderTime: reminderTime || undefined,
    }
    onSave(newSchedule)
    setHasChanges(false)
  }

  const handleChange = (setter: (value: any) => void) => (value: any) => {
    setter(value)
    setHasChanges(true)
  }

  return (
    <div className={cn('p-8 space-y-8', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <Calendar className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t('scheduleConfig.title')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('schedule.noRoutinesDesc')}
            </p>
          </div>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} size="sm">
            {t('button.save')}
          </Button>
        )}
      </div>

      {/* Streak Stats */}
      {streakInfo && streakInfo.totalCompletions > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-medium">{t('schedule.currentStreak')}</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {streakInfo.currentStreak}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-medium">{t('schedule.longestStreak')}</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {streakInfo.longestStreak}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium">{t('schedule.totalCompletions')}</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {streakInfo.totalCompletions}
            </div>
          </div>
        </div>
      )}

      {/* Enable Toggle */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium">
              {t('scheduleConfig.enabled')}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              {enabled ? t('schedule.enabledDesc') : t('schedule.disabledDesc')}
            </p>
          </div>
          <button
            onClick={() => handleChange(setEnabled)(!enabled)}
            className="flex items-center gap-2 text-sm"
          >
            {enabled ? (
              <ToggleRight className="h-8 w-8 text-zinc-900 dark:text-zinc-100" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {enabled && (
        <div className="space-y-6">
          {/* Frequency Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              {t('scheduleConfig.frequency')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {frequencies.map((freq) => (
                <button
                  key={freq}
                  onClick={() => handleChange(setFrequency)(freq)}
                  className={cn(
                    'px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                    frequency === freq
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border-border hover:border-zinc-400 hover:bg-muted/50'
                  )}
                >
                  {t(`scheduleConfig.${freq}` as any)}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly: Day Selection */}
          {frequency === 'weekly' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">
                {t('scheduleConfig.daysOfWeek')}
              </label>
              <div className="flex gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      'w-12 h-12 rounded-xl text-sm font-medium transition-all',
                      selectedDays.includes(day)
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {getDayAbbreviation(day, locale)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly: Day of Month */}
          {frequency === 'monthly' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">
                {t('scheduleConfig.dayOfMonth')}
              </label>
              <Input
                type="number"
                min={1}
                max={31}
                value={dayOfMonth}
                onChange={(e) => handleChange(setDayOfMonth)(parseInt(e.target.value) || 1)}
                className="w-24"
              />
            </div>
          )}

          {/* Reminder Time */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('scheduleConfig.reminderTime')}
            </label>
            <Input
              type="time"
              value={reminderTime}
              onChange={(e) => handleChange(setReminderTime)(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import type { RoutineSchedule, ScheduleFrequency, DayOfWeek } from '@/types'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { getDayAbbreviation } from '@/lib/schedule/utils'

interface ScheduleConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule?: RoutineSchedule
  onSave: (schedule: RoutineSchedule) => void
}

const frequencies: ScheduleFrequency[] = ['daily', 'weekly', 'monthly']
const daysOfWeek: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export function ScheduleConfigDialog({
  open,
  onOpenChange,
  schedule,
  onSave,
}: ScheduleConfigDialogProps) {
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

  // Reset form when schedule prop changes
  useEffect(() => {
    if (schedule) {
      setEnabled(schedule.enabled)
      setFrequency(schedule.frequency)
      setSelectedDays(schedule.daysOfWeek ?? ['mon', 'tue', 'wed', 'thu', 'fri'])
      setDayOfMonth(schedule.dayOfMonth ?? 1)
      setReminderTime(schedule.reminderTime ?? '09:00')
    }
  }, [schedule])

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
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
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('scheduleConfig.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t('scheduleConfig.enabled')}
            </span>
            <button
              onClick={() => setEnabled(!enabled)}
              className="flex items-center gap-2 text-sm"
            >
              {enabled ? (
                <ToggleRight className="h-6 w-6 text-zinc-700" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
          </div>

          {enabled && (
            <>
              {/* Frequency Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('scheduleConfig.frequency')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {frequencies.map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq)}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                        frequency === freq
                          ? 'border-zinc-400 bg-zinc-100 text-zinc-900'
                          : 'border-border hover:border-zinc-300'
                      )}
                    >
                      {t(`scheduleConfig.${freq}` as any)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly: Day Selection */}
              {frequency === 'weekly' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('scheduleConfig.daysOfWeek')}
                  </label>
                  <div className="flex gap-1">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={cn(
                          'w-10 h-10 rounded-full text-xs font-medium transition-all',
                          selectedDays.includes(day)
                            ? 'bg-zinc-800 text-white'
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('scheduleConfig.dayOfMonth')}
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                    className="w-24"
                  />
                </div>
              )}

              {/* Reminder Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t('scheduleConfig.reminderTime')}
                </label>
                <Input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-32"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('button.cancel')}
          </Button>
          <Button onClick={handleSave}>{t('button.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

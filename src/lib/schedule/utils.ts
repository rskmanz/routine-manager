import type { Routine, RoutineSchedule, DayOfWeek } from '@/types'

const dayOfWeekMap: Record<DayOfWeek, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
}

const dayOfWeekReverse: Record<number, DayOfWeek> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get a date string in YYYY-MM-DD format
 */
export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Check if a routine is due on a specific date
 */
export function isRoutineDueOnDate(routine: Routine, date: Date): boolean {
  if (!routine.schedule?.enabled) {
    return false
  }

  const schedule = routine.schedule
  const dayOfWeek = dayOfWeekReverse[date.getDay()]
  const dayOfMonth = date.getDate()

  switch (schedule.frequency) {
    case 'daily':
      return true

    case 'weekly':
      if (!schedule.daysOfWeek || schedule.daysOfWeek.length === 0) {
        return false
      }
      return schedule.daysOfWeek.includes(dayOfWeek)

    case 'monthly':
      if (!schedule.dayOfMonth) {
        return false
      }
      return schedule.dayOfMonth === dayOfMonth

    default:
      return false
  }
}

/**
 * Get routines due today
 */
export function getRoutinesDueToday(routines: Routine[]): Routine[] {
  const today = new Date()
  return routines.filter((routine) => isRoutineDueOnDate(routine, today))
}

/**
 * Get routines due on a specific date
 */
export function getRoutinesDueOnDate(routines: Routine[], date: Date): Routine[] {
  return routines.filter((routine) => isRoutineDueOnDate(routine, date))
}

/**
 * Get all scheduled routines
 */
export function getScheduledRoutines(routines: Routine[]): Routine[] {
  return routines.filter((routine) => routine.schedule?.enabled)
}

/**
 * Get the next occurrence date for a routine
 */
export function getNextOccurrence(routine: Routine, fromDate?: Date): Date | null {
  if (!routine.schedule?.enabled) {
    return null
  }

  const schedule = routine.schedule
  const startDate = fromDate || new Date()
  const maxDays = 365 // Search up to a year ahead

  for (let i = 0; i < maxDays; i++) {
    const checkDate = new Date(startDate)
    checkDate.setDate(checkDate.getDate() + i)

    if (isRoutineDueOnDate(routine, checkDate)) {
      return checkDate
    }
  }

  return null
}

/**
 * Get dates in a week starting from a specific date
 */
export function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    dates.push(date)
  }
  return dates
}

/**
 * Get the start of the current week (Sunday)
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Format a date for display
 */
export function formatDate(date: Date, locale: string = 'en'): string {
  return date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date for display with day of week
 */
export function formatDateWithDay(date: Date, locale: string = 'en'): string {
  return date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Get day of week abbreviation
 */
export function getDayAbbreviation(dayOfWeek: DayOfWeek, locale: string = 'en'): string {
  const abbreviations: Record<string, Record<DayOfWeek, string>> = {
    en: {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
    },
    ja: {
      sun: '日',
      mon: '月',
      tue: '火',
      wed: '水',
      thu: '木',
      fri: '金',
      sat: '土',
    },
  }
  return abbreviations[locale]?.[dayOfWeek] || abbreviations.en[dayOfWeek]
}

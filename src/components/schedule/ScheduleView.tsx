'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, Circle } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useRoutines, useGoals } from '@/hooks/useRoutines'
import { useCompletions } from '@/hooks/useCompletions'
import { RoutineCheckCard } from './RoutineCheckCard'
import { cn } from '@/lib/utils'
import {
  getRoutinesDueToday,
  getWeekDates,
  getWeekStart,
  formatDate,
  isToday,
  getTodayString,
  getDateString,
  isRoutineDueOnDate,
} from '@/lib/schedule/utils'
import { Button } from '@/components/ui/button'

type ViewMode = 'today' | 'week' | 'month'

export function ScheduleView() {
  const { t, locale } = useTranslation()
  const [viewMode, setViewMode] = useState<ViewMode>('today')
  const { routines } = useRoutines()
  const { goals } = useGoals()
  const {
    toggleCompletion,
    skipRoutine,
    getStreakInfo,
    getCompletionStatus,
  } = useCompletions()

  const today = getTodayString()
  const weekStart = getWeekStart(new Date())
  const weekDates = getWeekDates(weekStart)

  // Get routines due today
  const routinesDueToday = useMemo(() => {
    return getRoutinesDueToday(routines)
  }, [routines])

  // Calculate completion stats for today
  const todayStats = useMemo(() => {
    const completed = routinesDueToday.filter(
      (r) => getCompletionStatus(r.id, today) === 'completed'
    ).length
    return {
      completed,
      total: routinesDueToday.length,
    }
  }, [routinesDueToday, getCompletionStatus, today])

  // Get goal by ID
  const getGoalById = (goalId: string) => {
    return goals.find((g) => g.id === goalId)
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('schedule.title')}</h1>
            <p className="text-muted-foreground text-sm">
              {formatDate(new Date(), locale)}
            </p>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(['today', 'week'] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode)}
                className={cn(
                  'rounded-md',
                  viewMode === mode && 'bg-background shadow-sm'
                )}
              >
                {mode === 'today' ? t('schedule.today') : t('schedule.thisWeek')}
              </Button>
            ))}
          </div>
        </div>

        {/* Today's Routines */}
        {viewMode === 'today' && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                {t('schedule.todayRoutines')}
              </h2>
              <span className="text-sm text-muted-foreground">
                {todayStats.completed}/{todayStats.total} {t('schedule.completed')}
              </span>
            </div>

            {/* Progress Bar */}
            {routinesDueToday.length > 0 && (
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(todayStats.completed / todayStats.total) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            )}

            {/* Routine Cards */}
            {routinesDueToday.length > 0 ? (
              <div className="space-y-2">
                {routinesDueToday.map((routine) => (
                  <RoutineCheckCard
                    key={routine.id}
                    routine={routine}
                    goal={getGoalById(routine.goalId)}
                    streak={getStreakInfo(routine.id)}
                    status={getCompletionStatus(routine.id, today)}
                    onToggle={() => toggleCompletion(routine.id, today)}
                    onSkip={() => skipRoutine(routine.id, today)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState t={t} />
            )}
          </motion.section>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold">
              {t('schedule.weekOverview')}
            </h2>

            {/* Week Calendar */}
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date) => {
                const dateStr = getDateString(date)
                const routinesDue = routines.filter((r) =>
                  isRoutineDueOnDate(r, date)
                )
                const completed = routinesDue.filter(
                  (r) => getCompletionStatus(r.id, dateStr) === 'completed'
                )
                const isTodayDate = isToday(date)

                return (
                  <div
                    key={dateStr}
                    className={cn(
                      'p-3 rounded-xl border text-center transition-all',
                      isTodayDate
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800'
                        : 'border-border'
                    )}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {date.toLocaleDateString(
                        locale === 'ja' ? 'ja-JP' : 'en-US',
                        { weekday: 'short' }
                      )}
                    </div>
                    <div
                      className={cn(
                        'text-lg font-semibold mb-2',
                        isTodayDate && 'text-zinc-900 dark:text-zinc-100'
                      )}
                    >
                      {date.getDate()}
                    </div>

                    {/* Completion indicator */}
                    {routinesDue.length > 0 && (
                      <div className="flex justify-center gap-0.5">
                        {routinesDue.length === completed.length ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/30" />
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    {routinesDue.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {completed.length}/{routinesDue.length}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Today's routines in week view */}
            <div className="mt-6 space-y-4">
              <h3 className="text-md font-medium">
                {t('schedule.todayRoutines')}
              </h3>
              {routinesDueToday.length > 0 ? (
                <div className="space-y-2">
                  {routinesDueToday.map((routine) => (
                    <RoutineCheckCard
                      key={routine.id}
                      routine={routine}
                      goal={getGoalById(routine.goalId)}
                      streak={getStreakInfo(routine.id)}
                      status={getCompletionStatus(routine.id, today)}
                      onToggle={() => toggleCompletion(routine.id, today)}
                      onSkip={() => skipRoutine(routine.id, today)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState t={t} />
              )}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}

function EmptyState({ t }: { t: (key: any) => string }) {
  return (
    <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30">
      <CalendarDays className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
      <h3 className="font-medium text-lg mb-2">{t('schedule.noRoutines')}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {t('schedule.noRoutinesDesc')}
      </p>
    </div>
  )
}

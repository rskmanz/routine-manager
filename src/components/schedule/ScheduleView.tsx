'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, CheckCircle2, Circle, ChevronLeft, ChevronRight, ChevronDown, List, LayoutGrid } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useRoutines, useGoals, useCategories } from '@/hooks/useRoutines'
import { useCompletions } from '@/hooks/useCompletions'
import { useNavigation } from '@/contexts/NavigationContext'
import { RoutineCheckCard } from './RoutineCheckCard'
import { RoutineDetailSidebar } from './RoutineDetailSidebar'
import type { Routine, Goal, Category } from '@/types'
import { cn } from '@/lib/utils'
import {
  getRoutinesDueOnDate,
  getWeekDates,
  getWeekStart,
  formatDate,
  formatDateWithDay,
  formatMonthYear,
  isToday,
  isSameDay,
  getDateString,
  isRoutineDueOnDate,
} from '@/lib/schedule/utils'
import { Button } from '@/components/ui/button'
import { MonthCalendar } from './MonthCalendar'

type TimeGroup = 'day' | 'week' | 'month'
type LayoutMode = 'list' | 'board'
type ContentGroup = 'goal' | 'category'

export function ScheduleView() {
  const { t, locale } = useTranslation()
  const { navigateToView } = useNavigation()
  const [timeGroup, setTimeGroup] = useState<TimeGroup>('week')
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('board')
  const [contentGroup, setContentGroup] = useState<ContentGroup>('goal')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedRoutine, setSelectedRoutine] = useState<{ routine: Routine; dateStr: string } | null>(null)
  const { routines, updateRoutine } = useRoutines()
  const { goals } = useGoals()
  const { categories } = useCategories()
  const {
    toggleCompletion,
    skipRoutine,
    getStreakInfo,
    getCompletionStatus,
  } = useCompletions()

  // Handle task toggle within a routine
  const handleTaskToggle = (routineId: string, taskId: string) => {
    const routine = routines.find((r) => r.id === routineId)
    if (!routine?.tasks) return

    const updatedTasks = routine.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : undefined,
          }
        : task
    )
    updateRoutine(routineId, { tasks: updatedTasks })
  }

  // Handle adding a new task
  const handleTaskAdd = (routineId: string, title: string) => {
    const routine = routines.find((r) => r.id === routineId)
    const currentTasks = routine?.tasks || []

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    updateRoutine(routineId, { tasks: [...currentTasks, newTask] })
  }

  // Handle deleting a task
  const handleTaskDelete = (routineId: string, taskId: string) => {
    const routine = routines.find((r) => r.id === routineId)
    if (!routine?.tasks) return

    const updatedTasks = routine.tasks.filter((task) => task.id !== taskId)
    updateRoutine(routineId, { tasks: updatedTasks })
  }

  const selectedDateStr = getDateString(selectedDate)
  const weekStart = getWeekStart(selectedDate)
  const weekDates = getWeekDates(weekStart)

  // Get routines due on selected date
  const routinesDueOnSelectedDate = useMemo(() => {
    return getRoutinesDueOnDate(routines, selectedDate)
  }, [routines, selectedDate])

  // Calculate completion stats for selected date
  const selectedDateStats = useMemo(() => {
    const completed = routinesDueOnSelectedDate.filter(
      (r) => getCompletionStatus(r.id, selectedDateStr) === 'completed'
    ).length
    return {
      completed,
      total: routinesDueOnSelectedDate.length,
    }
  }, [routinesDueOnSelectedDate, getCompletionStatus, selectedDateStr])

  // Get goal by ID
  const getGoalById = (goalId: string) => {
    return goals.find((g) => g.id === goalId)
  }

  // Navigation functions
  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const goToPrevious = () => {
    const newDate = new Date(selectedDate)
    if (timeGroup === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    } else if (timeGroup === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setSelectedDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(selectedDate)
    if (timeGroup === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    } else if (timeGroup === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setSelectedDate(newDate)
  }

  // Format header date based on view mode
  const getHeaderDateText = () => {
    if (timeGroup === 'day') {
      return formatDateWithDay(selectedDate, locale)
    } else if (timeGroup === 'week') {
      const endDate = new Date(weekStart)
      endDate.setDate(endDate.getDate() + 6)
      return `${formatDate(weekStart, locale)} - ${formatDate(endDate, locale)}`
    } else {
      return formatMonthYear(selectedDate, locale)
    }
  }

  return (
    <div className="h-full overflow-auto flex">
      <div className="flex-1 max-w-5xl mx-auto p-6 space-y-6">
        {/* Header - Google Calendar Style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Today button + Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="rounded-lg"
            >
              {t('schedule.today')}
            </Button>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold ml-2">
              {getHeaderDateText()}
            </h1>
          </div>

          {/* Right: Layout + Unified Grouping */}
          <div className="flex items-center gap-3">
            {/* Layout Toggle */}
            <div className="flex gap-0.5 p-0.5 bg-muted rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLayoutMode('list')}
                className={cn(
                  'rounded-md h-7 px-2 transition-all',
                  layoutMode === 'list'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title={t('schedule.list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLayoutMode('board')}
                className={cn(
                  'rounded-md h-7 px-2 transition-all',
                  layoutMode === 'board'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title={t('schedule.board')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            {/* Unified Grouping */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t('schedule.groupBy')}:</span>
              <div className="flex items-center gap-1">
                {/* Time Grouping */}
                <div className="flex gap-0.5 p-0.5 bg-muted rounded-lg">
                  {(['day', 'week', 'month'] as TimeGroup[]).map((mode) => (
                    <Button
                      key={mode}
                      variant="ghost"
                      size="sm"
                      onClick={() => setTimeGroup(mode)}
                      className={cn(
                        'rounded-md h-7 px-3 text-xs font-medium transition-all',
                        timeGroup === mode
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {t(`schedule.${mode}`)}
                    </Button>
                  ))}
                </div>

                {/* Separator */}
                <div className="h-5 w-px bg-border" />

                {/* Content Grouping */}
                <div className="flex gap-0.5 p-0.5 bg-muted rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setContentGroup('goal')}
                    className={cn(
                      'rounded-md h-7 px-2 text-xs transition-all',
                      contentGroup === 'goal'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t('schedule.goal')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setContentGroup('category')}
                    className={cn(
                      'rounded-md h-7 px-2 text-xs transition-all',
                      contentGroup === 'category'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t('schedule.category')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Board Layout */}
        {layoutMode === 'board' && (
          <BoardView
            timeGroup={timeGroup}
            contentGroup={contentGroup}
            categories={categories}
            goals={goals}
            selectedDate={selectedDate}
            routines={routines}
            weekDates={weekDates}
            locale={locale}
            getCompletionStatus={getCompletionStatus}
            getGoalById={getGoalById}
            toggleCompletion={toggleCompletion}
            skipRoutine={skipRoutine}
            getStreakInfo={getStreakInfo}
            onRoutineSelect={(routine, dateStr) => setSelectedRoutine({ routine, dateStr })}
            onTaskToggle={handleTaskToggle}
            t={t}
          />
        )}

        {/* List Layout */}
        {layoutMode === 'list' && (
          <>
            {/* Day View */}
            {timeGroup === 'day' && (
              <motion.section
                key={selectedDateStr}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    {isToday(selectedDate) ? t('schedule.todayRoutines') : formatDateWithDay(selectedDate, locale)}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {selectedDateStats.completed}/{selectedDateStats.total} {t('schedule.completed')}
                  </span>
                </div>

                {/* Progress Bar */}
                {routinesDueOnSelectedDate.length > 0 && (
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(selectedDateStats.completed / selectedDateStats.total) * 100}%`,
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                )}

                {/* Grouped Routine Cards */}
                {routinesDueOnSelectedDate.length > 0 ? (
                  <GroupedListView
                    routines={routinesDueOnSelectedDate}
                    goals={goals}
                    categories={categories}
                    contentGroup={contentGroup}
                    dateStr={selectedDateStr}
                    getCompletionStatus={getCompletionStatus}
                    getStreakInfo={getStreakInfo}
                    toggleCompletion={toggleCompletion}
                    skipRoutine={skipRoutine}
                    onTaskToggle={handleTaskToggle}
                    onRoutineSelect={(routine, dateStr) => setSelectedRoutine({ routine, dateStr })}
                  />
                ) : (
                  <EmptyState t={t} />
                )}
              </motion.section>
            )}

            {/* Week View */}
            {timeGroup === 'week' && (
              <motion.section
                key={`week-${getDateString(weekStart)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
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
                    const isSelected = isSameDay(date, selectedDate)

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          'p-3 rounded-xl border text-center transition-all hover:bg-muted/50',
                          isTodayDate && 'border-primary bg-primary/5',
                          isSelected && !isTodayDate && 'border-zinc-400 dark:border-zinc-500 bg-muted',
                          !isTodayDate && !isSelected && 'border-border'
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
                            isTodayDate && 'text-primary'
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
                      </button>
                    )
                  })}
                </div>

                {/* Selected day's routines */}
                <div className="mt-6 space-y-4">
                  <h3 className="text-md font-medium flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {formatDateWithDay(selectedDate, locale)}
                  </h3>
                  {routinesDueOnSelectedDate.length > 0 ? (
                    <div className="space-y-2">
                      {routinesDueOnSelectedDate.map((routine) => (
                        <RoutineCheckCard
                          key={routine.id}
                          routine={routine}
                          goal={getGoalById(routine.goalId)}
                          streak={getStreakInfo(routine.id)}
                          status={getCompletionStatus(routine.id, selectedDateStr)}
                          onToggle={() => toggleCompletion(routine.id, selectedDateStr)}
                          onSkip={() => skipRoutine(routine.id, selectedDateStr)}
                          onTaskToggle={(taskId) => handleTaskToggle(routine.id, taskId)}
                          onSelect={() => setSelectedRoutine({ routine, dateStr: selectedDateStr })}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('schedule.noRoutinesOnDate')}
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* Month View */}
            {timeGroup === 'month' && (
              <MonthViewSection
                routines={routines}
                goals={goals}
                locale={locale}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                getCompletionStatus={getCompletionStatus}
                getGoalById={getGoalById}
                toggleCompletion={toggleCompletion}
                skipRoutine={skipRoutine}
                getStreakInfo={getStreakInfo}
                onTaskToggle={handleTaskToggle}
                onRoutineSelect={(routine, dateStr) => setSelectedRoutine({ routine, dateStr })}
                t={t}
              />
            )}
          </>
        )}
      </div>

      {/* Detail Sidebar */}
      <AnimatePresence>
        {selectedRoutine && (
          <RoutineDetailSidebar
            routine={selectedRoutine.routine}
            goal={goals.find((g) => g.id === selectedRoutine.routine.goalId)}
            streak={getStreakInfo(selectedRoutine.routine.id)}
            status={getCompletionStatus(selectedRoutine.routine.id, selectedRoutine.dateStr)}
            onClose={() => setSelectedRoutine(null)}
            onToggle={() => {
              toggleCompletion(selectedRoutine.routine.id, selectedRoutine.dateStr)
            }}
            onSkip={() => {
              skipRoutine(selectedRoutine.routine.id, selectedRoutine.dateStr)
            }}
            onTaskToggle={(taskId) => {
              handleTaskToggle(selectedRoutine.routine.id, taskId)
            }}
            onTaskAdd={(title) => {
              handleTaskAdd(selectedRoutine.routine.id, title)
            }}
            onTaskDelete={(taskId) => {
              handleTaskDelete(selectedRoutine.routine.id, taskId)
            }}
            onEdit={() => {
              navigateToView('editor', selectedRoutine.routine.id)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface MonthViewSectionProps {
  routines: Routine[]
  goals: Goal[]
  locale: string
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  getCompletionStatus: (routineId: string, date: string) => 'pending' | 'completed' | 'skipped' | null
  getGoalById: (goalId: string) => Goal | undefined
  toggleCompletion: (routineId: string, date: string) => void
  skipRoutine: (routineId: string, date: string) => void
  getStreakInfo: (routineId: string) => { currentStreak: number; longestStreak: number; totalCompletions: number }
  onTaskToggle: (routineId: string, taskId: string) => void
  onRoutineSelect: (routine: Routine, dateStr: string) => void
  t: (key: any) => string
}

function MonthViewSection({
  routines,
  goals,
  locale,
  selectedDate,
  getCompletionStatus,
  getGoalById,
  toggleCompletion,
  skipRoutine,
  getStreakInfo,
  onTaskToggle,
  onRoutineSelect,
  t,
}: MonthViewSectionProps) {
  const [clickedDate, setClickedDate] = React.useState<Date | null>(null)

  const clickedDateStr = clickedDate ? getDateString(clickedDate) : null
  const routinesForClickedDate = clickedDate
    ? getRoutinesDueOnDate(routines, clickedDate)
    : []

  const handleDateClick = (date: Date) => {
    setClickedDate(date)
  }

  return (
    <motion.section
      key={`month-${selectedDate.getMonth()}-${selectedDate.getFullYear()}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <MonthCalendar
        routines={routines}
        goals={goals}
        locale={locale}
        currentDate={selectedDate}
        getCompletionStatus={getCompletionStatus}
        onDateClick={handleDateClick}
      />

      {/* Clicked date routines */}
      {clickedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-md font-medium flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatDateWithDay(clickedDate, locale)}
          </h3>

          {routinesForClickedDate.length > 0 ? (
            <div className="space-y-2">
              {routinesForClickedDate.map((routine) => (
                <RoutineCheckCard
                  key={routine.id}
                  routine={routine}
                  goal={getGoalById(routine.goalId)}
                  streak={getStreakInfo(routine.id)}
                  status={getCompletionStatus(routine.id, clickedDateStr!)}
                  onToggle={() => toggleCompletion(routine.id, clickedDateStr!)}
                  onSkip={() => skipRoutine(routine.id, clickedDateStr!)}
                  onTaskToggle={(taskId) => onTaskToggle(routine.id, taskId)}
                  onSelect={() => onRoutineSelect(routine, clickedDateStr!)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t('schedule.noRoutinesOnDate')}
            </div>
          )}
        </motion.div>
      )}
    </motion.section>
  )
}

interface BoardViewProps {
  timeGroup: TimeGroup
  contentGroup: ContentGroup
  categories: Category[]
  goals: Goal[]
  selectedDate: Date
  routines: Routine[]
  weekDates: Date[]
  locale: string
  getCompletionStatus: (routineId: string, date: string) => 'pending' | 'completed' | 'skipped' | null
  getGoalById: (goalId: string) => Goal | undefined
  toggleCompletion: (routineId: string, date: string) => void
  skipRoutine: (routineId: string, date: string) => void
  getStreakInfo: (routineId: string) => { currentStreak: number; longestStreak: number; totalCompletions: number }
  onRoutineSelect: (routine: Routine, dateStr: string) => void
  onTaskToggle: (routineId: string, taskId: string) => void
  t: (key: any) => string
}

function BoardView({
  timeGroup,
  contentGroup,
  categories,
  goals,
  selectedDate,
  routines,
  weekDates,
  locale,
  getCompletionStatus,
  toggleCompletion,
  onRoutineSelect,
  onTaskToggle,
}: BoardViewProps) {
  const selectedDateStr = getDateString(selectedDate)

  // Helper to get category for a routine (via goal)
  const getCategoryForRoutine = (routine: Routine): Category | undefined => {
    const goal = goals.find((g) => g.id === routine.goalId)
    if (!goal) return undefined
    return categories.find((c) => c.id === goal.categoryId)
  }

  // Use the BoardRoutineCard component defined below
  const renderRoutineCard = (
    routine: Routine,
    dateStr: string,
    showGoal: boolean,
    delay: number
  ) => {
    const goal = goals.find((g) => g.id === routine.goalId)
    return (
      <BoardRoutineCard
        key={routine.id}
        routine={routine}
        dateStr={dateStr}
        showGoal={showGoal}
        delay={delay}
        goal={goal}
        getCompletionStatus={getCompletionStatus}
        toggleCompletion={toggleCompletion}
        onSelect={() => onRoutineSelect(routine, dateStr)}
        onTaskToggle={(taskId) => onTaskToggle(routine.id, taskId)}
      />
    )
  }

  // Day view: Columns based on contentGroup (goal or category)
  if (timeGroup === 'day') {
    const routinesDueToday = routines.filter((r) => isRoutineDueOnDate(r, selectedDate))

    if (contentGroup === 'category') {
      // Group by category
      const categoriesWithRoutines = categories.filter((cat) =>
        routinesDueToday.some((r) => {
          const goal = goals.find((g) => g.id === r.goalId)
          return goal?.categoryId === cat.id
        })
      )

      return (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3 min-w-max">
              {categoriesWithRoutines.map((category, catIndex) => {
                const catRoutines = routinesDueToday.filter((r) => {
                  const goal = goals.find((g) => g.id === r.goalId)
                  return goal?.categoryId === category.id
                })

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: catIndex * 0.05 }}
                    className="w-56 flex-shrink-0 rounded-xl border-2 border-border bg-muted/30 p-3 min-h-[300px]"
                  >
                    <div className="mb-3 text-center">
                      <div className="text-sm font-semibold truncate">{category.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {catRoutines.length} {locale === 'ja' ? '件' : 'items'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {catRoutines.map((routine, index) =>
                        renderRoutineCard(
                          routine,
                          selectedDateStr,
                          true,
                          catIndex * 0.05 + index * 0.02
                        )
                      )}
                    </div>
                  </motion.div>
                )
              })}
              {categoriesWithRoutines.length === 0 && (
                <div className="text-center py-12 text-muted-foreground w-full">
                  {locale === 'ja' ? 'この日にルーティンはありません' : 'No routines for this day'}
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )
    }

    // Group by goal (default)
    const goalsWithRoutines = goals.filter((g) => routinesDueToday.some((r) => r.goalId === g.id))

    return (
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {goalsWithRoutines.map((goal, goalIndex) => {
              const goalRoutines = routinesDueToday.filter((r) => r.goalId === goal.id)

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: goalIndex * 0.05 }}
                  className="w-56 flex-shrink-0 rounded-xl border-2 border-border bg-muted/30 p-3 min-h-[300px]"
                >
                  <div className="mb-3 text-center">
                    <div className="text-2xl mb-1">{goal.icon || '📌'}</div>
                    <div className="text-sm font-semibold truncate">{goal.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {goalRoutines.length} {locale === 'ja' ? '件' : 'items'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {goalRoutines.map((routine, index) =>
                      renderRoutineCard(
                        routine,
                        selectedDateStr,
                        false,
                        goalIndex * 0.05 + index * 0.02
                      )
                    )}
                  </div>
                </motion.div>
              )
            })}
            {goalsWithRoutines.length === 0 && (
              <div className="text-center py-12 text-muted-foreground w-full">
                {locale === 'ja' ? 'この日にルーティンはありません' : 'No routines for this day'}
              </div>
            )}
          </div>
        </div>
      </motion.section>
    )
  }

  // Week/Month view: Day-based columns with sub-groups
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {weekDates.map((date, dateIndex) => {
            const dateStr = getDateString(date)
            const routinesDue = routines.filter((r) => isRoutineDueOnDate(r, date))
            const isTodayDate = isToday(date)
            const dayOfWeek = date.getDay()

            // Group routines inside day column
            const groupedRoutines =
              contentGroup === 'category'
                ? categories
                    .map((cat) => ({
                      id: cat.id,
                      title: cat.title,
                      icon: undefined as string | undefined,
                      routines: routinesDue.filter((r) => {
                        const goal = goals.find((g) => g.id === r.goalId)
                        return goal?.categoryId === cat.id
                      }),
                    }))
                    .filter((g) => g.routines.length > 0)
                : goals
                    .map((goal) => ({
                      id: goal.id,
                      title: goal.title,
                      icon: goal.icon,
                      routines: routinesDue.filter((r) => r.goalId === goal.id),
                    }))
                    .filter((g) => g.routines.length > 0)

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.05 }}
                className={cn(
                  'w-52 flex-shrink-0 rounded-xl border-2 bg-muted/30 p-3 min-h-[300px]',
                  isTodayDate ? 'border-primary/50 bg-primary/5' : 'border-border'
                )}
              >
                {/* Day Header */}
                <div className="mb-3 text-center">
                  <div
                    className={cn(
                      'text-xs font-medium uppercase tracking-wide',
                      dayOfWeek === 0 && 'text-red-500',
                      dayOfWeek === 6 && 'text-blue-500',
                      dayOfWeek !== 0 && dayOfWeek !== 6 && 'text-muted-foreground'
                    )}
                  >
                    {date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', { weekday: 'short' })}
                  </div>
                  <div className={cn('text-xl font-bold', isTodayDate && 'text-primary')}>{date.getDate()}</div>
                  <div className="text-xs text-muted-foreground">
                    {routinesDue.length} {locale === 'ja' ? '件' : 'items'}
                  </div>
                </div>

                {/* Grouped Routines */}
                <div className="space-y-3">
                  {groupedRoutines.map((group, groupIndex) => (
                    <div key={group.id} className="space-y-1">
                      {/* Group Header */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground border-b border-border/50 pb-1">
                        {group.icon && <span>{group.icon}</span>}
                        <span className="truncate font-medium">{group.title}</span>
                        <span className="ml-auto text-[10px]">{group.routines.length}</span>
                      </div>
                      {/* Routine Cards */}
                      <div className="space-y-1">
                        {group.routines.map((routine, index) =>
                          renderRoutineCard(
                            routine,
                            dateStr,
                            false,
                            dateIndex * 0.05 + groupIndex * 0.02 + index * 0.01
                          )
                        )}
                      </div>
                    </div>
                  ))}
                  {routinesDue.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground/40 text-xs">—</div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

interface GroupedListViewProps {
  routines: Routine[]
  goals: Goal[]
  categories: Category[]
  contentGroup: ContentGroup
  dateStr: string
  getCompletionStatus: (routineId: string, date: string) => 'pending' | 'completed' | 'skipped' | null
  getStreakInfo: (routineId: string) => { currentStreak: number; longestStreak: number; totalCompletions: number }
  toggleCompletion: (routineId: string, date: string) => void
  skipRoutine: (routineId: string, date: string) => void
  onTaskToggle: (routineId: string, taskId: string) => void
  onRoutineSelect: (routine: Routine, dateStr: string) => void
}

function GroupedListView({
  routines,
  goals,
  categories,
  contentGroup,
  dateStr,
  getCompletionStatus,
  getStreakInfo,
  toggleCompletion,
  skipRoutine,
  onTaskToggle,
  onRoutineSelect,
}: GroupedListViewProps) {
  // Group routines
  const groups =
    contentGroup === 'category'
      ? categories
          .map((cat) => ({
            id: cat.id,
            title: cat.title,
            icon: undefined as string | undefined,
            routines: routines.filter((r) => {
              const goal = goals.find((g) => g.id === r.goalId)
              return goal?.categoryId === cat.id
            }),
          }))
          .filter((g) => g.routines.length > 0)
      : goals
          .map((goal) => ({
            id: goal.id,
            title: goal.title,
            icon: goal.icon,
            routines: routines.filter((r) => r.goalId === goal.id),
          }))
          .filter((g) => g.routines.length > 0)

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id} className="space-y-2">
          {/* Group Header */}
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            {group.icon && <span className="text-base">{group.icon}</span>}
            <span>{group.title}</span>
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{group.routines.length}</span>
          </div>
          {/* Routine Cards */}
          <div className="space-y-2 pl-2 border-l-2 border-muted">
            {group.routines.map((routine) => {
              const goal = goals.find((g) => g.id === routine.goalId)
              return (
                <RoutineCheckCard
                  key={routine.id}
                  routine={routine}
                  goal={goal}
                  streak={getStreakInfo(routine.id)}
                  status={getCompletionStatus(routine.id, dateStr)}
                  onToggle={() => toggleCompletion(routine.id, dateStr)}
                  onSkip={() => skipRoutine(routine.id, dateStr)}
                  onTaskToggle={(taskId) => onTaskToggle(routine.id, taskId)}
                  onSelect={() => onRoutineSelect(routine, dateStr)}
                />
              )
            })}
          </div>
        </div>
      ))}
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

interface BoardRoutineCardProps {
  routine: Routine
  dateStr: string
  showGoal?: boolean
  delay?: number
  goal?: Goal
  getCompletionStatus: (routineId: string, date: string) => 'pending' | 'completed' | 'skipped' | null
  toggleCompletion: (routineId: string, date: string) => void
  onSelect?: () => void
  onTaskToggle?: (taskId: string) => void
}

function BoardRoutineCard({
  routine,
  dateStr,
  showGoal = false,
  delay = 0,
  goal,
  getCompletionStatus,
  toggleCompletion,
  onSelect,
  onTaskToggle,
}: BoardRoutineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const status = getCompletionStatus(routine.id, dateStr)
  const isCompleted = status === 'completed'
  const isSkipped = status === 'skipped'
  const tasks = routine.tasks || []
  const hasTasks = tasks.length > 0
  const completedTasks = tasks.filter((t) => t.completed).length

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={cn(
        'p-2 rounded-lg border bg-background shadow-sm transition-all hover:shadow-md',
        isCompleted && 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
        isSkipped && 'bg-muted/50 opacity-60'
      )}
    >
      <div className="flex items-start gap-1.5">
        {/* Expand Toggle */}
        {hasTasks ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <div className="w-3.5" />
        )}

        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleCompletion(routine.id, dateStr)
          }}
          className={cn(
            'mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/30 hover:border-muted-foreground'
          )}
        >
          {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
        </button>

        {/* Content - click to open sidebar */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.()
          }}
        >
          <div className="flex items-center gap-1">
            <p
              className={cn(
                'text-sm font-medium leading-tight truncate',
                (isCompleted || isSkipped) && 'line-through text-muted-foreground'
              )}
            >
              {routine.title}
            </p>
            {hasTasks && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded flex-shrink-0">
                {completedTasks}/{tasks.length}
              </span>
            )}
          </div>
          {showGoal && goal && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {goal.icon} {goal.title}
            </p>
          )}
        </div>
      </div>

      {/* Expanded tasks */}
      {isExpanded && hasTasks && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-2 pl-6 space-y-1 border-t border-border/50 pt-2"
        >
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={(e) => {
                e.stopPropagation()
                onTaskToggle?.(task.id)
              }}
              className="flex items-center gap-1.5 text-xs w-full text-left hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
            >
              {task.completed ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
              )}
              <span className={cn(task.completed && 'line-through text-muted-foreground')}>
                {task.title}
              </span>
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

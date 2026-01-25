'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Flame,
  Calendar,
  CheckCircle2,
  Circle,
  ExternalLink,
  SkipForward,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react'
import type { Routine, Goal, StreakInfo } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/hooks/useTranslation'

interface RoutineDetailSidebarProps {
  routine: Routine
  goal?: Goal
  streak: StreakInfo
  status: 'pending' | 'completed' | 'skipped' | null
  onClose: () => void
  onToggle: () => void
  onSkip: () => void
  onTaskToggle: (taskId: string) => void
  onTaskAdd: (title: string) => void
  onTaskDelete: (taskId: string) => void
  onEdit: () => void
}

export function RoutineDetailSidebar({
  routine,
  goal,
  streak,
  status,
  onClose,
  onToggle,
  onSkip,
  onTaskToggle,
  onTaskAdd,
  onTaskDelete,
  onEdit,
}: RoutineDetailSidebarProps) {
  const { t, locale } = useTranslation()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const isCompleted = status === 'completed'
  const isSkipped = status === 'skipped'
  const tasks = routine.tasks || []
  const completedTasks = tasks.filter((t) => t.completed).length
  const schedule = routine.schedule

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    onTaskAdd(newTaskTitle.trim())
    setNewTaskTitle('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTask()
    }
  }

  const getFrequencyLabel = () => {
    if (!schedule?.enabled) return locale === 'ja' ? '未設定' : 'Not scheduled'
    switch (schedule.frequency) {
      case 'daily':
        return locale === 'ja' ? '毎日' : 'Daily'
      case 'weekly':
        return locale === 'ja' ? '毎週' : 'Weekly'
      case 'monthly':
        return locale === 'ja' ? '毎月' : 'Monthly'
      default:
        return schedule.frequency
    }
  }

  const getDaysLabel = () => {
    if (!schedule?.enabled || schedule.frequency !== 'weekly') return null
    if (!schedule.daysOfWeek?.length) return null

    const dayNames: Record<string, string> =
      locale === 'ja'
        ? { sun: '日', mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土' }
        : { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' }

    return schedule.daysOfWeek.map((d) => dayNames[d]).join(', ')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-80 flex-shrink-0 rounded-2xl border border-border bg-card shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{routine.title}</h3>
            {goal && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <span>{goal.icon || '📌'}</span>
                <span className="truncate">{goal.title}</span>
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status badge */}
        <div className="mt-3">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              {locale === 'ja' ? '完了' : 'Completed'}
            </span>
          ) : isSkipped ? (
            <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              <SkipForward className="h-3 w-3" />
              {locale === 'ja' ? 'スキップ' : 'Skipped'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full">
              <Circle className="h-3 w-3" />
              {locale === 'ja' ? '未完了' : 'Pending'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {/* Streak */}
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-orange-500 mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-medium">
                {locale === 'ja' ? '連続' : 'Streak'}
              </span>
            </div>
            <p className="text-xl font-bold">
              {streak.currentStreak}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                {locale === 'ja' ? '日' : 'days'}
              </span>
            </p>
          </div>

          {/* Schedule */}
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">
                {locale === 'ja' ? 'スケジュール' : 'Schedule'}
              </span>
            </div>
            <p className="text-sm font-semibold">{getFrequencyLabel()}</p>
            {getDaysLabel() && (
              <p className="text-xs text-muted-foreground">{getDaysLabel()}</p>
            )}
          </div>
        </div>

        {/* Reminder time */}
        {schedule?.reminderTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {locale === 'ja' ? 'リマインダー' : 'Reminder'}: {schedule.reminderTime}
            </span>
          </div>
        )}

        {/* Tasks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">
              {locale === 'ja' ? 'タスク' : 'Tasks'}
            </h4>
            {tasks.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {completedTasks}/{tasks.length}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {tasks.length > 0 && (
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Task list */}
          <div className="space-y-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <button
                  onClick={() => onTaskToggle(task.id)}
                  className="flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40 hover:text-muted-foreground" />
                  )}
                </button>
                <span
                  className={cn(
                    'flex-1 text-sm',
                    task.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => onTaskDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>

          {/* Add task input */}
          <div className="flex gap-2 mt-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={locale === 'ja' ? '新しいタスク...' : 'New task...'}
              className="flex-1 h-8 text-sm"
            />
            <Button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              size="sm"
              variant="outline"
              className="h-8 px-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border bg-muted/30 space-y-2">
        {!isCompleted && !isSkipped && (
          <Button onClick={onToggle} className="w-full gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {locale === 'ja' ? '完了にする' : 'Mark Complete'}
          </Button>
        )}
        {isCompleted && (
          <Button onClick={onToggle} variant="outline" className="w-full gap-2">
            <Circle className="h-4 w-4" />
            {locale === 'ja' ? '未完了に戻す' : 'Mark Incomplete'}
          </Button>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1 gap-2"
            disabled={isSkipped}
          >
            <SkipForward className="h-4 w-4" />
            {locale === 'ja' ? 'スキップ' : 'Skip'}
          </Button>
          <Button variant="outline" onClick={onEdit} className="flex-1 gap-2">
            <ExternalLink className="h-4 w-4" />
            {locale === 'ja' ? '編集' : 'Edit'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

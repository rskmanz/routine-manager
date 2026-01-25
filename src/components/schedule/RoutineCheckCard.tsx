'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, MoreHorizontal, ExternalLink, SkipForward, ChevronDown, ChevronRight, Circle, CheckCircle2 } from 'lucide-react'
import type { Routine, Goal, StreakInfo, CompletionRecord, RoutineTask } from '@/types'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { StreakBadge } from './StreakBadge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigation } from '@/contexts/NavigationContext'

interface RoutineCheckCardProps {
  routine: Routine
  goal?: Goal
  streak: StreakInfo
  status: CompletionRecord['status'] | null
  onToggle: () => void
  onSkip: () => void
  onTaskToggle?: (taskId: string) => void
  onSelect?: () => void
}

export function RoutineCheckCard({
  routine,
  goal,
  streak,
  status,
  onToggle,
  onSkip,
  onTaskToggle,
  onSelect,
}: RoutineCheckCardProps) {
  const { t } = useTranslation()
  const { navigateToView } = useNavigation()
  const [isExpanded, setIsExpanded] = useState(false)
  const isCompleted = status === 'completed'
  const isSkipped = status === 'skipped'
  const tasks = routine.tasks || []
  const hasTasks = tasks.length > 0
  const completedTasks = tasks.filter((t) => t.completed).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border transition-all overflow-hidden',
        isCompleted
          ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
          : isSkipped
          ? 'bg-muted/50 border-border opacity-60'
          : 'bg-card border-border hover:border-zinc-400 hover:shadow-sm'
      )}
    >
      {/* Main Row */}
      <div className="group flex items-center gap-3 p-4">
        {/* Expand Toggle (only if has tasks) */}
        {hasTasks ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            'flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all',
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-muted-foreground/30 hover:border-zinc-500'
          )}
        >
          {isCompleted && <Check className="h-4 w-4" />}
        </button>

        {/* Content */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onSelect?.()}
        >
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                'font-medium text-sm truncate',
                isCompleted && 'line-through text-muted-foreground'
              )}
            >
              {routine.title}
            </h4>
            {hasTasks && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {completedTasks}/{tasks.length}
              </span>
            )}
          </div>
          {goal && (
            <p className="text-xs text-muted-foreground truncate">{goal.title}</p>
          )}
        </div>

        {/* Streak Badge */}
        {streak.currentStreak > 0 && (
          <StreakBadge streak={streak.currentStreak} />
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSkip}>
                <SkipForward className="h-4 w-4 mr-2" />
                {t('schedule.skip')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigateToView('editor', routine.id)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('nav.editor')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Expandable Tasks */}
      <AnimatePresence>
        {isExpanded && hasTasks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pl-12 space-y-1 border-t border-border/50">
              <div className="pt-2" />
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 py-1 group/task"
                >
                  <button
                    onClick={() => onTaskToggle?.(task.id)}
                    className="flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
                    )}
                  </button>
                  <span
                    className={cn(
                      'text-sm',
                      task.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

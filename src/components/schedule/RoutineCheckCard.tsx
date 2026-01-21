'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, MoreHorizontal, ExternalLink, SkipForward } from 'lucide-react'
import type { Routine, Goal, StreakInfo, CompletionRecord } from '@/types'
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
}

export function RoutineCheckCard({
  routine,
  goal,
  streak,
  status,
  onToggle,
  onSkip,
}: RoutineCheckCardProps) {
  const { t } = useTranslation()
  const { navigateToView } = useNavigation()
  const isCompleted = status === 'completed'
  const isSkipped = status === 'skipped'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group flex items-center gap-3 p-4 rounded-xl border transition-all',
        isCompleted
          ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
          : isSkipped
          ? 'bg-muted/50 border-border opacity-60'
          : 'bg-card border-border hover:border-primary/30 hover:shadow-sm'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          'flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all',
          isCompleted
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-muted-foreground/30 hover:border-primary'
        )}
      >
        {isCompleted && <Check className="h-4 w-4" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            'font-medium text-sm truncate',
            isCompleted && 'line-through text-muted-foreground'
          )}
        >
          {routine.title}
        </h4>
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
    </motion.div>
  )
}

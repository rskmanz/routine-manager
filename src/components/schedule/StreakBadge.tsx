'use client'

import React from 'react'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

interface StreakBadgeProps {
  streak: number
  className?: string
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  const { t } = useTranslation()

  if (streak === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        streak >= 7
          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
          : streak >= 3
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        className
      )}
    >
      <Flame className={cn('h-3 w-3', streak >= 7 && 'animate-pulse')} />
      <span>
        {streak} {t('schedule.streak')}
      </span>
    </div>
  )
}

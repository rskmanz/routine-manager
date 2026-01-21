'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CompletionRecord, StreakInfo } from '@/types'
import {
  getCompletions,
  getCompletionsByRoutine,
  getCompletionsByDate,
  getCompletionsInRange,
  getCompletionByRoutineAndDate,
  createCompletion,
  updateCompletion,
  deleteCompletion,
  calculateStreak,
} from '@/lib/storage'
import { getTodayString } from '@/lib/schedule/utils'

export function useCompletions(routineId?: string) {
  const [completions, setCompletions] = useState<CompletionRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadCompletions = useCallback(() => {
    setLoading(true)
    try {
      const data = routineId ? getCompletionsByRoutine(routineId) : getCompletions()
      setCompletions(data)
    } finally {
      setLoading(false)
    }
  }, [routineId])

  useEffect(() => {
    loadCompletions()
  }, [loadCompletions])

  const markComplete = useCallback((routineId: string, date?: string) => {
    const scheduledDate = date || getTodayString()
    const existing = getCompletionByRoutineAndDate(routineId, scheduledDate)

    if (existing) {
      const updated = updateCompletion(existing.id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      })
      if (updated) {
        setCompletions((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        )
      }
      return updated
    } else {
      const created = createCompletion({
        routineId,
        scheduledDate,
        status: 'completed',
        completedAt: new Date().toISOString(),
      })
      setCompletions((prev) => [...prev, created])
      return created
    }
  }, [])

  const markIncomplete = useCallback((routineId: string, date?: string) => {
    const scheduledDate = date || getTodayString()
    const existing = getCompletionByRoutineAndDate(routineId, scheduledDate)

    if (existing) {
      const updated = updateCompletion(existing.id, {
        status: 'pending',
        completedAt: undefined,
      })
      if (updated) {
        setCompletions((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        )
      }
      return updated
    }
    return null
  }, [])

  const skipRoutine = useCallback((routineId: string, date?: string) => {
    const scheduledDate = date || getTodayString()
    const existing = getCompletionByRoutineAndDate(routineId, scheduledDate)

    if (existing) {
      const updated = updateCompletion(existing.id, {
        status: 'skipped',
      })
      if (updated) {
        setCompletions((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        )
      }
      return updated
    } else {
      const created = createCompletion({
        routineId,
        scheduledDate,
        status: 'skipped',
      })
      setCompletions((prev) => [...prev, created])
      return created
    }
  }, [])

  const toggleCompletion = useCallback((routineId: string, date?: string) => {
    const scheduledDate = date || getTodayString()
    const existing = getCompletionByRoutineAndDate(routineId, scheduledDate)

    if (existing?.status === 'completed') {
      return markIncomplete(routineId, scheduledDate)
    } else {
      return markComplete(routineId, scheduledDate)
    }
  }, [markComplete, markIncomplete])

  const getStreakInfo = useCallback((routineId: string): StreakInfo => {
    return calculateStreak(routineId)
  }, [])

  const isCompletedOnDate = useCallback((routineId: string, date: string): boolean => {
    const completion = getCompletionByRoutineAndDate(routineId, date)
    return completion?.status === 'completed'
  }, [])

  const getCompletionStatus = useCallback((routineId: string, date: string): CompletionRecord['status'] | null => {
    const completion = getCompletionByRoutineAndDate(routineId, date)
    return completion?.status || null
  }, [])

  return {
    completions,
    loading,
    markComplete,
    markIncomplete,
    skipRoutine,
    toggleCompletion,
    getStreakInfo,
    isCompletedOnDate,
    getCompletionStatus,
    refresh: loadCompletions,
  }
}

export function useTodayCompletions() {
  const today = getTodayString()
  const [completions, setCompletions] = useState<CompletionRecord[]>([])

  useEffect(() => {
    setCompletions(getCompletionsByDate(today))
  }, [today])

  return completions
}

export function useWeekCompletions() {
  const [completions, setCompletions] = useState<CompletionRecord[]>([])

  useEffect(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const startStr = startOfWeek.toISOString().split('T')[0]
    const endStr = endOfWeek.toISOString().split('T')[0]

    setCompletions(getCompletionsInRange(startStr, endStr))
  }, [])

  return completions
}

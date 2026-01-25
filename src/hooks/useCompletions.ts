'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { CompletionRecord, StreakInfo } from '@/types'
import * as localStorage from '@/lib/storage'
import * as apiStorage from '@/lib/api-storage'
import { getTodayString } from '@/lib/schedule/utils'

export function useCompletions(routineId?: string) {
  const { isSignedIn, isLoaded } = useAuth()
  const [completions, setCompletions] = useState<CompletionRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadCompletions = useCallback(async () => {
    if (!isLoaded) return

    setLoading(true)
    try {
      let data: CompletionRecord[]
      if (isSignedIn) {
        if (routineId) {
          data = await apiStorage.getCompletionsByRoutine(routineId)
        } else {
          data = await apiStorage.getCompletions()
        }
      } else {
        data = routineId
          ? localStorage.getCompletionsByRoutine(routineId)
          : localStorage.getCompletions()
      }
      setCompletions(data)
    } catch (error) {
      console.error('Failed to load completions:', error)
      setCompletions([])
    } finally {
      setLoading(false)
    }
  }, [routineId, isSignedIn, isLoaded])

  useEffect(() => {
    loadCompletions()
  }, [loadCompletions])

  const markComplete = useCallback(async (routineId: string, date?: string) => {
    const scheduledDate = date || getTodayString()

    let existing: CompletionRecord | undefined
    if (isSignedIn) {
      existing = await apiStorage.getCompletionByRoutineAndDate(routineId, scheduledDate)
    } else {
      existing = localStorage.getCompletionByRoutineAndDate(routineId, scheduledDate)
    }

    if (existing) {
      const updated = isSignedIn
        ? await apiStorage.updateCompletion(existing.id, {
            status: 'completed',
            completedAt: new Date().toISOString(),
          })
        : localStorage.updateCompletion(existing.id, {
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
      const created = isSignedIn
        ? await apiStorage.createCompletion({
            routineId,
            scheduledDate,
            status: 'completed',
            completedAt: new Date().toISOString(),
          })
        : localStorage.createCompletion({
            routineId,
            scheduledDate,
            status: 'completed',
            completedAt: new Date().toISOString(),
          })
      setCompletions((prev) => [...prev, created])
      return created
    }
  }, [isSignedIn])

  const markIncomplete = useCallback(async (routineId: string, date?: string) => {
    const scheduledDate = date || getTodayString()

    let existing: CompletionRecord | undefined
    if (isSignedIn) {
      existing = await apiStorage.getCompletionByRoutineAndDate(routineId, scheduledDate)
    } else {
      existing = localStorage.getCompletionByRoutineAndDate(routineId, scheduledDate)
    }

    if (existing) {
      const updated = isSignedIn
        ? await apiStorage.updateCompletion(existing.id, {
            status: 'pending',
            completedAt: undefined,
          })
        : localStorage.updateCompletion(existing.id, {
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
  }, [isSignedIn])

  const skipRoutine = useCallback(async (routineId: string, date?: string) => {
    const scheduledDate = date || getTodayString()

    let existing: CompletionRecord | undefined
    if (isSignedIn) {
      existing = await apiStorage.getCompletionByRoutineAndDate(routineId, scheduledDate)
    } else {
      existing = localStorage.getCompletionByRoutineAndDate(routineId, scheduledDate)
    }

    if (existing) {
      const updated = isSignedIn
        ? await apiStorage.updateCompletion(existing.id, { status: 'skipped' })
        : localStorage.updateCompletion(existing.id, { status: 'skipped' })
      if (updated) {
        setCompletions((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        )
      }
      return updated
    } else {
      const created = isSignedIn
        ? await apiStorage.createCompletion({
            routineId,
            scheduledDate,
            status: 'skipped',
          })
        : localStorage.createCompletion({
            routineId,
            scheduledDate,
            status: 'skipped',
          })
      setCompletions((prev) => [...prev, created])
      return created
    }
  }, [isSignedIn])

  const toggleCompletion = useCallback(async (routineId: string, date?: string) => {
    const scheduledDate = date || getTodayString()

    let existing: CompletionRecord | undefined
    if (isSignedIn) {
      existing = await apiStorage.getCompletionByRoutineAndDate(routineId, scheduledDate)
    } else {
      existing = localStorage.getCompletionByRoutineAndDate(routineId, scheduledDate)
    }

    if (existing?.status === 'completed') {
      return markIncomplete(routineId, scheduledDate)
    } else {
      return markComplete(routineId, scheduledDate)
    }
  }, [isSignedIn, markComplete, markIncomplete])

  // Synchronous lookup from cached completions
  const getStreakInfo = useCallback((routineId: string): StreakInfo => {
    const routineCompletions = completions
      .filter(c => c.routineId === routineId && c.status === 'completed')
      .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))

    if (routineCompletions.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
      }
    }

    const today = new Date().toISOString().split('T')[0]
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1

    const lastDate = routineCompletions[0].scheduledDate
    const daysDiff = Math.floor(
      (new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysDiff <= 1) {
      currentStreak = 1
      for (let i = 1; i < routineCompletions.length; i++) {
        const prevDate = new Date(routineCompletions[i - 1].scheduledDate)
        const currDate = new Date(routineCompletions[i].scheduledDate)
        const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diff === 1) {
          currentStreak++
        } else {
          break
        }
      }
    }

    for (let i = 1; i < routineCompletions.length; i++) {
      const prevDate = new Date(routineCompletions[i - 1].scheduledDate)
      const currDate = new Date(routineCompletions[i].scheduledDate)
      const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

    return {
      currentStreak,
      longestStreak,
      lastCompletedDate: routineCompletions[0]?.scheduledDate,
      totalCompletions: routineCompletions.length,
    }
  }, [completions])

  const isCompletedOnDate = useCallback((routineId: string, date: string): boolean => {
    const completion = completions.find(c => c.routineId === routineId && c.scheduledDate === date)
    return completion?.status === 'completed'
  }, [completions])

  const getCompletionStatus = useCallback((routineId: string, date: string): CompletionRecord['status'] | null => {
    const completion = completions.find(c => c.routineId === routineId && c.scheduledDate === date)
    return completion?.status || null
  }, [completions])

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
  const { isSignedIn, isLoaded } = useAuth()
  const today = getTodayString()
  const [completions, setCompletions] = useState<CompletionRecord[]>([])

  useEffect(() => {
    if (!isLoaded) return

    const fetchData = async () => {
      try {
        if (isSignedIn) {
          const data = await apiStorage.getCompletionsByDate(today)
          setCompletions(data)
        } else {
          setCompletions(localStorage.getCompletionsByDate(today))
        }
      } catch (error) {
        console.error('Failed to fetch today completions:', error)
        setCompletions([])
      }
    }
    fetchData()
  }, [today, isSignedIn, isLoaded])

  return completions
}

export function useWeekCompletions() {
  const { isSignedIn, isLoaded } = useAuth()
  const [completions, setCompletions] = useState<CompletionRecord[]>([])

  useEffect(() => {
    if (!isLoaded) return

    const fetchData = async () => {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const startStr = startOfWeek.toISOString().split('T')[0]
      const endStr = endOfWeek.toISOString().split('T')[0]

      try {
        if (isSignedIn) {
          const data = await apiStorage.getCompletionsInRange(startStr, endStr)
          setCompletions(data)
        } else {
          setCompletions(localStorage.getCompletionsInRange(startStr, endStr))
        }
      } catch (error) {
        console.error('Failed to fetch week completions:', error)
        setCompletions([])
      }
    }
    fetchData()
  }, [isSignedIn, isLoaded])

  return completions
}

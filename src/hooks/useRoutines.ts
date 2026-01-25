'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { Category, Goal, Routine, ContentBlock } from '@/types'
import * as localStorage from '@/lib/storage'
import * as apiStorage from '@/lib/api-storage'

export function useCategories() {
  const { isSignedIn, isLoaded } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    let mounted = true
    const fetchData = async () => {
      try {
        const data = isSignedIn
          ? await apiStorage.getCategories()
          : localStorage.getCategories()
        if (mounted) {
          setCategories(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        if (mounted) {
          setCategories([])
          setLoading(false)
        }
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [isSignedIn, isLoaded])

  const refresh = useCallback(async () => {
    try {
      const data = isSignedIn
        ? await apiStorage.getCategories()
        : localStorage.getCategories()
      setCategories(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to refresh categories:', error)
    }
  }, [isSignedIn])

  const createCategory = useCallback(
    async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
      const newCategory = isSignedIn
        ? await apiStorage.createCategory(category)
        : localStorage.createCategory(category)
      setCategories((prev) => [...prev, newCategory])
      return newCategory
    },
    [isSignedIn]
  )

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    const updated = isSignedIn
      ? await apiStorage.updateCategory(id, updates)
      : localStorage.updateCategory(id, updates)
    if (updated) {
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
    }
    return updated
  }, [isSignedIn])

  const deleteCategory = useCallback(async (id: string) => {
    const success = isSignedIn
      ? await apiStorage.deleteCategory(id)
      : localStorage.deleteCategory(id)
    if (success) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
    }
    return success
  }, [isSignedIn])

  const reorderCategories = useCallback((categoryIds: string[]) => {
    // Only local storage supports reorder for now
    if (!isSignedIn) {
      localStorage.reorderCategories(categoryIds)
      refresh()
    }
  }, [isSignedIn, refresh])

  return {
    categories,
    loading,
    refresh,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  }
}

export function useGoals(categoryId?: string) {
  const { isSignedIn, isLoaded } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    let mounted = true
    const fetchData = async () => {
      try {
        let data: Goal[]
        if (isSignedIn) {
          data = categoryId
            ? await apiStorage.getGoalsByCategory(categoryId)
            : await apiStorage.getGoals()
        } else {
          data = categoryId
            ? localStorage.getGoalsByCategory(categoryId)
            : localStorage.getGoals()
        }
        if (mounted) {
          setGoals(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch goals:', error)
        if (mounted) {
          setGoals([])
          setLoading(false)
        }
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [categoryId, isSignedIn, isLoaded])

  const refresh = useCallback(async () => {
    try {
      let data: Goal[]
      if (isSignedIn) {
        data = categoryId
          ? await apiStorage.getGoalsByCategory(categoryId)
          : await apiStorage.getGoals()
      } else {
        data = categoryId
          ? localStorage.getGoalsByCategory(categoryId)
          : localStorage.getGoals()
      }
      setGoals(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to refresh goals:', error)
    }
  }, [categoryId, isSignedIn])

  const createGoal = useCallback(
    async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
      const newGoal = isSignedIn
        ? await apiStorage.createGoal(goal)
        : localStorage.createGoal(goal)
      setGoals((prev) => [...prev, newGoal])
      return newGoal
    },
    [isSignedIn]
  )

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    const updated = isSignedIn
      ? await apiStorage.updateGoal(id, updates)
      : localStorage.updateGoal(id, updates)
    if (updated) {
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
    }
    return updated
  }, [isSignedIn])

  const deleteGoal = useCallback(async (id: string) => {
    const success = isSignedIn
      ? await apiStorage.deleteGoal(id)
      : localStorage.deleteGoal(id)
    if (success) {
      setGoals((prev) => prev.filter((g) => g.id !== id))
    }
    return success
  }, [isSignedIn])

  const reorderGoals = useCallback((goalIds: string[]) => {
    if (!isSignedIn) {
      localStorage.reorderGoals(goalIds)
      refresh()
    }
  }, [isSignedIn, refresh])

  return {
    goals,
    loading,
    refresh,
    createGoal,
    updateGoal,
    deleteGoal,
    reorderGoals,
  }
}

export function useRoutines(goalId?: string) {
  const { isSignedIn, isLoaded } = useAuth()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    let mounted = true
    const fetchData = async () => {
      try {
        let data: Routine[]
        if (isSignedIn) {
          data = goalId
            ? await apiStorage.getRoutinesByGoal(goalId)
            : await apiStorage.getRoutines()
        } else {
          data = goalId
            ? localStorage.getRoutinesByGoal(goalId)
            : localStorage.getRoutines()
        }
        if (mounted) {
          setRoutines(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch routines:', error)
        if (mounted) {
          setRoutines([])
          setLoading(false)
        }
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [goalId, isSignedIn, isLoaded])

  const refresh = useCallback(async () => {
    try {
      let data: Routine[]
      if (isSignedIn) {
        data = goalId
          ? await apiStorage.getRoutinesByGoal(goalId)
          : await apiStorage.getRoutines()
      } else {
        data = goalId
          ? localStorage.getRoutinesByGoal(goalId)
          : localStorage.getRoutines()
      }
      setRoutines(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to refresh routines:', error)
    }
  }, [goalId, isSignedIn])

  const createRoutine = useCallback(
    async (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newRoutine = isSignedIn
        ? await apiStorage.createRoutine(routine)
        : localStorage.createRoutine(routine)
      setRoutines((prev) => [...prev, newRoutine])
      return newRoutine
    },
    [isSignedIn]
  )

  const updateRoutine = useCallback(async (id: string, updates: Partial<Routine>) => {
    const updated = isSignedIn
      ? await apiStorage.updateRoutine(id, updates)
      : localStorage.updateRoutine(id, updates)
    if (updated) {
      setRoutines((prev) => prev.map((r) => (r.id === id ? updated : r)))
    }
    return updated
  }, [isSignedIn])

  const deleteRoutine = useCallback(async (id: string) => {
    const success = isSignedIn
      ? await apiStorage.deleteRoutine(id)
      : localStorage.deleteRoutine(id)
    if (success) {
      setRoutines((prev) => prev.filter((r) => r.id !== id))
    }
    return success
  }, [isSignedIn])

  return {
    routines,
    loading,
    refresh,
    createRoutine,
    updateRoutine,
    deleteRoutine,
  }
}

export function useRoutine(id: string) {
  const { isSignedIn, isLoaded } = useAuth()
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    let mounted = true
    const fetchData = async () => {
      try {
        const data = isSignedIn
          ? await apiStorage.getRoutineById(id)
          : localStorage.getRoutineById(id)
        if (mounted) {
          setRoutine(data || null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch routine:', error)
        if (mounted) {
          setRoutine(null)
          setLoading(false)
        }
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [id, isSignedIn, isLoaded])

  const updateRoutine = useCallback(
    async (updates: Partial<Routine>) => {
      const updated = isSignedIn
        ? await apiStorage.updateRoutine(id, updates)
        : localStorage.updateRoutine(id, updates)
      if (updated) {
        setRoutine(updated)
      }
      return updated
    },
    [id, isSignedIn]
  )

  const addBlock = useCallback(
    async (block: Omit<ContentBlock, 'id' | 'order'>) => {
      if (!routine) return null

      const newBlock: ContentBlock = {
        ...block,
        id: crypto.randomUUID(),
        order: routine.blocks.length,
      }

      const updated = isSignedIn
        ? await apiStorage.updateRoutine(id, {
            blocks: [...routine.blocks, newBlock],
          })
        : localStorage.updateRoutine(id, {
            blocks: [...routine.blocks, newBlock],
          })

      if (updated) {
        setRoutine(updated)
      }

      return newBlock
    },
    [id, routine, isSignedIn]
  )

  const updateBlock = useCallback(
    async (blockId: string, updates: Partial<ContentBlock>) => {
      if (!routine) return null

      const updatedBlocks = routine.blocks.map((b) =>
        b.id === blockId ? { ...b, ...updates } : b
      )

      const updated = isSignedIn
        ? await apiStorage.updateRoutine(id, { blocks: updatedBlocks })
        : localStorage.updateRoutine(id, { blocks: updatedBlocks })

      if (updated) {
        setRoutine(updated)
      }

      return updated
    },
    [id, routine, isSignedIn]
  )

  const removeBlock = useCallback(
    async (blockId: string) => {
      if (!routine) return false

      const updatedBlocks = routine.blocks
        .filter((b) => b.id !== blockId)
        .map((b, i) => ({ ...b, order: i }))

      const updated = isSignedIn
        ? await apiStorage.updateRoutine(id, { blocks: updatedBlocks })
        : localStorage.updateRoutine(id, { blocks: updatedBlocks })

      if (updated) {
        setRoutine(updated)
        return true
      }

      return false
    },
    [id, routine, isSignedIn]
  )

  const reorderBlocks = useCallback(
    async (blockIds: string[]) => {
      if (!routine) return

      const reorderedBlocks = blockIds
        .map((blockId, index) => {
          const block = routine.blocks.find((b) => b.id === blockId)
          return block ? { ...block, order: index } : null
        })
        .filter((b): b is ContentBlock => b !== null)

      const updated = isSignedIn
        ? await apiStorage.updateRoutine(id, { blocks: reorderedBlocks })
        : localStorage.updateRoutine(id, { blocks: reorderedBlocks })

      if (updated) {
        setRoutine(updated)
      }
    },
    [id, routine, isSignedIn]
  )

  return {
    routine,
    loading,
    updateRoutine,
    addBlock,
    updateBlock,
    removeBlock,
    reorderBlocks,
  }
}

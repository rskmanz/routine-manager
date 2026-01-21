'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Category, Goal, Routine, ContentBlock } from '@/types'
import * as storage from '@/lib/storage'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchData = () => {
      const data = storage.getCategories()
      if (mounted) {
        setCategories(data)
        setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const refresh = useCallback(() => {
    const data = storage.getCategories()
    setCategories(data)
    setLoading(false)
  }, [])

  const createCategory = useCallback(
    (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
      const newCategory = storage.createCategory(category)
      setCategories((prev) => [...prev, newCategory])
      return newCategory
    },
    []
  )

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    const updated = storage.updateCategory(id, updates)
    if (updated) {
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
    }
    return updated
  }, [])

  const deleteCategory = useCallback((id: string) => {
    const success = storage.deleteCategory(id)
    if (success) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
    }
    return success
  }, [])

  const reorderCategories = useCallback((categoryIds: string[]) => {
    storage.reorderCategories(categoryIds)
    refresh()
  }, [refresh])

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
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchData = () => {
      const data = categoryId
        ? storage.getGoalsByCategory(categoryId)
        : storage.getGoals()
      if (mounted) {
        setGoals(data)
        setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [categoryId])

  const refresh = useCallback(() => {
    const data = categoryId
      ? storage.getGoalsByCategory(categoryId)
      : storage.getGoals()
    setGoals(data)
    setLoading(false)
  }, [categoryId])

  const createGoal = useCallback(
    (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
      const newGoal = storage.createGoal(goal)
      setGoals((prev) => [...prev, newGoal])
      return newGoal
    },
    []
  )

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    const updated = storage.updateGoal(id, updates)
    if (updated) {
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
    }
    return updated
  }, [])

  const deleteGoal = useCallback((id: string) => {
    const success = storage.deleteGoal(id)
    if (success) {
      setGoals((prev) => prev.filter((g) => g.id !== id))
    }
    return success
  }, [])

  const reorderGoals = useCallback((goalIds: string[]) => {
    storage.reorderGoals(goalIds)
    refresh()
  }, [refresh])

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
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true;
    const fetchData = () => {
      const data = goalId
        ? storage.getRoutinesByGoal(goalId)
        : storage.getRoutines()
      if (mounted) {
        setRoutines(data)
        setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [goalId])

  const refresh = useCallback(() => {
    const data = goalId
      ? storage.getRoutinesByGoal(goalId)
      : storage.getRoutines()
    setRoutines(data)
    setLoading(false)
  }, [goalId])

  const createRoutine = useCallback(
    (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newRoutine = storage.createRoutine(routine)
      setRoutines((prev) => [...prev, newRoutine])
      return newRoutine
    },
    []
  )

  const updateRoutine = useCallback((id: string, updates: Partial<Routine>) => {
    const updated = storage.updateRoutine(id, updates)
    if (updated) {
      setRoutines((prev) => prev.map((r) => (r.id === id ? updated : r)))
    }
    return updated
  }, [])

  const deleteRoutine = useCallback((id: string) => {
    const success = storage.deleteRoutine(id)
    if (success) {
      setRoutines((prev) => prev.filter((r) => r.id !== id))
    }
    return success
  }, [])

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
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const data = storage.getRoutineById(id)
    if (mounted) {
      setRoutine(data || null)
      setLoading(false)
    }
    return () => { mounted = false }
  }, [id])

  const updateRoutine = useCallback(
    (updates: Partial<Routine>) => {
      const updated = storage.updateRoutine(id, updates)
      if (updated) {
        setRoutine(updated)
      }
      return updated
    },
    [id]
  )

  const addBlock = useCallback(
    (block: Omit<ContentBlock, 'id' | 'order'>) => {
      if (!routine) return null

      const newBlock: ContentBlock = {
        ...block,
        id: crypto.randomUUID(),
        order: routine.blocks.length,
      }

      const updated = storage.updateRoutine(id, {
        blocks: [...routine.blocks, newBlock],
      })

      if (updated) {
        setRoutine(updated)
      }

      return newBlock
    },
    [id, routine]
  )

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<ContentBlock>) => {
      if (!routine) return null

      const updatedBlocks = routine.blocks.map((b) =>
        b.id === blockId ? { ...b, ...updates } : b
      )

      const updated = storage.updateRoutine(id, { blocks: updatedBlocks })

      if (updated) {
        setRoutine(updated)
      }

      return updated
    },
    [id, routine]
  )

  const removeBlock = useCallback(
    (blockId: string) => {
      if (!routine) return false

      const updatedBlocks = routine.blocks
        .filter((b) => b.id !== blockId)
        .map((b, i) => ({ ...b, order: i }))

      const updated = storage.updateRoutine(id, { blocks: updatedBlocks })

      if (updated) {
        setRoutine(updated)
        return true
      }

      return false
    },
    [id, routine]
  )

  const reorderBlocks = useCallback(
    (blockIds: string[]) => {
      if (!routine) return

      const reorderedBlocks = blockIds
        .map((blockId, index) => {
          const block = routine.blocks.find((b) => b.id === blockId)
          return block ? { ...block, order: index } : null
        })
        .filter((b): b is ContentBlock => b !== null)

      const updated = storage.updateRoutine(id, { blocks: reorderedBlocks })

      if (updated) {
        setRoutine(updated)
      }
    },
    [id, routine]
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

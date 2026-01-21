import type { Category, Goal, Routine, StorageData, CompletionRecord, StreakInfo } from '@/types'
import { generateId } from '@/lib/utils'

const STORAGE_KEY = 'routine-manager-data'
const STORAGE_VERSION = '3.0.0'  // Bumped for completion tracking

// Default data with sample categories and goals
function getDefaultData(): StorageData {
  const now = new Date().toISOString()

  const workCategoryId = generateId()
  const personalCategoryId = generateId()
  const healthCategoryId = generateId()

  return {
    version: STORAGE_VERSION,
    categories: [
      {
        id: workCategoryId,
        title: 'Work & Professional',
        icon: 'Briefcase',
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: personalCategoryId,
        title: 'Personal & Lifestyle',
        icon: 'User',
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: healthCategoryId,
        title: 'Health & Fitness',
        icon: 'Heart',
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
    ],
    goals: [
      {
        id: generateId(),
        title: '英語をマスターする',
        description: 'Achieve fluency in English through daily practice',
        icon: '🎯',
        color: 'from-indigo-500/20 to-indigo-600/20 border-indigo-200/50',
        categoryId: personalCategoryId,
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        title: '健康を維持する',
        description: 'Maintain physical and mental health',
        icon: '💪',
        color: 'from-emerald-500/20 to-teal-500/20 border-emerald-200/50',
        categoryId: healthCategoryId,
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
    ],
    routines: [],
    completions: [],
  }
}

// Load data from localStorage
export function loadStorage(): StorageData {
  if (typeof window === 'undefined') {
    return getDefaultData()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return getDefaultData()
    }

    const data = JSON.parse(stored) as StorageData

    // Version migration if needed
    if (data.version !== STORAGE_VERSION) {
      // Migrate from v1 (no categories) to v2 (with categories)
      if (!data.categories) {
        const now = new Date().toISOString()
        const defaultCategoryId = generateId()
        data.categories = [
          {
            id: defaultCategoryId,
            title: 'General',
            icon: 'Folder',
            order: 0,
            createdAt: now,
            updatedAt: now,
          },
        ]
        // Assign all existing goals to the default category
        data.goals = data.goals.map((goal) => ({
          ...goal,
          categoryId: goal.categoryId || defaultCategoryId,
        }))
      }

      // Migrate from v2 to v3 (add completions array)
      if (!data.completions) {
        data.completions = []
      }

      data.version = STORAGE_VERSION
      saveStorage(data)
    }

    return data
  } catch {
    return getDefaultData()
  }
}

// Save data to localStorage
export function saveStorage(data: StorageData): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save storage:', error)
  }
}

// Category operations
export function getCategories(): Category[] {
  const data = loadStorage()
  return data.categories.sort((a, b) => a.order - b.order)
}

export function getCategoryById(id: string): Category | undefined {
  const data = loadStorage()
  return data.categories.find((c) => c.id === id)
}

export function createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Category {
  const data = loadStorage()
  const now = new Date().toISOString()

  const newCategory: Category = {
    ...category,
    id: generateId(),
    order: data.categories.length,
    createdAt: now,
    updatedAt: now,
  }

  data.categories.push(newCategory)
  saveStorage(data)

  return newCategory
}

export function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Category | null {
  const data = loadStorage()
  const index = data.categories.findIndex((c) => c.id === id)

  if (index === -1) return null

  const updatedCategory: Category = {
    ...data.categories[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  data.categories[index] = updatedCategory
  saveStorage(data)

  return updatedCategory
}

export function deleteCategory(id: string): boolean {
  const data = loadStorage()
  const index = data.categories.findIndex((c) => c.id === id)

  if (index === -1) return false

  // Remove category
  data.categories.splice(index, 1)

  // Remove associated goals and their routines
  const goalIds = data.goals.filter((g) => g.categoryId === id).map((g) => g.id)
  data.goals = data.goals.filter((g) => g.categoryId !== id)
  data.routines = data.routines.filter((r) => !goalIds.includes(r.goalId))

  // Reorder remaining categories
  data.categories.forEach((c, i) => {
    c.order = i
  })

  saveStorage(data)
  return true
}

export function reorderCategories(categoryIds: string[]): void {
  const data = loadStorage()

  categoryIds.forEach((id, index) => {
    const category = data.categories.find((c) => c.id === id)
    if (category) {
      category.order = index
    }
  })

  saveStorage(data)
}

// Goal operations
export function getGoals(): Goal[] {
  const data = loadStorage()
  return data.goals.sort((a, b) => a.order - b.order)
}

export function getGoalsByCategory(categoryId: string): Goal[] {
  const data = loadStorage()
  return data.goals.filter((g) => g.categoryId === categoryId).sort((a, b) => a.order - b.order)
}

export function getGoalById(id: string): Goal | undefined {
  const data = loadStorage()
  return data.goals.find((g) => g.id === id)
}

export function createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Goal {
  const data = loadStorage()
  const now = new Date().toISOString()

  const newGoal: Goal = {
    ...goal,
    id: generateId(),
    order: data.goals.length,
    createdAt: now,
    updatedAt: now,
  }

  data.goals.push(newGoal)
  saveStorage(data)

  return newGoal
}

export function updateGoal(id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>): Goal | null {
  const data = loadStorage()
  const index = data.goals.findIndex((g) => g.id === id)

  if (index === -1) return null

  const updatedGoal: Goal = {
    ...data.goals[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  data.goals[index] = updatedGoal
  saveStorage(data)

  return updatedGoal
}

export function deleteGoal(id: string): boolean {
  const data = loadStorage()
  const index = data.goals.findIndex((g) => g.id === id)

  if (index === -1) return false

  // Remove goal
  data.goals.splice(index, 1)

  // Remove associated routines
  data.routines = data.routines.filter((r) => r.goalId !== id)

  // Reorder remaining goals
  data.goals.forEach((g, i) => {
    g.order = i
  })

  saveStorage(data)
  return true
}

export function reorderGoals(goalIds: string[]): void {
  const data = loadStorage()

  goalIds.forEach((id, index) => {
    const goal = data.goals.find((g) => g.id === id)
    if (goal) {
      goal.order = index
    }
  })

  saveStorage(data)
}

// Routine operations
export function getRoutines(): Routine[] {
  const data = loadStorage()
  return data.routines
}

export function getRoutinesByGoal(goalId: string): Routine[] {
  const data = loadStorage()
  return data.routines.filter((r) => r.goalId === goalId)
}

export function getRoutineById(id: string): Routine | undefined {
  const data = loadStorage()
  return data.routines.find((r) => r.id === id)
}

export function createRoutine(
  routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>
): Routine {
  const data = loadStorage()
  const now = new Date().toISOString()

  const newRoutine: Routine = {
    ...routine,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }

  data.routines.push(newRoutine)
  saveStorage(data)

  return newRoutine
}

export function updateRoutine(
  id: string,
  updates: Partial<Omit<Routine, 'id' | 'createdAt'>>
): Routine | null {
  const data = loadStorage()
  const index = data.routines.findIndex((r) => r.id === id)

  if (index === -1) return null

  const updatedRoutine: Routine = {
    ...data.routines[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  data.routines[index] = updatedRoutine
  saveStorage(data)

  return updatedRoutine
}

export function deleteRoutine(id: string): boolean {
  const data = loadStorage()
  const index = data.routines.findIndex((r) => r.id === id)

  if (index === -1) return false

  data.routines.splice(index, 1)
  // Also delete associated completion records
  data.completions = data.completions.filter((c) => c.routineId !== id)
  saveStorage(data)

  return true
}

// Completion operations
export function getCompletions(): CompletionRecord[] {
  const data = loadStorage()
  return data.completions
}

export function getCompletionsByRoutine(routineId: string): CompletionRecord[] {
  const data = loadStorage()
  return data.completions.filter((c) => c.routineId === routineId)
}

export function getCompletionsByDate(date: string): CompletionRecord[] {
  const data = loadStorage()
  return data.completions.filter((c) => c.scheduledDate === date)
}

export function getCompletionsInRange(startDate: string, endDate: string): CompletionRecord[] {
  const data = loadStorage()
  return data.completions.filter((c) => c.scheduledDate >= startDate && c.scheduledDate <= endDate)
}

export function getCompletionByRoutineAndDate(routineId: string, date: string): CompletionRecord | undefined {
  const data = loadStorage()
  return data.completions.find((c) => c.routineId === routineId && c.scheduledDate === date)
}

export function createCompletion(completion: Omit<CompletionRecord, 'id'>): CompletionRecord {
  const data = loadStorage()

  const newCompletion: CompletionRecord = {
    ...completion,
    id: generateId(),
  }

  data.completions.push(newCompletion)
  saveStorage(data)

  return newCompletion
}

export function updateCompletion(id: string, updates: Partial<Omit<CompletionRecord, 'id'>>): CompletionRecord | null {
  const data = loadStorage()
  const index = data.completions.findIndex((c) => c.id === id)

  if (index === -1) return null

  const updatedCompletion: CompletionRecord = {
    ...data.completions[index],
    ...updates,
  }

  data.completions[index] = updatedCompletion
  saveStorage(data)

  return updatedCompletion
}

export function deleteCompletion(id: string): boolean {
  const data = loadStorage()
  const index = data.completions.findIndex((c) => c.id === id)

  if (index === -1) return false

  data.completions.splice(index, 1)
  saveStorage(data)

  return true
}

export function deleteCompletionsByRoutine(routineId: string): void {
  const data = loadStorage()
  data.completions = data.completions.filter((c) => c.routineId !== routineId)
  saveStorage(data)
}

// Calculate streak information for a routine
export function calculateStreak(routineId: string): StreakInfo {
  const completions = getCompletionsByRoutine(routineId)
    .filter((c) => c.status === 'completed')
    .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))

  if (completions.length === 0) {
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

  // Check if the most recent completion is today or yesterday (for current streak)
  const lastDate = completions[0].scheduledDate
  const daysDiff = Math.floor((new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff <= 1) {
    currentStreak = 1
    for (let i = 1; i < completions.length; i++) {
      const prevDate = new Date(completions[i - 1].scheduledDate)
      const currDate = new Date(completions[i].scheduledDate)
      const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diff === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < completions.length; i++) {
    const prevDate = new Date(completions[i - 1].scheduledDate)
    const currDate = new Date(completions[i].scheduledDate)
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
    lastCompletedDate: completions[0]?.scheduledDate,
    totalCompletions: completions.length,
  }
}

// Export/Import for backup
export function exportData(): string {
  const data = loadStorage()
  return JSON.stringify(data, null, 2)
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as StorageData

    // Validate structure
    if (!data.goals || !data.routines) {
      return false
    }

    data.version = STORAGE_VERSION
    saveStorage(data)
    return true
  } catch {
    return false
  }
}

// Re-export Supabase functions for when Supabase is configured
export * from './supabase'
export { isSupabaseConfigured, useSupabase } from '@/lib/supabase'

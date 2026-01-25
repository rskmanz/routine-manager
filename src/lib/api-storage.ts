import type { Category, Goal, Routine, CompletionRecord, StreakInfo } from '@/types'

const API_BASE = '/api/data'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  return res.json()
}

async function postJson<T>(data: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  return res.json()
}

async function patchJson<T>(data: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_BASE, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  return res.json()
}

async function deleteJson(type: string, id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}?type=${type}&id=${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    return false
  }
  const data = await res.json()
  return data.success
}

// Category operations
export async function getCategories(): Promise<Category[]> {
  return fetchJson<Category[]>(`${API_BASE}?type=categories`)
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const categories = await getCategories()
  return categories.find(c => c.id === id)
}

export async function createCategory(
  category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'order'>
): Promise<Category> {
  return postJson<Category>({ type: 'category', data: category })
}

export async function updateCategory(
  id: string,
  updates: Partial<Omit<Category, 'id' | 'createdAt'>>
): Promise<Category | null> {
  return patchJson<Category | null>({ type: 'category', id, data: updates })
}

export async function deleteCategory(id: string): Promise<boolean> {
  return deleteJson('category', id)
}

// Goal operations
export async function getGoals(): Promise<Goal[]> {
  return fetchJson<Goal[]>(`${API_BASE}?type=goals`)
}

export async function getGoalsByCategory(categoryId: string): Promise<Goal[]> {
  return fetchJson<Goal[]>(`${API_BASE}?type=goals&categoryId=${categoryId}`)
}

export async function getGoalById(id: string): Promise<Goal | undefined> {
  const goals = await getGoals()
  return goals.find(g => g.id === id)
}

export async function createGoal(
  goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'order'>
): Promise<Goal> {
  return postJson<Goal>({ type: 'goal', data: goal })
}

export async function updateGoal(
  id: string,
  updates: Partial<Omit<Goal, 'id' | 'createdAt'>>
): Promise<Goal | null> {
  return patchJson<Goal | null>({ type: 'goal', id, data: updates })
}

export async function deleteGoal(id: string): Promise<boolean> {
  return deleteJson('goal', id)
}

// Routine operations
export async function getRoutines(): Promise<Routine[]> {
  return fetchJson<Routine[]>(`${API_BASE}?type=routines`)
}

export async function getRoutinesByGoal(goalId: string): Promise<Routine[]> {
  return fetchJson<Routine[]>(`${API_BASE}?type=routines&goalId=${goalId}`)
}

export async function getRoutineById(id: string): Promise<Routine | undefined> {
  return fetchJson<Routine | null>(`${API_BASE}?type=routine&id=${id}`) as Promise<Routine | undefined>
}

export async function createRoutine(
  routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Routine> {
  return postJson<Routine>({ type: 'routine', data: routine })
}

export async function updateRoutine(
  id: string,
  updates: Partial<Omit<Routine, 'id' | 'createdAt'>>
): Promise<Routine | null> {
  return patchJson<Routine | null>({ type: 'routine', id, data: updates })
}

export async function deleteRoutine(id: string): Promise<boolean> {
  return deleteJson('routine', id)
}

// Completion operations
export async function getCompletions(): Promise<CompletionRecord[]> {
  return fetchJson<CompletionRecord[]>(`${API_BASE}?type=completions`)
}

export async function getCompletionsByRoutine(routineId: string): Promise<CompletionRecord[]> {
  const completions = await getCompletions()
  return completions.filter(c => c.routineId === routineId)
}

export async function getCompletionsByDate(date: string): Promise<CompletionRecord[]> {
  const completions = await getCompletions()
  return completions.filter(c => c.scheduledDate === date)
}

export async function getCompletionsInRange(startDate: string, endDate: string): Promise<CompletionRecord[]> {
  return fetchJson<CompletionRecord[]>(`${API_BASE}?type=completionsInRange&startDate=${startDate}&endDate=${endDate}`)
}

export async function getCompletionByRoutineAndDate(routineId: string, date: string): Promise<CompletionRecord | undefined> {
  const completions = await getCompletions()
  return completions.find(c => c.routineId === routineId && c.scheduledDate === date)
}

export async function createCompletion(
  completion: Omit<CompletionRecord, 'id'>
): Promise<CompletionRecord> {
  return postJson<CompletionRecord>({ type: 'completion', data: completion })
}

export async function updateCompletion(
  id: string,
  updates: Partial<Omit<CompletionRecord, 'id'>>
): Promise<CompletionRecord | null> {
  return patchJson<CompletionRecord | null>({ type: 'completion', id, data: updates })
}

export async function deleteCompletion(id: string): Promise<boolean> {
  return deleteJson('completion', id)
}

// Calculate streak locally (or could be a server endpoint)
export async function calculateStreak(routineId: string): Promise<StreakInfo> {
  const completions = (await getCompletionsByRoutine(routineId))
    .filter(c => c.status === 'completed')
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

  const lastDate = completions[0].scheduledDate
  const daysDiff = Math.floor(
    (new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
  )

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

// Get all data at once
export async function getAllData() {
  return fetchJson<{
    categories: Category[]
    goals: Goal[]
    routines: Routine[]
    completions: CompletionRecord[]
  }>(`${API_BASE}?type=all`)
}

// Migrate existing data to current user
export async function migrateToCurrentUser(): Promise<{ migrated: number }> {
  return postJson<{ migrated: number }>({ type: 'migrate' })
}

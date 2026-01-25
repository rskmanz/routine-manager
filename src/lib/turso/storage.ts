import { turso } from './client'
import { initializeSchema } from './schema'
import { generateId } from '@/lib/utils'
import type { Category, Goal, Routine, CompletionRecord, StreakInfo } from '@/types'

async function ensureInitialized(): Promise<void> {
  await initializeSchema()
}

// Type converters (snake_case → camelCase)
function toCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    title: row.title as string,
    icon: (row.icon as string) || 'Folder',
    colorPattern: (row.color_pattern as Category['colorPattern']) || 'rainbow',
    order: row.order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function toGoal(row: Record<string, unknown>): Goal {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || '',
    icon: (row.icon as string) || '🎯',
    color: (row.color as string) || '',
    categoryId: row.category_id as string,
    order: row.order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function toRoutine(row: Record<string, unknown>): Routine {
  return {
    id: row.id as string,
    title: row.title as string,
    goalId: row.goal_id as string,
    blocks: JSON.parse((row.blocks as string) || '[]'),
    sources: JSON.parse((row.sources as string) || '[]'),
    tasks: JSON.parse((row.tasks as string) || '[]'),
    status: (row.status as Routine['status']) || 'active',
    integration: JSON.parse((row.integration as string) || '{"enabled":false}'),
    schedule: row.schedule ? JSON.parse(row.schedule as string) : undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function toCompletion(row: Record<string, unknown>): CompletionRecord {
  return {
    id: row.id as string,
    routineId: row.routine_id as string,
    scheduledDate: row.scheduled_date as string,
    completedAt: row.completed_at as string | undefined,
    status: row.status as CompletionRecord['status'],
    notes: row.notes as string | undefined,
  }
}

// Category operations
export async function getCategories(userId: string): Promise<Category[]> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM categories WHERE user_id = ? ORDER BY "order"',
    args: [userId],
  })
  return result.rows.map(row => toCategory(row as Record<string, unknown>))
}

export async function getCategoryById(id: string, userId: string): Promise<Category | undefined> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM categories WHERE id = ? AND user_id = ?',
    args: [id, userId],
  })
  return result.rows[0] ? toCategory(result.rows[0] as Record<string, unknown>) : undefined
}

export async function createCategory(
  category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'order'>,
  userId: string
): Promise<Category> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const now = new Date().toISOString()
  const id = generateId()

  const orderResult = await turso.execute({
    sql: 'SELECT MAX("order") as max_order FROM categories WHERE user_id = ?',
    args: [userId],
  })
  const maxOrder = (orderResult.rows[0]?.max_order as number) ?? -1

  await turso.execute({
    sql: `INSERT INTO categories (id, user_id, title, icon, color_pattern, "order", created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, userId, category.title, category.icon, category.colorPattern ?? 'rainbow', maxOrder + 1, now, now],
  })

  return {
    ...category,
    id,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  }
}

export async function updateCategory(
  id: string,
  updates: Partial<Omit<Category, 'id' | 'createdAt'>>,
  userId: string
): Promise<Category | null> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const existing = await getCategoryById(id, userId)
  if (!existing) return null

  const now = new Date().toISOString()
  const updated: Category = {
    ...existing,
    ...updates,
    updatedAt: now,
  }

  await turso.execute({
    sql: `UPDATE categories SET title = ?, icon = ?, color_pattern = ?, "order" = ?, updated_at = ?
          WHERE id = ? AND user_id = ?`,
    args: [updated.title, updated.icon, updated.colorPattern ?? 'rainbow', updated.order, now, id, userId],
  })

  return updated
}

export async function deleteCategory(id: string, userId: string): Promise<boolean> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'DELETE FROM categories WHERE id = ? AND user_id = ?',
    args: [id, userId],
  })
  return result.rowsAffected > 0
}

// Goal operations
export async function getGoals(userId: string): Promise<Goal[]> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM goals WHERE user_id = ? ORDER BY "order"',
    args: [userId],
  })
  return result.rows.map(row => toGoal(row as Record<string, unknown>))
}

export async function getGoalsByCategory(categoryId: string, userId: string): Promise<Goal[]> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM goals WHERE category_id = ? AND user_id = ? ORDER BY "order"',
    args: [categoryId, userId],
  })
  return result.rows.map(row => toGoal(row as Record<string, unknown>))
}

export async function getGoalById(id: string, userId: string): Promise<Goal | undefined> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM goals WHERE id = ? AND user_id = ?',
    args: [id, userId],
  })
  return result.rows[0] ? toGoal(result.rows[0] as Record<string, unknown>) : undefined
}

export async function createGoal(
  goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'order'>,
  userId: string
): Promise<Goal> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const now = new Date().toISOString()
  const id = generateId()

  const orderResult = await turso.execute({
    sql: 'SELECT MAX("order") as max_order FROM goals WHERE user_id = ?',
    args: [userId],
  })
  const maxOrder = (orderResult.rows[0]?.max_order as number) ?? -1

  await turso.execute({
    sql: `INSERT INTO goals (id, user_id, title, description, icon, color, category_id, "order", created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, userId, goal.title, goal.description ?? '', goal.icon ?? '🎯', goal.color, goal.categoryId, maxOrder + 1, now, now],
  })

  return {
    ...goal,
    id,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  }
}

export async function updateGoal(
  id: string,
  updates: Partial<Omit<Goal, 'id' | 'createdAt'>>,
  userId: string
): Promise<Goal | null> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const existing = await getGoalById(id, userId)
  if (!existing) return null

  const now = new Date().toISOString()
  const updated: Goal = {
    ...existing,
    ...updates,
    updatedAt: now,
  }

  await turso.execute({
    sql: `UPDATE goals SET title = ?, description = ?, icon = ?, color = ?, category_id = ?, "order" = ?, updated_at = ?
          WHERE id = ? AND user_id = ?`,
    args: [updated.title, updated.description ?? '', updated.icon ?? '🎯', updated.color, updated.categoryId, updated.order, now, id, userId],
  })

  return updated
}

export async function deleteGoal(id: string, userId: string): Promise<boolean> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'DELETE FROM goals WHERE id = ? AND user_id = ?',
    args: [id, userId],
  })
  return result.rowsAffected > 0
}

// Routine operations
export async function getRoutines(userId: string): Promise<Routine[]> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM routines WHERE user_id = ?',
    args: [userId],
  })
  return result.rows.map(row => toRoutine(row as Record<string, unknown>))
}

export async function getRoutinesByGoal(goalId: string, userId: string): Promise<Routine[]> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM routines WHERE goal_id = ? AND user_id = ?',
    args: [goalId, userId],
  })
  return result.rows.map(row => toRoutine(row as Record<string, unknown>))
}

export async function getRoutineById(id: string, userId: string): Promise<Routine | undefined> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM routines WHERE id = ? AND user_id = ?',
    args: [id, userId],
  })
  return result.rows[0] ? toRoutine(result.rows[0] as Record<string, unknown>) : undefined
}

export async function createRoutine(
  routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<Routine> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const now = new Date().toISOString()
  const id = generateId()

  await turso.execute({
    sql: `INSERT INTO routines (id, user_id, title, goal_id, blocks, sources, tasks, status, integration, schedule, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      userId,
      routine.title,
      routine.goalId,
      JSON.stringify(routine.blocks || []),
      JSON.stringify(routine.sources || []),
      JSON.stringify(routine.tasks || []),
      routine.status || 'active',
      JSON.stringify(routine.integration || { enabled: false }),
      routine.schedule ? JSON.stringify(routine.schedule) : null,
      now,
      now,
    ],
  })

  return {
    ...routine,
    id,
    createdAt: now,
    updatedAt: now,
  }
}

export async function updateRoutine(
  id: string,
  updates: Partial<Omit<Routine, 'id' | 'createdAt'>>,
  userId: string
): Promise<Routine | null> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const existing = await getRoutineById(id, userId)
  if (!existing) return null

  const now = new Date().toISOString()
  const updated: Routine = {
    ...existing,
    ...updates,
    updatedAt: now,
  }

  await turso.execute({
    sql: `UPDATE routines SET title = ?, goal_id = ?, blocks = ?, sources = ?, tasks = ?, status = ?, integration = ?, schedule = ?, updated_at = ?
          WHERE id = ? AND user_id = ?`,
    args: [
      updated.title,
      updated.goalId,
      JSON.stringify(updated.blocks || []),
      JSON.stringify(updated.sources || []),
      JSON.stringify(updated.tasks || []),
      updated.status,
      JSON.stringify(updated.integration),
      updated.schedule ? JSON.stringify(updated.schedule) : null,
      now,
      id,
      userId,
    ],
  })

  return updated
}

export async function deleteRoutine(id: string, userId: string): Promise<boolean> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'DELETE FROM routines WHERE id = ? AND user_id = ?',
    args: [id, userId],
  })
  return result.rowsAffected > 0
}

// Completion operations
export async function getCompletions(userId: string): Promise<CompletionRecord[]> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM completions WHERE user_id = ?',
    args: [userId],
  })
  return result.rows.map(row => toCompletion(row as Record<string, unknown>))
}

export async function getCompletionsByRoutine(routineId: string, userId: string): Promise<CompletionRecord[]> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM completions WHERE routine_id = ? AND user_id = ?',
    args: [routineId, userId],
  })
  return result.rows.map(row => toCompletion(row as Record<string, unknown>))
}

export async function getCompletionsByDate(date: string, userId: string): Promise<CompletionRecord[]> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM completions WHERE scheduled_date = ? AND user_id = ?',
    args: [date, userId],
  })
  return result.rows.map(row => toCompletion(row as Record<string, unknown>))
}

export async function getCompletionsInRange(startDate: string, endDate: string, userId: string): Promise<CompletionRecord[]> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM completions WHERE scheduled_date >= ? AND scheduled_date <= ? AND user_id = ?',
    args: [startDate, endDate, userId],
  })
  return result.rows.map(row => toCompletion(row as Record<string, unknown>))
}

export async function getCompletionByRoutineAndDate(
  routineId: string,
  date: string,
  userId: string
): Promise<CompletionRecord | undefined> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM completions WHERE routine_id = ? AND scheduled_date = ? AND user_id = ?',
    args: [routineId, date, userId],
  })
  return result.rows[0] ? toCompletion(result.rows[0] as Record<string, unknown>) : undefined
}

export async function createCompletion(
  completion: Omit<CompletionRecord, 'id'>,
  userId: string
): Promise<CompletionRecord> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const id = generateId()
  const now = new Date().toISOString()

  await turso.execute({
    sql: `INSERT INTO completions (id, user_id, routine_id, scheduled_date, completed_at, status, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, userId, completion.routineId, completion.scheduledDate, completion.completedAt ?? null, completion.status, completion.notes ?? null, now],
  })

  return {
    ...completion,
    id,
  }
}

export async function updateCompletion(
  id: string,
  updates: Partial<Omit<CompletionRecord, 'id'>>,
  userId: string
): Promise<CompletionRecord | null> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'SELECT * FROM completions WHERE id = ? AND user_id = ?',
    args: [id, userId],
  })

  if (!result.rows[0]) return null
  const existing = toCompletion(result.rows[0] as Record<string, unknown>)

  const updated: CompletionRecord = {
    ...existing,
    ...updates,
  }

  await turso.execute({
    sql: 'UPDATE completions SET completed_at = ?, status = ?, notes = ? WHERE id = ? AND user_id = ?',
    args: [updated.completedAt ?? null, updated.status, updated.notes ?? null, id, userId],
  })

  return updated
}

export async function deleteCompletion(id: string, userId: string): Promise<boolean> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  const result = await turso.execute({
    sql: 'DELETE FROM completions WHERE id = ? AND user_id = ?',
    args: [id, userId],
  })
  return result.rowsAffected > 0
}

export async function deleteCompletionsByRoutine(routineId: string, userId: string): Promise<void> {
  await ensureInitialized()
  if (!turso) throw new Error('Turso not configured')

  await turso.execute({
    sql: 'DELETE FROM completions WHERE routine_id = ? AND user_id = ?',
    args: [routineId, userId],
  })
}

// Streak calculation
export async function calculateStreak(routineId: string, userId: string): Promise<StreakInfo> {
  const completions = (await getCompletionsByRoutine(routineId, userId))
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

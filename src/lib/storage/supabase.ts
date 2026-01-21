// Supabase Storage Implementation
// Mirrors the localStorage API but uses Supabase

import { supabase } from '@/lib/supabase/client'
import type { Category, Goal, Routine } from '@/types'
import type { CategoryRow, GoalRow, RoutineRow } from '@/lib/supabase/types'

// Type converters (snake_case → camelCase)
function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    title: row.title,
    icon: row.icon || 'Folder',
    colorPattern: (row.color_pattern as Category['colorPattern']) || 'rainbow',
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    icon: row.icon || '🎯',
    color: row.color || '',
    categoryId: row.category_id,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toRoutine(row: RoutineRow): Routine {
  return {
    id: row.id,
    title: row.title,
    goalId: row.goal_id,
    blocks: (row.blocks as Routine['blocks']) || [],
    sources: (row.sources as Routine['sources']) || [],
    status: (row.status as Routine['status']) || 'active',
    integration: (row.integration as Routine['integration']) || { enabled: false },
    schedule: row.schedule as Routine['schedule'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Category operations
export async function getCategoriesFromSupabase(): Promise<Category[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order')

  if (error) throw error
  return (data || []).map(toCategory)
}

export async function getCategoryByIdFromSupabase(id: string): Promise<Category | undefined> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return undefined
  return data ? toCategory(data) : undefined
}

export async function createCategoryInSupabase(
  category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'order'>
): Promise<Category> {
  if (!supabase) throw new Error('Supabase not configured')

  // Get current max order
  const { data: categories } = await supabase
    .from('categories')
    .select('order')
    .order('order', { ascending: false })
    .limit(1)

  const maxOrder = categories?.[0]?.order ?? -1

  const { data, error } = await supabase
    .from('categories')
    .insert({
      title: category.title,
      icon: category.icon,
      color_pattern: category.colorPattern,
      order: maxOrder + 1,
    })
    .select()
    .single()

  if (error) throw error
  return toCategory(data)
}

export async function updateCategoryInSupabase(
  id: string,
  updates: Partial<Omit<Category, 'id' | 'createdAt'>>
): Promise<Category | null> {
  if (!supabase) throw new Error('Supabase not configured')

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.icon !== undefined) updateData.icon = updates.icon
  if (updates.colorPattern !== undefined) updateData.color_pattern = updates.colorPattern
  if (updates.order !== undefined) updateData.order = updates.order

  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return null
  return toCategory(data)
}

export async function deleteCategoryFromSupabase(id: string): Promise<boolean> {
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase.from('categories').delete().eq('id', id)
  return !error
}

// Goal operations
export async function getGoalsFromSupabase(): Promise<Goal[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('order')

  if (error) throw error
  return (data || []).map(toGoal)
}

export async function getGoalsByIdFromSupabase(id: string): Promise<Goal | undefined> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return undefined
  return data ? toGoal(data) : undefined
}

export async function createGoalInSupabase(
  goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'order'>
): Promise<Goal> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data: goals } = await supabase
    .from('goals')
    .select('order')
    .order('order', { ascending: false })
    .limit(1)

  const maxOrder = goals?.[0]?.order ?? -1

  const { data, error } = await supabase
    .from('goals')
    .insert({
      title: goal.title,
      description: goal.description,
      icon: goal.icon,
      color: goal.color,
      category_id: goal.categoryId,
      order: maxOrder + 1,
    })
    .select()
    .single()

  if (error) throw error
  return toGoal(data)
}

export async function updateGoalInSupabase(
  id: string,
  updates: Partial<Omit<Goal, 'id' | 'createdAt'>>
): Promise<Goal | null> {
  if (!supabase) throw new Error('Supabase not configured')

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.icon !== undefined) updateData.icon = updates.icon
  if (updates.color !== undefined) updateData.color = updates.color
  if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
  if (updates.order !== undefined) updateData.order = updates.order

  const { data, error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return null
  return toGoal(data)
}

export async function deleteGoalFromSupabase(id: string): Promise<boolean> {
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase.from('goals').delete().eq('id', id)
  return !error
}

// Routine operations
export async function getRoutinesFromSupabase(): Promise<Routine[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase.from('routines').select('*')

  if (error) throw error
  return (data || []).map(toRoutine)
}

export async function getRoutineByIdFromSupabase(id: string): Promise<Routine | undefined> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return undefined
  return data ? toRoutine(data) : undefined
}

export async function createRoutineInSupabase(
  routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Routine> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('routines')
    .insert({
      title: routine.title,
      goal_id: routine.goalId,
      blocks: routine.blocks,
      sources: routine.sources,
      status: routine.status,
      integration: routine.integration,
      schedule: routine.schedule,
    })
    .select()
    .single()

  if (error) throw error
  return toRoutine(data)
}

export async function updateRoutineInSupabase(
  id: string,
  updates: Partial<Omit<Routine, 'id' | 'createdAt'>>
): Promise<Routine | null> {
  if (!supabase) throw new Error('Supabase not configured')

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.goalId !== undefined) updateData.goal_id = updates.goalId
  if (updates.blocks !== undefined) updateData.blocks = updates.blocks
  if (updates.sources !== undefined) updateData.sources = updates.sources
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.integration !== undefined) updateData.integration = updates.integration
  if (updates.schedule !== undefined) updateData.schedule = updates.schedule

  const { data, error } = await supabase
    .from('routines')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return null
  return toRoutine(data)
}

export async function deleteRoutineFromSupabase(id: string): Promise<boolean> {
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase.from('routines').delete().eq('id', id)
  return !error
}

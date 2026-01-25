import type { Category, Goal, Routine } from '@/types'

export type LayoutType = 'scroll' | 'grid' | 'table'

export interface LayoutProps {
  categories: Category[]
  goals: Goal[]
  routines: Routine[]
  onAddGoal: (categoryId: string) => void
  onEditGoal: (goal: Goal) => void
  onDeleteGoal: (id: string) => void
  onEditCategory: (category: Category) => void
  onDeleteCategory: (id: string) => void
  onAddRoutine: (goalId: string) => void
  onEditRoutine: (routine: Routine) => void
}

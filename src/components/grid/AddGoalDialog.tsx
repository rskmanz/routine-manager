'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Category, Goal } from '@/types'
import { getGoalColor } from '@/lib/colorUtils'

const colors = [
  { name: 'from-indigo-500/20 to-indigo-600/20 border-indigo-200/50', class: 'bg-indigo-500' },
  { name: 'from-blue-500/20 to-blue-600/20 border-blue-200/50', class: 'bg-blue-500' },
  { name: 'from-emerald-500/20 to-teal-500/20 border-emerald-200/50', class: 'bg-emerald-500' },
  { name: 'from-orange-500/20 to-red-500/20 border-orange-200/50', class: 'bg-orange-500' },
  { name: 'from-purple-500/20 to-pink-500/20 border-purple-200/50', class: 'bg-purple-500' },
  { name: 'from-sky-500/20 to-sky-600/20 border-sky-200/50', class: 'bg-sky-500' },
]

const icons = ['🎯', '💪', '📚', '💼', '🎨', '🧘', '💡', '🚀', '⭐', '🔥']

interface AddGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void
  editingGoal?: Goal | null
  categories: Category[]
  goals: Goal[]
  defaultCategoryId?: string
}

export function AddGoalDialog({
  open,
  onOpenChange,
  onSubmit,
  editingGoal,
  categories,
  goals,
  defaultCategoryId,
}: AddGoalDialogProps) {
  const [title, setTitle] = useState(editingGoal?.title || '')
  const [description, setDescription] = useState(editingGoal?.description || '')
  const [color, setColor] = useState(editingGoal?.color || colors[0].name)
  const [icon, setIcon] = useState(editingGoal?.icon || '🎯')
  const [categoryId, setCategoryId] = useState(editingGoal?.categoryId || defaultCategoryId || '')

  // Helper to get auto-color based on category pattern
  const getAutoColor = (catId: string): string => {
    const category = categories.find(c => c.id === catId)
    if (category?.colorPattern) {
      const goalsInCategory = goals.filter(g => g.categoryId === catId)
      const nextIndex = goalsInCategory.length
      return getGoalColor(category.colorPattern, nextIndex)
    }
    return colors[0].name
  }

  React.useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title)
      setDescription(editingGoal.description || '')
      setColor(editingGoal.color)
      setIcon(editingGoal.icon || '🎯')
      setCategoryId(editingGoal.categoryId)
    } else {
      setTitle('')
      setDescription('')
      setIcon('🎯')
      const initialCategoryId = defaultCategoryId || (categories && categories[0]?.id) || ''
      setCategoryId(initialCategoryId)
      setColor(getAutoColor(initialCategoryId))
    }
  }, [editingGoal, open, defaultCategoryId, categories, goals])

  // Update color when category changes (for new goals only)
  React.useEffect(() => {
    if (!editingGoal && categoryId) {
      setColor(getAutoColor(categoryId))
    }
  }, [categoryId, editingGoal, categories, goals])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !categoryId) return

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      color,
      icon,
      categoryId,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {(categories || []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Learn English"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description (optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this goal important to you?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {icons.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`p-2 text-xl rounded-lg transition-all ${
                      icon === i
                        ? 'bg-primary/20 ring-2 ring-primary'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    className={`w-8 h-8 rounded-full ${c.class} transition-all ${
                      color === c.name
                        ? 'ring-2 ring-offset-2 ring-offset-background ring-white'
                        : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Routine, Goal } from '@/types'

interface AddRoutineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => void
  goalId: string
  goals: Goal[]
  editingRoutine?: Routine | null
}

export function AddRoutineDialog({
  open,
  onOpenChange,
  onSubmit,
  goalId,
  goals,
  editingRoutine,
}: AddRoutineDialogProps) {
  const [title, setTitle] = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState(goalId)

  useEffect(() => {
    if (editingRoutine) {
      setTitle(editingRoutine.title)
      setSelectedGoalId(editingRoutine.goalId)
    } else {
      setSelectedGoalId(goalId)
    }
  }, [goalId, editingRoutine])

  useEffect(() => {
    if (!open) {
      setTitle('')
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    if (editingRoutine) {
      onSubmit({
        ...editingRoutine,
        title: title.trim(),
        goalId: selectedGoalId,
      })
    } else {
      onSubmit({
        title: title.trim(),
        goalId: selectedGoalId,
        blocks: [],
        integration: {
          executorType: 'code-plugin',
          enabled: false,
          config: {},
        },
        status: 'draft',
      })
    }

    onOpenChange(false)
  }

  const isEditing = !!editingRoutine

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Routine' : 'Create New Routine'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Routine Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Exercise"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Goal
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.icon} {goal.title}
                  </option>
                ))}
              </select>
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
              {isEditing ? 'Save Changes' : 'Create Routine'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

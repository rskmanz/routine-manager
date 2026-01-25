'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, X, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { RoutineTask } from '@/types'
import { cn } from '@/lib/utils'
import { generateId } from '@/lib/utils'

interface TasksPanelProps {
  tasks: RoutineTask[]
  onChange: (tasks: RoutineTask[]) => void
  locale?: string
}

export function TasksPanel({ tasks, onChange, locale = 'en' }: TasksPanelProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'tasks.title': 'Tasks',
        'tasks.add': 'Add task',
        'tasks.placeholder': 'New task...',
        'tasks.empty': 'No tasks yet',
        'tasks.emptyDesc': 'Add tasks to track what needs to be done for this routine.',
        'tasks.completed': 'completed',
      },
      ja: {
        'tasks.title': 'タスク',
        'tasks.add': 'タスクを追加',
        'tasks.placeholder': '新しいタスク...',
        'tasks.empty': 'タスクがありません',
        'tasks.emptyDesc': 'このルーティンで行うべきタスクを追加してください。',
        'tasks.completed': '完了',
      },
    }
    return translations[locale]?.[key] || translations.en[key] || key
  }

  const addTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: RoutineTask = {
      id: generateId(),
      title: newTaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    }

    onChange([...tasks, newTask])
    setNewTaskTitle('')
  }

  const toggleTask = (taskId: string) => {
    onChange(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task
      )
    )
  }

  const deleteTask = (taskId: string) => {
    onChange(tasks.filter((task) => task.id !== taskId))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTask()
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{t('tasks.title')}</h3>
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount} {t('tasks.completed')}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Task list */}
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              layout
              className={cn(
                'group flex items-center gap-2 p-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors',
                task.completed && 'bg-muted/30'
              )}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="flex-shrink-0 focus:outline-none"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/50 hover:text-muted-foreground" />
                )}
              </button>
              <span
                className={cn(
                  'flex-1 text-sm',
                  task.completed && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="text-center py-8 px-4 rounded-lg border-2 border-dashed border-muted-foreground/20">
            <p className="text-sm text-muted-foreground mb-1">{t('tasks.empty')}</p>
            <p className="text-xs text-muted-foreground/70">{t('tasks.emptyDesc')}</p>
          </div>
        )}
      </div>

      {/* Add task input */}
      <div className="flex gap-2">
        <Input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('tasks.placeholder')}
          className="flex-1"
        />
        <Button
          onClick={addTask}
          disabled={!newTaskTitle.trim()}
          size="sm"
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          {t('tasks.add')}
        </Button>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  GripVertical,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Goal, Routine } from '@/types'
import { cn } from '@/lib/utils'
import { RoutineCard } from './RoutineCard'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const goalColors: Record<string, string> = {
  purple: 'border-l-purple-500',
  blue: 'border-l-blue-500',
  green: 'border-l-green-500',
  orange: 'border-l-orange-500',
  pink: 'border-l-pink-500',
  cyan: 'border-l-cyan-500',
}

interface GoalSectionProps {
  goal: Goal
  routines: Routine[]
  onEditGoal: (goal: Goal) => void
  onDeleteGoal: (id: string) => void
  onAddRoutine: (goalId: string) => void
  onEditRoutine: (routine: Routine) => void
  onDeleteRoutine: (id: string) => void
  onToggleRoutineStatus: (id: string) => void
  onReorderRoutines: (routineIds: string[]) => void
  isDraggingGoal?: boolean
}

export function GoalSection({
  goal,
  routines,
  onEditGoal,
  onDeleteGoal,
  onAddRoutine,
  onEditRoutine,
  onDeleteRoutine,
  onToggleRoutineStatus,
  onReorderRoutines,
  isDraggingGoal,
}: GoalSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = routines.findIndex((r) => r.id === active.id)
      const newIndex = routines.findIndex((r) => r.id === over.id)

      const newOrder = [...routines]
      const [movedItem] = newOrder.splice(oldIndex, 1)
      newOrder.splice(newIndex, 0, movedItem)

      onReorderRoutines(newOrder.map((r) => r.id))
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border border-border bg-card/50 overflow-hidden border-l-4 transition-all duration-200',
        goalColors[goal.color] || 'border-l-primary',
        isDragging && 'opacity-50 shadow-2xl',
        isDraggingGoal && 'cursor-grabbing'
      )}
    >
      {/* Goal Header */}
      <div className="flex items-center justify-between p-4 bg-card/80">
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <button
            className="p-1 hover:bg-accent rounded-md cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Expand/collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </button>

          {/* Goal info */}
          <div>
            <div className="flex items-center gap-2">
              {goal.icon && <span className="text-xl">{goal.icon}</span>}
              <h2 className="text-lg font-semibold text-foreground">
                {goal.title}
              </h2>
              <span className="text-sm text-muted-foreground">
                ({routines.length})
              </span>
            </div>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {goal.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddRoutine(goal.id)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Routine
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditGoal(goal)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Goal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteGoal(goal.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Routines */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {routines.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={routines.map((r) => r.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                      {routines.map((routine) => (
                        <div key={routine.id} className="flex-shrink-0 w-64">
                          <RoutineCard
                            routine={routine}
                            onEdit={onEditRoutine}
                            onDelete={onDeleteRoutine}
                            onToggleStatus={onToggleRoutineStatus}
                          />
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    No routines yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddRoutine(goal.id)}
                  >
                    Create your first routine
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

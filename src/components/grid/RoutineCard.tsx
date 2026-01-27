'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Play, Pause, Edit2, Trash2, ChevronDown, Circle, CheckCircle2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Routine } from '@/types'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface RoutineCardProps {
  routine: Routine
  onEdit: (routine: Routine) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  onTaskToggle?: (routineId: string, taskId: string) => void
}

const statusColors = {
  draft: 'bg-zinc-500/20 text-zinc-400',
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
}

export function RoutineCard({
  routine,
  onEdit,
  onDelete,
  onToggleStatus,
  onTaskToggle,
}: RoutineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const tasks = routine.tasks || []
  const completedCount = tasks.filter(t => t.completed).length

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: routine.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'group relative rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-zinc-400 hover:shadow-lg hover:shadow-zinc-500/5 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 shadow-2xl'
      )}
      {...attributes}
      {...listeners}
    >
      {/* Status indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            statusColors[routine.status]
          )}
        >
          {routine.status}
        </span>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded-md text-zinc-400 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(routine.id)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded-md"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(routine)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(routine.id)}>
              {routine.status === 'active' ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(routine.id)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card content */}
      <div className="pr-20" onClick={() => onEdit(routine)}>
        <h3 className="font-medium text-foreground mb-1">{routine.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {routine.blocks.length > 0
            ? routine.blocks[0].content.slice(0, 100)
            : 'No content yet'}
        </p>
      </div>

      {/* Integration indicator */}
      {routine.integration.enabled && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{routine.integration.executorType}</span>
          {routine.integration.schedule && (
            <span className="text-muted-foreground/60">
              | {routine.integration.schedule}
            </span>
          )}
        </div>
      )}

      {/* Tasks drilldown */}
      {tasks.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <ChevronDown className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')} />
            <span>{completedCount}/{tasks.length} tasks</span>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onTaskToggle?.(routine.id, task.id)
                    }}
                    className="flex items-center gap-2 text-sm w-full text-left hover:bg-accent rounded px-1 py-0.5 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={cn(task.completed && 'line-through text-muted-foreground')}>
                      {task.title}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

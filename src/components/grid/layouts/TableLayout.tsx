'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Play, Pause, MoreHorizontal, Briefcase, User, Heart, Folder, ChevronRight,
  Book, Code, Music, Gamepad2, Plane, DollarSign, Home, Car, Dumbbell, Coffee,
  Camera, Palette, Lightbulb, Target, Star, Zap, Globe, Headphones, ShoppingBag,
  Utensils, GraduationCap, Rocket, Award, Trophy, Sun, Moon, Mountain, Leaf, Flame,
  Edit2, Trash2, ChevronDown, Circle, CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { LayoutProps } from './types'

const iconMap: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Lightbulb: <Lightbulb className="w-5 h-5" />,
  Rocket: <Rocket className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
  User: <User className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  Sun: <Sun className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  Book: <Book className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Palette: <Palette className="w-5 h-5" />,
  Camera: <Camera className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  Gamepad2: <Gamepad2 className="w-5 h-5" />,
  Headphones: <Headphones className="w-5 h-5" />,
  Mountain: <Mountain className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  Plane: <Plane className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  Folder: <Folder className="w-5 h-5" />,
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  paused: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export function TableLayout({
  categories,
  goals,
  routines,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onEditCategory,
  onDeleteCategory,
  onAddRoutine,
  onEditRoutine,
  onTaskToggle,
}: LayoutProps) {
  const [expandedRoutines, setExpandedRoutines] = useState<Set<string>>(new Set())

  const toggleExpand = (routineId: string) => {
    setExpandedRoutines(prev => {
      const next = new Set(prev)
      if (next.has(routineId)) {
        next.delete(routineId)
      } else {
        next.add(routineId)
      }
      return next
    })
  }

  const getGoalsForCategory = (categoryId: string) => {
    return goals.filter((g) => g.categoryId === categoryId)
  }

  const getRoutinesForGoal = (goalId: string) => {
    return routines.filter((r) => r.goalId === goalId)
  }

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <div key={category.id} className="relative">
          {/* Category Header */}
          <div className="flex items-center gap-4 mb-6 ml-4">
            <div className="p-3 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md shadow-sm border border-white/20 dark:border-white/10 text-zinc-700 dark:text-zinc-200">
              {iconMap[category.icon] || <Folder className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">
                {category.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage your {category.title.toLowerCase()} goals
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddGoal(category.id)}
              className="gap-1.5 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-zinc-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditCategory(category)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteCategory(category.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table Container */}
          <div className="mx-4 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg overflow-hidden">
            {getGoalsForCategory(category.id).length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-zinc-500 dark:text-zinc-400 mb-4">No goals in this category</p>
                <Button
                  variant="outline"
                  onClick={() => onAddGoal(category.id)}
                  className="gap-2 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  Create First Goal
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-white/20 dark:divide-white/5">
                {getGoalsForCategory(category.id).map((goal, goalIndex) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: goalIndex * 0.05 }}
                    className="relative"
                  >
                    {/* Goal Row */}
                    <div
                      className={cn(
                        'flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-white/30 dark:hover:bg-white/5 transition-colors',
                        goal.color && 'bg-gradient-to-r from-transparent via-transparent to-transparent'
                      )}
                      style={{
                        background: goal.color
                          ? `linear-gradient(to right, transparent, ${goal.color.includes('from-') ? 'rgba(99, 102, 241, 0.05)' : 'transparent'})`
                          : undefined,
                      }}
                    >
                      {/* Goal Icon & Title */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {goal.icon && (
                          <span className="text-xl flex-shrink-0">{goal.icon}</span>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-zinc-900 dark:text-white truncate">
                            {goal.title}
                          </h3>
                          {goal.description && (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                              {goal.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Routines Count */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/30 dark:bg-white/5 text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Routines:</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                          {getRoutinesForGoal(goal.id).length}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onAddRoutine(goal.id)
                          }}
                          className="gap-1 h-8 rounded-lg"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Routine</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditGoal(goal)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteGoal(goal.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Routines Sub-table */}
                    {getRoutinesForGoal(goal.id).length > 0 && (
                      <div className="border-t border-white/10 dark:border-white/5 bg-white/20 dark:bg-black/20">
                        <table className="w-full">
                          <thead>
                            <tr className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
                              <th className="pl-14 pr-4 py-2 text-left font-medium">Routine</th>
                              <th className="px-4 py-2 text-left font-medium w-24">Status</th>
                              <th className="px-4 py-2 text-left font-medium w-32 hidden sm:table-cell">Executor</th>
                              <th className="px-4 py-2 text-right font-medium w-20">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10 dark:divide-white/5">
                            {getRoutinesForGoal(goal.id).map((routine, routineIndex) => {
                              const tasks = routine.tasks || []
                              const completedCount = tasks.filter(t => t.completed).length
                              const isExpanded = expandedRoutines.has(routine.id)

                              return (
                                <React.Fragment key={routine.id}>
                                  <motion.tr
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: goalIndex * 0.05 + routineIndex * 0.02 }}
                                    onClick={() => onEditRoutine(routine)}
                                    className="hover:bg-white/30 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                                  >
                                    <td className="pl-14 pr-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={cn(
                                            'w-2 h-2 rounded-full flex-shrink-0',
                                            routine.status === 'active'
                                              ? 'bg-emerald-400'
                                              : 'bg-zinc-300 dark:bg-zinc-600'
                                          )}
                                        />
                                        <span
                                          className={cn(
                                            'text-sm font-medium',
                                            routine.status === 'paused'
                                              ? 'text-zinc-400 line-through'
                                              : 'text-zinc-700 dark:text-zinc-200'
                                          )}
                                        >
                                          {routine.title}
                                        </span>
                                        {tasks.length > 0 && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              toggleExpand(routine.id)
                                            }}
                                            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 ml-2"
                                          >
                                            <span>{completedCount}/{tasks.length}</span>
                                            <ChevronDown className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')} />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={cn(
                                          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize',
                                          statusColors[routine.status]
                                        )}
                                      >
                                        {routine.status}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                      <span className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">
                                        {routine.integration?.executorType || 'None'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <ChevronRight className="w-4 h-4 text-zinc-400 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </td>
                                  </motion.tr>

                                  {/* Task Drilldown Row */}
                                  <AnimatePresence>
                                    {isExpanded && tasks.length > 0 && (
                                      <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                      >
                                        <td colSpan={4} className="pl-20 pr-4 py-2 bg-white/10 dark:bg-black/10">
                                          <div className="space-y-1">
                                            {tasks.map((task) => (
                                              <button
                                                key={task.id}
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  onTaskToggle?.(routine.id, task.id)
                                                }}
                                                className="flex items-center gap-2 text-sm w-full text-left hover:bg-white/30 dark:hover:bg-white/5 rounded px-2 py-1 transition-colors"
                                              >
                                                {task.completed ? (
                                                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                ) : (
                                                  <Circle className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                                )}
                                                <span className={cn('text-zinc-600 dark:text-zinc-300', task.completed && 'line-through text-zinc-400')}>
                                                  {task.title}
                                                </span>
                                              </button>
                                            ))}
                                          </div>
                                        </td>
                                      </motion.tr>
                                    )}
                                  </AnimatePresence>
                                </React.Fragment>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

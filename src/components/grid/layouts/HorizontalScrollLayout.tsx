'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Plus, MoreHorizontal, Play, Briefcase, User, Heart, Folder, Book, Code, Music,
  Gamepad2, Plane, DollarSign, Home, Car, Dumbbell, Coffee, Camera, Palette,
  Lightbulb, Target, Star, Zap, Globe, Headphones, ShoppingBag, Utensils,
  GraduationCap, Rocket, Award, Trophy, Sun, Moon, Mountain, Leaf, Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'
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

export function HorizontalScrollLayout({
  categories,
  goals,
  routines,
  onAddGoal,
  onEditGoal,
  onAddRoutine,
  onEditRoutine,
}: LayoutProps) {
  const getGoalsForCategory = (categoryId: string) => {
    return goals.filter((g) => g.categoryId === categoryId)
  }

  const getRoutinesForGoal = (goalId: string) => {
    return routines.filter((r) => r.goalId === goalId)
  }

  return (
    <div className="space-y-16">
      {categories.map((category) => (
        <div key={category.id} className="relative">
          {/* Category Header */}
          <div className="flex items-center gap-4 mb-6 ml-4">
            <div className="p-3 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md shadow-sm border border-white/20 dark:border-white/10 text-zinc-700 dark:text-zinc-200">
              {iconMap[category.icon] || <Folder className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">
                {category.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage your {category.title.toLowerCase()} goals
              </p>
            </div>
          </div>

          {/* Horizontal Scroll Container */}
          <div className="relative group/scroll">
            {/* Scroll Area */}
            <div className="flex gap-6 overflow-x-auto pb-8 pt-2 pl-4 pr-12 scrollbar-none snap-x snap-mandatory">
              {getGoalsForCategory(category.id).map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="snap-center flex-shrink-0 w-80 md:w-96 rounded-[2rem] bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group/card"
                >
                  {/* Glass Gradient Background */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-50',
                      goal.color
                    )}
                  />

                  {/* Content */}
                  <div className="relative p-6 flex flex-col h-full min-h-[320px]">
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {goal.icon && (
                            <span className="text-xl">{goal.icon}</span>
                          )}
                          <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                            {goal.title}
                          </h3>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onEditGoal(goal)}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5 text-zinc-500" />
                      </button>
                    </div>

                    {/* Routines List */}
                    <div className="flex-1 space-y-3">
                      {getRoutinesForGoal(goal.id).map((routine) => (
                        <div
                          key={routine.id}
                          onClick={() => onEditRoutine(routine)}
                          className="group/item flex items-center gap-3 p-3 rounded-xl bg-white/30 dark:bg-white/5 border border-white/30 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full',
                              routine.status === 'active'
                                ? 'bg-emerald-400'
                                : 'bg-zinc-300 dark:bg-zinc-600'
                            )}
                          />
                          <span
                            className={cn(
                              'flex-1 text-sm font-medium transition-colors',
                              routine.status === 'paused'
                                ? 'text-zinc-400 line-through'
                                : 'text-zinc-700 dark:text-zinc-200'
                            )}
                          >
                            {routine.title}
                          </span>
                          <Play className="w-3 h-3 text-zinc-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>

                    {/* Add Button */}
                    <div className="mt-6 pt-4 border-t border-white/20 dark:border-white/5">
                      <button
                        onClick={() => onAddRoutine(goal.id)}
                        className="flex items-center justify-between w-full text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-primary transition-colors group/btn"
                      >
                        <span>Add Routine</span>
                        <div className="p-1.5 rounded-full bg-white/50 dark:bg-white/10 group-hover/btn:bg-primary group-hover/btn:text-white transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Add Goal Placeholder */}
              <div
                onClick={() => onAddGoal(category.id)}
                className="snap-center flex-shrink-0 w-24 md:w-32 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white/30 dark:hover:bg-white/5 transition-all min-h-[320px]"
              >
                <Plus className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
              </div>
            </div>

            {/* Fade Edge */}
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-indigo-50 via-indigo-50/50 to-transparent dark:from-zinc-950 dark:via-zinc-950/50 pointer-events-none" />
          </div>
        </div>
      ))}
    </div>
  )
}

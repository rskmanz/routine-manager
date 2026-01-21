'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MoreHorizontal, Plus, CheckCircle2, Circle, Briefcase, User, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BentoGrid() {
    const categories = [
        {
            id: 'work',
            title: 'Work & Professional',
            icon: <Briefcase className="w-5 h-5" />,
            goals: [
                {
                    id: 2,
                    title: 'Deep Work Workflow',
                    icon: '🧠',
                    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
                    routines: [
                        { id: '4', title: 'Check Emails', status: 'done' },
                        { id: '5', title: 'Team Standup', status: 'done' },
                        { id: '6', title: 'Code Review', status: 'pending' },
                    ]
                },
                {
                    id: 5,
                    title: 'Project Alpha',
                    icon: '🚀',
                    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
                    routines: [
                        { id: '11', title: 'Deploy to Staging', status: 'pending' },
                        { id: '12', title: 'Update Documentation', status: 'pending' },
                    ]
                },
            ]
        },
        {
            id: 'personal',
            title: 'Personal & Lifestyle',
            icon: <User className="w-5 h-5" />,
            goals: [
                {
                    id: 1,
                    title: 'Morning Routine',
                    icon: '🌅',
                    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
                    routines: [
                        { id: '1', title: 'Make Coffee', status: 'done' },
                        { id: '2', title: 'Yoga Session', status: 'pending' },
                    ]
                },
                {
                    id: 3,
                    title: 'Evening Relax',
                    icon: '🌙',
                    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
                    routines: [
                        { id: '9', title: 'No Screens', status: 'pending' },
                    ]
                },
            ]
        },
        {
            id: 'health',
            title: 'Health & Fitness',
            icon: <Heart className="w-5 h-5" />,
            goals: [
                {
                    id: 4,
                    title: 'Fitness Goals',
                    icon: '💪',
                    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
                    routines: [
                        { id: '10', title: 'Gym Workout', status: 'done' },
                        { id: '13', title: 'Meal Prep', status: 'pending' },
                    ]
                }
            ]
        }
    ]

    return (
        <div className="p-8 min-h-screen bg-gray-50 dark:bg-[#050505]">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Dashboard Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Space</h1>
                        <p className="text-gray-500 dark:text-zinc-400">Overview of all your routine categories.</p>
                    </div>

                    <div className="hidden md:flex gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">8/12</span>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Tasks Done</span>
                        </div>
                    </div>
                </div>

                {categories.map((category) => (
                    <div key={category.id}>
                        {/* Category Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                                {category.icon}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{category.title}</h2>
                            <div className="h-px flex-1 bg-gray-200 dark:bg-zinc-800 ml-4" />
                        </div>

                        {/* Grid for this Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                            {category.goals.map((goal, index) => (
                                <motion.div
                                    key={goal.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex flex-col rounded-[2rem] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                >
                                    {/* Card Header */}
                                    <div className="p-5 pb-3">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${goal.color}`}>
                                                <span className="text-xl">{goal.icon}</span>
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <h3 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight mb-0.5">
                                            {goal.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-zinc-400">{goal.routines.length} Routines</p>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-gray-100 dark:bg-zinc-800 mx-5" />

                                    {/* Tasks List */}
                                    <div className="flex-1 px-5 py-4 space-y-2.5">
                                        {goal.routines.map((routine) => (
                                            <div key={routine.id} className="flex items-start gap-3 group cursor-pointer">
                                                <div className={cn(
                                                    "mt-0.5",
                                                    routine.status === 'done' ? "text-emerald-500" : "text-gray-300 dark:text-zinc-700 group-hover:text-gray-400"
                                                )}>
                                                    {routine.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <span className={cn(
                                                        "text-[13px] font-medium block transition-colors leading-tight",
                                                        routine.status === 'done' ? "text-gray-400 line-through decoration-gray-300" : "text-gray-700 dark:text-zinc-300 group-hover:text-primary"
                                                    )}>
                                                        {routine.title}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        <button className="w-full mt-2 py-2 text-xs font-medium text-gray-400 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5">
                                            <Plus className="w-3 h-3" />
                                            Add Routine
                                        </button>
                                    </div>

                                </motion.div>
                            ))}

                            {/* Add New Goal to Category Placeholder */}
                            <div className="rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center p-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-zinc-700 transition-all cursor-pointer min-h-[200px]">
                                <Plus className="w-6 h-6 mb-2" />
                                <span className="font-bold text-xs uppercase tracking-wide">Add {category.title} Goal</span>
                            </div>

                        </div>
                    </div>
                ))}

                {/* Add New Category Section */}
                <div className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-zinc-700 transition-all cursor-pointer">
                    <span className="flex items-center gap-2 font-bold">
                        <Plus className="w-5 h-5" />
                        Create New Category
                    </span>
                </div>

            </div>
        </div>
    )
}

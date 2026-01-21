'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreHorizontal, Play, Briefcase, User, Heart, Sparkles, Layers, Box, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'aurora' | 'mesh' | 'prism'

export function GlassModernGrid() {
    const [variant, setVariant] = useState<Variant>('aurora')

    const categories = [
        {
            id: 'work',
            title: 'Work & Professional',
            icon: <Briefcase className="w-5 h-5" />,
            colorName: 'Indigo',
            themeStyles: {
                bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
                border: 'border-indigo-100 dark:border-indigo-900/50',
                text: 'text-indigo-900 dark:text-indigo-100',
                accent: 'bg-indigo-500',
                accentText: 'text-indigo-600 dark:text-indigo-400',
                cardGradient: 'from-indigo-500/10 to-blue-500/10',
                cardBorder: 'border-indigo-200/50 dark:border-indigo-800/30',
                routineItem: 'bg-indigo-50/80 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
            },
            goals: [
                {
                    id: 2,
                    title: 'Deep Work Workflow',
                    description: 'High priority coding tasks',
                    routines: [
                        { id: '1', title: 'Check Emails', status: 'done' },
                        { id: '2', title: 'Team Standup', status: 'done' },
                        { id: '3', title: 'Code Review', status: 'pending' },
                        { id: '4', title: 'Planning', status: 'pending' },
                    ]
                },
                {
                    id: 5,
                    title: 'Project Alpha',
                    description: 'Q1 Deliverables',
                    routines: [
                        { id: '5', title: 'Deploy Staging', status: 'pending' },
                        { id: '6', title: 'Update Docs', status: 'pending' },
                    ]
                },
            ]
        },
        {
            id: 'personal',
            title: 'Personal & Lifestyle',
            icon: <User className="w-5 h-5" />,
            colorName: 'Rose',
            themeStyles: {
                bg: 'bg-rose-50/50 dark:bg-rose-950/20',
                border: 'border-rose-100 dark:border-rose-900/50',
                text: 'text-rose-900 dark:text-rose-100',
                accent: 'bg-rose-500',
                accentText: 'text-rose-600 dark:text-rose-400',
                cardGradient: 'from-rose-500/10 to-orange-500/10',
                cardBorder: 'border-rose-200/50 dark:border-rose-800/30',
                routineItem: 'bg-rose-50/80 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300'
            },
            goals: [
                {
                    id: 1,
                    title: 'Morning Routine',
                    description: 'Start the day right',
                    routines: [
                        { id: '8', title: 'Make Coffee', status: 'done' },
                        { id: '9', title: 'Yoga', status: 'pending' },
                    ]
                },
                {
                    id: 3,
                    title: 'Evening Relax',
                    description: 'Wind down sequence',
                    routines: [
                        { id: '10', title: 'No Screens', status: 'pending' },
                        { id: '11', title: 'Journal', status: 'pending' },
                    ]
                },
            ]
        },
        {
            id: 'health',
            title: 'Health & Fitness',
            icon: <Heart className="w-5 h-5" />,
            colorName: 'Emerald',
            themeStyles: {
                bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
                border: 'border-emerald-100 dark:border-emerald-900/50',
                text: 'text-emerald-900 dark:text-emerald-100',
                accent: 'bg-emerald-500',
                accentText: 'text-emerald-600 dark:text-emerald-400',
                cardGradient: 'from-emerald-500/10 to-teal-500/10',
                cardBorder: 'border-emerald-200/50 dark:border-emerald-800/30',
                routineItem: 'bg-emerald-50/80 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
            },
            goals: [
                {
                    id: 4,
                    title: 'Fitness',
                    description: 'Strength & Cardio',
                    routines: [
                        { id: '12', title: 'Gym Workout', status: 'done' },
                    ]
                }
            ]
        }
    ]

    // Dynamic Backgrounds
    const getBackground = () => {
        switch (variant) {
            case 'aurora':
                return (
                    <div className="fixed inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob" />
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000" />
                        <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000" />
                    </div>
                )
            case 'mesh':
                return (
                    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-900 to-black pointer-events-none" />
                )
            case 'prism':
                return (
                    <div className="fixed inset-0 bg-slate-50 dark:bg-zinc-950 pointer-events-none">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 invert-0" />
                    </div>
                )
            default: return null
        }
    }

    // Card Styles
    const getCardStyle = (baseBorder: string) => {
        switch (variant) {
            case 'aurora':
                return "bg-white/40 dark:bg-black/30 backdrop-blur-xl border-white/20 shadow-xl"
            case 'mesh':
                return "bg-zinc-900/80 backdrop-blur-md border border-white/10 shadow-2xl shadow-indigo-500/10"
            case 'prism':
                return "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl border border-white/60 dark:border-white/10 shadow-sm ring-1 ring-white/50"
            default: return ""
        }
    }

    return (
        <div className={cn(
            "relative p-8 min-h-screen transition-colors duration-500",
            variant === 'aurora' && "bg-gray-50 dark:bg-zinc-900",
            variant === 'mesh' && "bg-black text-white",
            variant === 'prism' && "bg-slate-100 dark:bg-zinc-950"
        )}>
            {getBackground()}

            <div className="relative z-10 max-w-[1600px] mx-auto space-y-12">

                {/* Style Switcher */}
                <div className="flex justify-center mb-8">
                    <div className="flex p-1 rounded-full bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg">
                        <button
                            onClick={() => setVariant('aurora')}
                            className={cn("px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all", variant === 'aurora' ? "bg-white shadow text-indigo-600" : "text-zinc-500 hover:text-zinc-700")}
                        >
                            <Sparkles className="w-4 h-4" /> Aurora
                        </button>
                        <button
                            onClick={() => setVariant('mesh')}
                            className={cn("px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all", variant === 'mesh' ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-700")}
                        >
                            <Layers className="w-4 h-4" /> Deep Mesh
                        </button>
                        <button
                            onClick={() => setVariant('prism')}
                            className={cn("px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all", variant === 'prism' ? "bg-white shadow text-sky-600" : "text-zinc-500 hover:text-zinc-700")}
                        >
                            <Box className="w-4 h-4" /> Prism
                        </button>
                    </div>
                </div>

                {categories.map((category) => (
                    <div key={category.id} className="relative">
                        {/* Category Header with Color Indicator */}
                        <div className="flex items-center gap-4 mb-4 ml-4">
                            <div className={cn(
                                "p-3 rounded-2xl shadow-sm border backdrop-blur-md transition-all",
                                variant === 'mesh' ? "bg-zinc-800 border-zinc-700 text-white" : cn(category.themeStyles.bg, category.themeStyles.border, category.themeStyles.text)
                            )}>
                                {category.icon}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className={cn("text-2xl font-bold transition-colors", variant === 'mesh' ? "text-white" : "text-zinc-900 dark:text-white")}>{category.title}</h2>
                                    {/* Color Selection Indicator */}
                                    <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10", category.themeStyles.accentText)}>
                                        <Palette className="w-3 h-3" />
                                        {category.colorName} Theme
                                    </div>
                                </div>
                                <p className={cn("text-sm transition-colors", variant === 'mesh' ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400")}>Manage your {category.title.toLowerCase()} goals</p>
                            </div>
                        </div>

                        <div className="relative group/scroll">
                            <div className="flex gap-6 overflow-x-auto pb-8 pt-2 pl-4 pr-12 scrollbar-none snap-x snap-mandatory">
                                {category.goals.map((goal, index) => (
                                    <motion.div
                                        key={goal.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={cn(
                                            "snap-center flex-shrink-0 w-80 md:w-96 rounded-[2rem] transition-all duration-300 relative overflow-hidden group/card",
                                            getCardStyle(category.themeStyles.cardBorder),
                                            variant === 'aurora' && category.themeStyles.cardBorder,
                                            variant === 'prism' && "hover:shadow-sky-200/50 hover:ring-sky-200"
                                        )}
                                    >
                                        {variant !== 'mesh' && (
                                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30", category.themeStyles.cardGradient)} />
                                        )}

                                        <div className="relative p-6 flex flex-col h-full min-h-[320px]">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className={cn("text-xl font-bold leading-tight mb-1", variant === 'mesh' ? "text-white" : "text-zinc-900 dark:text-white")}>{goal.title}</h3>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{goal.description}</p>
                                                </div>
                                                <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                                    <MoreHorizontal className="w-5 h-5 text-zinc-500" />
                                                </button>
                                            </div>

                                            {/* Routines List - Cascading Colors */}
                                            <div className="flex-1 space-y-3">
                                                {goal.routines.map((routine) => (
                                                    <div key={routine.id} className={cn(
                                                        "group/item flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border border-transparent",
                                                        // Using themeStyles.routineItem for coloring
                                                        variant === 'mesh'
                                                            ? "bg-zinc-800/50 hover:bg-zinc-700/50 border-zinc-700 text-zinc-300 hover:text-white"
                                                            : category.themeStyles.routineItem
                                                    )}>
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full transition-colors",
                                                            routine.status === 'done' ? category.themeStyles.accent : "bg-black/20 dark:bg-white/20"
                                                        )} />
                                                        <span className={cn(
                                                            "flex-1 text-sm font-medium transition-colors",
                                                            routine.status === 'done' ? "opacity-50 line-through" : ""
                                                        )}>
                                                            {routine.title}
                                                        </span>
                                                        <Play className={cn("w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity", category.themeStyles.accentText)} />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className={cn("mt-6 pt-4 border-t", variant === 'mesh' ? "border-zinc-800" : "border-black/5 dark:border-white/5")}>
                                                <button className={cn("flex items-center justify-between w-full text-sm font-semibold hover:opacity-80 transition-opacity group/btn", category.themeStyles.accentText)}>
                                                    <span>Add Routine</span>
                                                    <div className={cn("p-1.5 rounded-full text-white transition-colors", category.themeStyles.accent)}>
                                                        <Plus className="w-4 h-4" />
                                                    </div>
                                                </button>
                                            </div>

                                        </div>
                                    </motion.div>
                                ))}

                                <div className={cn(
                                    "snap-center flex-shrink-0 w-24 md:w-32 rounded-[2rem] border-2 border-dashed flex items-center justify-center cursor-pointer transition-all",
                                    variant === 'mesh' ? "border-zinc-800 hover:border-zinc-600 text-zinc-800 hover:text-zinc-600" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white/30 dark:hover:bg-white/5 text-zinc-300 dark:text-zinc-700"
                                )}>
                                    <Plus className="w-8 h-8" />
                                </div>
                            </div>

                            <div className={cn(
                                "absolute top-0 right-0 h-full w-24 pointer-events-none bg-gradient-to-l to-transparent",
                                variant === 'mesh' ? "from-black via-black/50" : "from-gray-50 via-gray-50/50 dark:from-zinc-900 dark:via-zinc-900/50"
                            )} />
                        </div>

                    </div>
                ))}

            </div>
        </div>
    )
}

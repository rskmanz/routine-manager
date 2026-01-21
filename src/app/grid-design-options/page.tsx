'use client'

import { Plus, Terminal, Activity, Shield, Cpu, ChevronRight, Hash, Command, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassModernGrid } from './components/GlassModernGrid'
import { BentoGrid } from './components/BentoGrid'
import { NeonGrid } from './components/NeonGrid'
import { cn } from '@/lib/utils'

type DesignOption = 'glass' | 'bento' | 'neon'

export default function GridDesignOptionsPage() {
  const [selectedOption, setSelectedOption] = useState<DesignOption>('glass')

  return (
    <div className="min-h-screen font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/30">

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-zinc-900/95 border-b border-zinc-800 shadow-xl shadow-black/20">
        <div className="max-w-[1600px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/40">
                <Sparkles className="h-6 w-6 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Routine Manager
                </h1>
                <p className="text-sm text-zinc-400">
                  AI-powered automation for your daily routines
                </p>
              </div>
            </div>

            {/* Design Switcher (Replaces LayoutSwitcher) */}
            <div className="flex items-center gap-4">
              <div className="bg-zinc-800 p-1 rounded-lg border border-zinc-700 flex">
                <button
                  onClick={() => setSelectedOption('glass')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    selectedOption === 'glass'
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                  )}
                >
                  Glass Modern
                </button>
                <button
                  onClick={() => setSelectedOption('bento')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    selectedOption === 'bento'
                      ? "bg-white text-zinc-900 shadow-md"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                  )}
                >
                  Bento
                </button>
                <button
                  onClick={() => setSelectedOption('neon')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    selectedOption === 'neon'
                      ? "bg-cyan-900/50 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_-3px_rgba(34,211,238,0.3)]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                  )}
                >
                  Neon
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border h-10 px-4 py-2 rounded-xl border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40"
                >
                  <Plus className="h-4 w-4" />
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full min-h-screen pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedOption}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {selectedOption === 'glass' && <GlassModernGrid />}
            {selectedOption === 'bento' && <BentoGrid />}
            {selectedOption === 'neon' && <NeonGrid />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

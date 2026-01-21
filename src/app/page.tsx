'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Sparkles, MessageCircle, X, Send, FolderPlus, Target, ListChecks, Loader2 } from 'lucide-react'
import { useCategories, useGoals, useRoutines } from '@/hooks/useRoutines'
import { useChat } from '@/hooks/useChat'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  AddGoalDialog,
  AddRoutineDialog,
  AddCategoryDialog,
  LayoutSwitcher,
  HorizontalScrollLayout,
  GridLayout,
  TableLayout,
} from '@/components/grid'
import type { LayoutType } from '@/components/grid/layouts/types'
import { Button } from '@/components/ui/button'
import type { Category, Goal, Routine } from '@/types'
export default function Home() {
  const router = useRouter()
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    loading: categoriesLoading,
  } = useCategories()
  const {
    goals,
    createGoal,
    updateGoal,
    deleteGoal,
    loading: goalsLoading,
  } = useGoals()
  const {
    routines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    loading: routinesLoading,
  } = useRoutines()

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [isAddRoutineOpen, setIsAddRoutineOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')
  const [layoutType, setLayoutType] = useState<LayoutType>('scroll')

  // AI Chat state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getGoalsForCategory = (categoryId: string) => {
    return goals.filter((g) => g.categoryId === categoryId)
  }

  const getRoutinesForGoal = (goalId: string) => {
    return routines.filter((r) => r.goalId === goalId)
  }

  // AI Chat
  const { messages, isLoading: isChatLoading, sendMessage } = useChat({
    title: 'Home Assistant',
    blocks: categories.map(c => ({
      type: 'category' as const,
      content: `${c.title}: ${getGoalsForCategory(c.id).map(g => g.title).join(', ') || 'no goals yet'}`
    })),
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return
    const message = chatInput.trim()
    setChatInput('')
    await sendMessage(message)
  }

  const handleQuickAction = async (prompt: string) => {
    if (isChatLoading) return
    await sendMessage(prompt)
  }

  const handleCreateCategory = (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData)
    } else {
      createCategory(categoryData)
    }
    setEditingCategory(null)
  }

  const handleAddGoal = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setEditingGoal(null)
    setIsAddGoalOpen(true)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setSelectedCategoryId(goal.categoryId)
    setIsAddGoalOpen(true)
  }

  const handleDeleteGoal = (id: string) => {
    if (confirm('Are you sure you want to delete this goal and all its routines?')) {
      deleteGoal(id)
    }
  }

  const handleCreateGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, goalData)
    } else {
      createGoal(goalData)
    }
    setEditingGoal(null)
  }

  const handleAddRoutine = (goalId: string) => {
    setSelectedGoalId(goalId)
    setIsAddRoutineOpen(true)
  }

  const handleCreateRoutine = (routineData: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRoutine = createRoutine(routineData)
    router.push(`/routines/${newRoutine.id}`)
  }

  const handleEditRoutine = (routine: Routine) => {
    router.push(`/routines/${routine.id}`)
  }

  const handleToggleRoutineStatus = (id: string) => {
    const routine = routines.find((r) => r.id === id)
    if (routine) {
      const newStatus = routine.status === 'active' ? 'paused' : 'active'
      updateRoutine(id, { status: newStatus })
    }
  }

  if (categoriesLoading || goalsLoading || routinesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      {/* Floating Header */}
      <div className="sticky top-4 z-40 px-4">
        <header className="max-w-[1600px] mx-auto px-5 py-3 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-black/50 border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-black/5 ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-purple-500/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Routine Manager
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <LayoutSwitcher value={layoutType} onChange={setLayoutType} />
              <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="gap-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Category</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAddGoal(categories[0]?.id || '')}
                  className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/20"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Goal</span>
                </Button>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-8 py-12 space-y-16">
        {categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="rounded-full bg-white/50 dark:bg-white/5 p-6 mb-6 backdrop-blur-xl border border-white/20">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">
              Welcome to Routine Manager
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md">
              Create categories to organize your goals and routines.
            </p>
            <Button
              onClick={() => setIsAddCategoryOpen(true)}
              size="lg"
              className="gap-2 rounded-xl"
            >
              <Plus className="h-5 w-5" />
              Create Your First Category
            </Button>
          </motion.div>
        ) : (
          <>
            {layoutType === 'scroll' && (
              <HorizontalScrollLayout
                categories={categories}
                goals={goals}
                routines={routines}
                onAddGoal={handleAddGoal}
                onEditGoal={handleEditGoal}
                onAddRoutine={handleAddRoutine}
                onEditRoutine={handleEditRoutine}
              />
            )}
            {layoutType === 'grid' && (
              <GridLayout
                categories={categories}
                goals={goals}
                routines={routines}
                onAddGoal={handleAddGoal}
                onEditGoal={handleEditGoal}
                onAddRoutine={handleAddRoutine}
                onEditRoutine={handleEditRoutine}
              />
            )}
            {layoutType === 'table' && (
              <TableLayout
                categories={categories}
                goals={goals}
                routines={routines}
                onAddGoal={handleAddGoal}
                onEditGoal={handleEditGoal}
                onAddRoutine={handleAddRoutine}
                onEditRoutine={handleEditRoutine}
              />
            )}

            {/* Add New Category Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setIsAddCategoryOpen(true)}
              className="relative cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-6 ml-4">
                <div className="p-3 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors">
                  <Plus className="w-5 h-5 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 transition-colors">
                    Add New Category
                  </h2>
                  <p className="text-sm text-zinc-300 dark:text-zinc-700">
                    Click to create a new category
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </main>

      {/* Dialogs */}
      <AddCategoryDialog
        open={isAddCategoryOpen}
        onOpenChange={(open) => {
          setIsAddCategoryOpen(open)
          if (!open) setEditingCategory(null)
        }}
        onSubmit={handleCreateCategory}
        editingCategory={editingCategory}
      />

      <AddGoalDialog
        open={isAddGoalOpen}
        onOpenChange={(open) => {
          setIsAddGoalOpen(open)
          if (!open) setEditingGoal(null)
        }}
        onSubmit={handleCreateGoal}
        editingGoal={editingGoal}
        categories={categories}
        goals={goals}
        defaultCategoryId={selectedCategoryId}
      />

      <AddRoutineDialog
        open={isAddRoutineOpen}
        onOpenChange={setIsAddRoutineOpen}
        onSubmit={handleCreateRoutine}
        goalId={selectedGoalId}
        goals={goals}
      />

      {/* Floating AI Chat Button */}
      {!isChatOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pl-5 pr-4 py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all hover:scale-105 group"
        >
          {/* Pulse ring animation */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-ping opacity-20" />

          <span className="relative flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium text-sm">AIに相談</span>
          </span>
          <MessageCircle className="h-5 w-5 relative" />
        </motion.button>
      )}

      {/* AI Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-zinc-900 dark:text-white">AI Assistant</h2>
                    <p className="text-xs text-zinc-500">Help with categories, goals & routines</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-5 w-5 text-zinc-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="p-4 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 mb-4">
                      <Sparkles className="h-8 w-8 text-indigo-500" />
                    </div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                      How can I help?
                    </h3>
                    <p className="text-sm text-zinc-500 mb-6">
                      Ask me for ideas about categories, goals, or routines to add.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "p-3 rounded-2xl text-sm max-w-[85%]",
                        msg.role === 'user'
                          ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white ml-auto"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 mr-auto"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleQuickAction('Suggest a new category I could create for organizing my routines')}
                    disabled={isChatLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-zinc-600 dark:text-zinc-400 transition-colors disabled:opacity-50"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    Category idea
                  </button>
                  <button
                    onClick={() => handleQuickAction('Suggest goals I could add to organize my routines better')}
                    disabled={isChatLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-600 text-zinc-600 dark:text-zinc-400 transition-colors disabled:opacity-50"
                  >
                    <Target className="h-3.5 w-3.5" />
                    Goal idea
                  </button>
                  <button
                    onClick={() => handleQuickAction('Suggest a daily routine I could create')}
                    disabled={isChatLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-pink-300 dark:hover:border-pink-600 text-zinc-600 dark:text-zinc-400 transition-colors disabled:opacity-50"
                  >
                    <ListChecks className="h-3.5 w-3.5" />
                    Routine idea
                  </button>
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="relative">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                    placeholder="Ask AI for help..."
                    className="pr-12 rounded-xl border-zinc-200 dark:border-zinc-700 focus-visible:ring-indigo-500/30"
                    disabled={isChatLoading}
                  />
                  <Button
                    size="icon"
                    onClick={handleChatSend}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="absolute right-1 top-1 h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

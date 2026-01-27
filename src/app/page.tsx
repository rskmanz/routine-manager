'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Sparkles, MessageCircle, X, Send, FolderPlus, Target, ListChecks, Loader2, CheckCircle, XCircle, User, Check, LogIn } from 'lucide-react'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useCategories, useGoals, useRoutines } from '@/hooks/useRoutines'
import { useChat } from '@/hooks/useChat'
import { useTranslation } from '@/hooks/useTranslation'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Category, Goal, Routine } from '@/types'
import { getToolActionText } from '@/lib/ai/tools'
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
    toggleTask,
    loading: routinesLoading,
  } = useRoutines()

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [isAddRoutineOpen, setIsAddRoutineOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
  const [layoutType, setLayoutType] = useState<LayoutType>('scroll')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Translation
  const { t, locale, changeLocale } = useTranslation()

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

  // AI Chat with tool handlers
  const { messages, isLoading: isChatLoading, sendMessage } = useChat({
    appContext: {
      categories: categories.map(c => ({ id: c.id, title: c.title, icon: c.icon })),
      goals: goals.map(g => ({ id: g.id, title: g.title, categoryId: g.categoryId })),
      routines: routines.map(r => ({ id: r.id, title: r.title, goalId: r.goalId })),
    },
    toolHandlers: {
      onCreateCategory: async (args) => {
        const cat = await createCategory({ title: args.title, icon: args.icon || 'Folder' })
        return { id: cat.id, title: cat.title }
      },
      onCreateGoal: async (args) => {
        const goal = await createGoal({
          title: args.title,
          description: args.description || '',
          categoryId: args.categoryId,
          icon: args.icon || '🎯',
          color: '',
        })
        return { id: goal.id, title: goal.title }
      },
      onCreateRoutine: async (args) => {
        const routine = await createRoutine({
          title: args.title,
          goalId: args.goalId,
          blocks: [],
          sources: [],
          status: 'active',
          integration: { enabled: false, executorType: 'cli', config: {} },
        })
        return { id: routine.id, title: routine.title }
      },
    },
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

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setIsAddCategoryOpen(true)
  }

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category and all its goals/routines?')) {
      deleteCategory(id)
    }
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

  const handleCreateRoutine = async (routineData: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRoutine) {
      await updateRoutine(editingRoutine.id, routineData)
      setEditingRoutine(null)
    } else {
      await createRoutine(routineData)
    }
  }

  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine)
    setSelectedGoalId(routine.goalId)
    setIsAddRoutineOpen(true)
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
        <div className="animate-pulse text-muted-foreground">{t('app.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* Integrated Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 shadow-md">
              <Sparkles className="h-4 w-4 text-white dark:text-zinc-900" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {t('app.title')}
            </h1>
            <button
              onClick={() => changeLocale(locale === 'en' ? 'ja' : 'en')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
            >
              {locale === 'en' ? '日本語' : 'EN'}
            </button>
            {/* Login/User Button */}
            {mounted && (
              <>
                <SignedIn>
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'migrate' })
                      })
                      const data = await res.json()
                      alert(`Migrated ${data.migrated} records. Refreshing...`)
                      window.location.reload()
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 transition-colors"
                  >
                    Sync Data
                  </button>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'h-8 w-8',
                      },
                    }}
                  />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Login</span>
                    </button>
                  </SignInButton>
                </SignedOut>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 bg-white/40 dark:bg-zinc-800/40 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm ring-1 ring-black/5">
            <LayoutSwitcher value={layoutType} onChange={setLayoutType} />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddCategoryOpen(true)}
                className="gap-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-700/50"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t('button.category')}</span>
              </Button>
              <Button
                size="sm"
                onClick={() => handleAddGoal(categories[0]?.id || '')}
                className="gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md shadow-black/5"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t('button.goal')}</span>
              </Button>
            </div>
          </div>
        </div>
        {categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="rounded-full bg-white/50 dark:bg-white/5 p-6 mb-6 backdrop-blur-xl border border-white/20">
              <Sparkles className="h-12 w-12 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">
              {t('app.welcome')}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md">
              {t('app.welcome.desc')}
            </p>
            <Button
              onClick={() => setIsAddCategoryOpen(true)}
              size="lg"
              className="gap-2 rounded-xl"
            >
              <Plus className="h-5 w-5" />
              {t('app.createFirstCategory')}
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
                onDeleteGoal={handleDeleteGoal}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                onAddRoutine={handleAddRoutine}
                onEditRoutine={handleEditRoutine}
                onTaskToggle={toggleTask}
              />
            )}
            {layoutType === 'grid' && (
              <GridLayout
                categories={categories}
                goals={goals}
                routines={routines}
                onAddGoal={handleAddGoal}
                onEditGoal={handleEditGoal}
                onDeleteGoal={handleDeleteGoal}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                onAddRoutine={handleAddRoutine}
                onEditRoutine={handleEditRoutine}
                onTaskToggle={toggleTask}
              />
            )}
            {layoutType === 'table' && (
              <TableLayout
                categories={categories}
                goals={goals}
                routines={routines}
                onAddGoal={handleAddGoal}
                onEditGoal={handleEditGoal}
                onDeleteGoal={handleDeleteGoal}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                onAddRoutine={handleAddRoutine}
                onEditRoutine={handleEditRoutine}
                onTaskToggle={toggleTask}
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
                    {t('app.addCategory')}
                  </h2>
                  <p className="text-sm text-zinc-300 dark:text-zinc-700">
                    {t('app.addCategory.desc')}
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
        onOpenChange={(open) => {
          setIsAddRoutineOpen(open)
          if (!open) setEditingRoutine(null)
        }}
        onSubmit={handleCreateRoutine}
        goalId={selectedGoalId}
        goals={goals}
        editingRoutine={editingRoutine}
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
            <span className="font-medium text-sm">{t('ai.button')}</span>
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
                    <h2 className="font-semibold text-zinc-900 dark:text-white">{t('ai.title')}</h2>
                    <p className="text-xs text-zinc-500">{t('ai.subtitle')}</p>
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
                      {t('ai.howCanIHelp')}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-6">
                      {t('ai.askForIdeas')}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                      <div
                        className={cn(
                          "p-3 rounded-2xl text-sm max-w-[85%]",
                          msg.role === 'user'
                            ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white ml-auto"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 mr-auto"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {/* Show executed tool calls */}
                      {msg.executedToolCalls && msg.executedToolCalls.length > 0 && (
                        <div className="space-y-1 mr-auto max-w-[85%]">
                          {msg.executedToolCalls.map((call) => (
                            <div
                              key={call.id}
                              className={cn(
                                "p-2 rounded-lg border text-xs flex items-center gap-2",
                                call.result.success
                                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                              )}
                            >
                              {call.result.success ? (
                                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 flex-shrink-0" />
                              )}
                              <span>
                                {call.result.success
                                  ? getToolActionText(call.name, call.input)
                                  : `${call.name} failed: ${call.result.error}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{t('ai.thinking')}</span>
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
                    {t('ai.categoryIdea')}
                  </button>
                  <button
                    onClick={() => handleQuickAction('Suggest goals I could add to organize my routines better')}
                    disabled={isChatLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-600 text-zinc-600 dark:text-zinc-400 transition-colors disabled:opacity-50"
                  >
                    <Target className="h-3.5 w-3.5" />
                    {t('ai.goalIdea')}
                  </button>
                  <button
                    onClick={() => handleQuickAction('Suggest a daily routine I could create')}
                    disabled={isChatLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-pink-300 dark:hover:border-pink-600 text-zinc-600 dark:text-zinc-400 transition-colors disabled:opacity-50"
                  >
                    <ListChecks className="h-3.5 w-3.5" />
                    {t('ai.routineIdea')}
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
                    placeholder={t('ai.placeholder')}
                    className="pr-12 rounded-xl border-zinc-200 dark:border-zinc-700 focus-visible:ring-indigo-500/30"
                    disabled={isChatLoading}
                  />
                  <Button
                    size="icon"
                    onClick={handleChatSend}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="absolute right-1 top-1 h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200"
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

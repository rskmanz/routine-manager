'use client'

import React, { useState, use, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Play,
  Settings,
  Loader2,
  Send,
  Sparkles,
  ChevronDown,
  ChevronRight,
  FileText,
  Target,
  Briefcase,
  User,
  Heart,
  Folder,
  BookOpen,
  ListChecks,
  Lightbulb,
  Wand2,
  Zap,
  Calendar,
  Check,
  Menu,
  X,
} from 'lucide-react'
import { useRoutine, useGoals, useRoutines, useCategories } from '@/hooks/useRoutines'
import { useChat } from '@/hooks/useChat'
import { useExecutor } from '@/hooks/useExecutor'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { IntegrationPanel, IntegrationTabContent, TasksPanel } from '@/components/editor'
import { SourcesPanel } from '@/components/resources'
import { SchedulePanel } from '@/components/schedule/SchedulePanel'
import { useCompletions } from '@/hooks/useCompletions'
import type { ResourceSource, RoutineSchedule, RoutineTask } from '@/types'
import { cn } from '@/lib/utils'
import { generateId } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

// Icon mapping for categories
const iconMap: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-4 h-4" />,
  User: <User className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  Folder: <Folder className="w-4 h-4" />,
}

// Quick action definitions for AI chat
const quickActions = [
  { key: 'checklist', labelKey: 'quick.checklist', icon: ListChecks, prompt: 'Create a checklist for this routine' },
  { key: 'steps', labelKey: 'quick.steps', icon: Lightbulb, prompt: 'Suggest step-by-step instructions' },
  { key: 'improve', labelKey: 'quick.improve', icon: Wand2, prompt: 'Improve and refine this routine' },
  { key: 'triggers', labelKey: 'quick.triggers', icon: Zap, prompt: 'Suggest automation triggers' },
]

export default function RoutineEditorPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { routine, loading, updateRoutine } = useRoutine(id)
  const { categories } = useCategories()
  const { goals } = useGoals()
  const { routines: allRoutines } = useRoutines()
  const { execute, isExecuting } = useExecutor()
  const { getStreakInfo } = useCompletions()
  const { t, locale, changeLocale } = useTranslation()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sources, setSources] = useState<ResourceSource[]>([])
  const [tasks, setTasks] = useState<RoutineTask[]>([])
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'editor' | 'sources' | 'schedule' | 'tasks' | 'integration'>('editor')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-expand the category and goal that contains the current routine
  useEffect(() => {
    if (routine?.goalId) {
      const goal = goals.find((g) => g.id === routine.goalId)
      if (goal) {
        setExpandedCategories((prev) => new Set(prev).add(goal.categoryId))
        setExpandedGoals((prev) => new Set(prev).add(routine.goalId))
      }
    }
  }, [routine?.goalId, goals])

  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const toggleGoalExpanded = (goalId: string) => {
    setExpandedGoals((prev) => {
      const next = new Set(prev)
      if (next.has(goalId)) {
        next.delete(goalId)
      } else {
        next.add(goalId)
      }
      return next
    })
  }

  const getGoalsForCategory = (categoryId: string) => {
    return goals.filter((g) => g.categoryId === categoryId)
  }

  const getRoutinesForGoal = (goalId: string) => {
    return allRoutines.filter((r) => r.goalId === goalId)
  }

  const { messages, isLoading: isChatLoading, sendMessage } = useChat({
    routineContext: {
      title: routine?.title || '',
      blocks: [{ type: 'text', content }],
      sources: sources.map((s) => ({ title: s.title, content: s.content })),
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  React.useEffect(() => {
    if (routine) {
      setTitle(routine.title)
      // Convert blocks to simple text content
      const textContent = routine.blocks
        .map((block) => {
          if (block.type === 'heading') return `# ${block.content}`
          if (block.type === 'checklist') return `- [ ] ${block.content}`
          return block.content
        })
        .join('\n\n')
      setContent(textContent)
      // Initialize sources and tasks from routine
      setSources(routine.sources || [])
      setTasks(routine.tasks || [])
    }
  }, [routine])

  const handleAddSource = (source: Omit<ResourceSource, 'id' | 'addedAt'>) => {
    const newSource: ResourceSource = {
      ...source,
      id: generateId(),
      addedAt: new Date().toISOString(),
    }
    setSources((prev) => [...prev, newSource])
    // Save immediately
    updateRoutine({ sources: [...sources, newSource] })
  }

  const handleRemoveSource = (id: string) => {
    const newSources = sources.filter((s) => s.id !== id)
    setSources(newSources)
    // Save immediately
    updateRoutine({ sources: newSources })
  }

  const handleTasksChange = (newTasks: RoutineTask[]) => {
    setTasks(newTasks)
    // Save immediately
    updateRoutine({ tasks: newTasks })
  }

  const handleSave = () => {
    // Convert simple text content back to blocks
    const lines = content.split('\n').filter((line) => line.trim())
    const blocks = lines.map((line, index) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('# ')) {
        return { id: crypto.randomUUID(), type: 'heading' as const, content: trimmed.slice(2), order: index }
      }
      if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
        return {
          id: crypto.randomUUID(),
          type: 'checklist' as const,
          content: trimmed.slice(6),
          checked: trimmed.startsWith('- [x]'),
          order: index,
        }
      }
      return { id: crypto.randomUUID(), type: 'text' as const, content: trimmed, order: index }
    })

    updateRoutine({ title, blocks })
  }

  const handleRun = async () => {
    if (!routine) return
    handleSave()
    await execute(routine.id)
  }

  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return
    const message = chatInput.trim()
    setChatInput('')
    await sendMessage(message)
  }

  const handleInsertBlock = (blockContent: string, blockType: string = 'text') => {
    let newContent = content
    if (blockType === 'checklist') {
      const items = blockContent.split('\n').filter(line => line.trim())
      const checklistItems = items.map(item => `- [ ] ${item.replace(/^[-*]\s*/, '')}`).join('\n')
      newContent = content + '\n\n' + checklistItems
    } else if (blockType === 'heading') {
      newContent = content + '\n\n# ' + blockContent
    } else {
      newContent = content + '\n\n' + blockContent
    }
    setContent(newContent)
    handleSave()
  }

  const handleScheduleSave = (schedule: RoutineSchedule) => {
    updateRoutine({ schedule })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t('app.loading')}</div>
      </div>
    )
  }

  if (!routine) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">{t('editor.routineNotFound')}</p>
        <Button onClick={() => router.push('/')}>{t('editor.goHome')}</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Page Layout */}
      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-2 sm:px-4 flex flex-col h-[calc(100vh-2rem)] my-2 sm:my-4">

        {/* Header - Full Width at Top */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 px-2 mb-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                handleSave()
                router.push('/')
              }}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              className="text-xl font-bold bg-transparent border-0 p-0 focus-visible:ring-0 w-full sm:w-[400px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              placeholder="Routine title..."
            />
          </div>

            <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg h-10 w-10 sm:h-8 sm:w-8"
                  title={t('button.save')}
                >
                  <Save className="h-5 w-5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsIntegrationOpen(true)}
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg h-10 w-10 sm:h-8 sm:w-8"
                  title={t('button.settings')}
                >
                  <Settings className="h-5 w-5 sm:h-4 sm:w-4" />
                </Button>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                <Button
                  size="sm"
                  onClick={handleRun}
                  disabled={isExecuting || !routine.integration.enabled}
                  className="gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md rounded-lg h-10 sm:h-8 px-4 sm:px-3 text-sm sm:text-xs"
                >
                  {isExecuting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  <span>{t('button.run')}</span>
                </Button>
            </div>
        </header>

        {/* 3-Column Content Area */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left Sidebar - Navigation */}
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            <div className="h-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 p-3 shadow-xl shadow-indigo-500/5 ring-1 ring-white/20 dark:ring-white/5 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-3 px-2">
                <Folder className="h-4 w-4" />
                <span className="font-semibold text-xs uppercase tracking-wider">{t('editor.explorer')}</span>
              </div>
              <nav className="space-y-1">
                {categories.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => toggleCategoryExpanded(category.id)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors group"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
                      )}
                      <span className="opacity-70 group-hover:opacity-100 transition-opacity">{iconMap[category.icon] || <Folder className="w-4 h-4" />}</span>
                      <span className="font-medium truncate text-xs">{category.title}</span>
                    </button>

                    <AnimatePresence>
                      {expandedCategories.has(category.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-2.5 pl-2.5 border-l border-zinc-200 dark:border-zinc-800 space-y-1 overflow-hidden"
                        >
                          {getGoalsForCategory(category.id).map((goal) => (
                            <div key={goal.id}>
                              <button
                                onClick={() => toggleGoalExpanded(goal.id)}
                                className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-left text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors group"
                              >
                                {expandedGoals.has(goal.id) ? (
                                  <ChevronDown className="w-3 h-3 shrink-0 text-zinc-300 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
                                )}
                                <Target className="w-3 h-3 text-indigo-500/70 group-hover:text-indigo-500 shrink-0 transition-colors" />
                                <span className="truncate">{goal.title}</span>
                              </button>

                              <AnimatePresence>
                                {expandedGoals.has(goal.id) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="ml-2 pl-2 border-l border-zinc-200 dark:border-zinc-800 space-y-0.5 overflow-hidden"
                                  >
                                    {getRoutinesForGoal(goal.id).map((r) => (
                                      <Link
                                        key={r.id}
                                        href={`/routines/${r.id}`}
                                        className={cn(
                                          "block px-2 py-1.5 rounded-md text-xs truncate transition-all border-l-2",
                                          r.id === id
                                            ? "bg-gradient-to-r from-indigo-500/10 to-transparent border-indigo-500 text-indigo-700 dark:text-indigo-300 font-medium"
                                            : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5"
                                        )}
                                      >
                                        {r.title}
                                      </Link>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Center - Editor Content */}
          <main className="flex-1 min-w-0 flex flex-col">
            {/* Chrome-style tabs */}
            <div className="flex items-end gap-0.5 pl-2">
              <button
                onClick={() => setActiveTab('editor')}
                className={cn(
                  "px-4 py-2 text-xs font-medium transition-all relative rounded-t-lg",
                  activeTab === 'editor'
                    ? "bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 z-10"
                    : "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {t('editor.title')}
              </button>
              <button
                onClick={() => setActiveTab('sources')}
                className={cn(
                  "px-4 py-2 text-xs font-medium transition-all relative rounded-t-lg flex items-center gap-1.5",
                  activeTab === 'sources'
                    ? "bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 z-10"
                    : "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {t('editor.sources')}
                {sources.length > 0 && <span className="bg-zinc-300 dark:bg-zinc-600 px-1.5 rounded-full text-[9px] min-w-[16px] text-center">{sources.length}</span>}
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={cn(
                  "px-4 py-2 text-xs font-medium transition-all relative rounded-t-lg flex items-center gap-1.5",
                  activeTab === 'schedule'
                    ? "bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 z-10"
                    : "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                <Calendar className="h-3 w-3" />
                {t('nav.schedule')}
                {routine.schedule?.enabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={cn(
                  "px-4 py-2 text-xs font-medium transition-all relative rounded-t-lg flex items-center gap-1.5",
                  activeTab === 'tasks'
                    ? "bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 z-10"
                    : "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                <ListChecks className="h-3 w-3" />
                Tasks
                {tasks.length > 0 && <span className="bg-zinc-300 dark:bg-zinc-600 px-1.5 rounded-full text-[9px] min-w-[16px] text-center">{tasks.length}</span>}
              </button>
              <button
                onClick={() => setActiveTab('integration')}
                className={cn(
                  "px-4 py-2 text-xs font-medium transition-all relative rounded-t-lg flex items-center gap-1.5",
                  activeTab === 'integration'
                    ? "bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 z-10"
                    : "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                <Zap className="h-3 w-3" />
                Integration
                {routine.integration.enabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>

            {/* Content area */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl rounded-tl-none shadow-2xl shadow-indigo-500/10 ring-1 ring-white/40 dark:ring-white/5 flex-1 relative overflow-hidden">
            {activeTab === 'editor' && (
              <div className="p-8 md:p-12 h-full overflow-y-auto custom-scrollbar">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={handleSave}
                  placeholder={t('editor.placeholder')}
                  className="w-full h-full min-h-[500px] text-lg leading-relaxed resize-none border-0 focus-visible:ring-0 bg-transparent p-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 selection:bg-indigo-100 dark:selection:bg-indigo-900/30 font-serif md:font-sans"
                  spellCheck={false}
                />
              </div>
            )}
            {activeTab === 'sources' && (
              <div className="p-8 h-full overflow-y-auto">
                <SourcesPanel
                  sources={sources}
                  onAddSource={handleAddSource}
                  onRemoveSource={handleRemoveSource}
                  className="max-w-none"
                />
              </div>
            )}
            {activeTab === 'schedule' && (
              <div className="h-full overflow-y-auto">
                <SchedulePanel
                  schedule={routine.schedule}
                  streakInfo={getStreakInfo(routine.id)}
                  onSave={handleScheduleSave}
                />
              </div>
            )}
            {activeTab === 'tasks' && (
              <div className="p-8 h-full overflow-y-auto">
                <TasksPanel
                  tasks={tasks}
                  onChange={handleTasksChange}
                  locale={locale}
                />
              </div>
            )}
            {activeTab === 'integration' && (
              <IntegrationTabContent
                routine={routine}
                onUpdate={updateRoutine}
              />
            )}
            </div>
          </main>

          {/* Right Sidebar - AI Chat */}
          <aside className="w-72 flex-shrink-0 hidden xl:block">
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 flex flex-col h-full shadow-xl shadow-purple-500/5 ring-1 ring-white/20 dark:ring-white/5">
            <div className="p-4 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                <Sparkles className="h-4 w-4 text-indigo-500" />
              </div>
              <h2 className="font-semibold text-sm">{t('ai.title')}</h2>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-500">{t('ai.askAnything')}</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={cn("p-3 rounded-xl text-sm", msg.role === 'user' ? "bg-indigo-500 text-white ml-4" : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mr-4 shadow-sm")}>
                    {msg.content}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-3 py-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex gap-1 flex-wrap">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.key}
                      onClick={async () => {
                        setChatInput(action.prompt)
                        await sendMessage(action.prompt)
                      }}
                      disabled={isChatLoading}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors disabled:opacity-50"
                    >
                      <Icon className="h-3 w-3" />
                      {t(action.labelKey as any)}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Input */}
            <div className="p-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-b-2xl border-t border-zinc-200/50 dark:border-zinc-800/50">
              <div className="relative">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder={t('ai.placeholder')}
                  className="pr-10 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus-visible:ring-indigo-500/30 rounded-xl shadow-sm"
                />
                <Button size="icon" onClick={handleChatSend} disabled={isChatLoading} className="absolute right-1 top-1 h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Integration Panel */}
      <AnimatePresence>
        {isIntegrationOpen && (
          <IntegrationPanel
            routine={routine}
            onUpdate={updateRoutine}
            onClose={() => setIsIntegrationOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-zinc-900 z-50 lg:hidden shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                  <Folder className="h-5 w-5" />
                  <span className="font-semibold">{t('editor.explorer')}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="h-8 w-8 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {/* Navigation */}
              <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-60px)]">
                {categories.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => toggleCategoryExpanded(category.id)}
                      className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors group"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      )}
                      <span className="opacity-70 group-hover:opacity-100">{iconMap[category.icon] || <Folder className="w-4 h-4" />}</span>
                      <span className="font-medium truncate">{category.title}</span>
                    </button>

                    <AnimatePresence>
                      {expandedCategories.has(category.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800 space-y-1 overflow-hidden"
                        >
                          {getGoalsForCategory(category.id).map((goal) => (
                            <div key={goal.id}>
                              <button
                                onClick={() => toggleGoalExpanded(goal.id)}
                                className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors group"
                              >
                                {expandedGoals.has(goal.id) ? (
                                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                                )}
                                <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className="truncate">{goal.title}</span>
                              </button>

                              <AnimatePresence>
                                {expandedGoals.has(goal.id) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="ml-3 pl-3 border-l border-zinc-200 dark:border-zinc-800 space-y-1 overflow-hidden"
                                  >
                                    {getRoutinesForGoal(goal.id).map((r) => (
                                      <Link
                                        key={r.id}
                                        href={`/routines/${r.id}`}
                                        onClick={() => setIsMobileNavOpen(false)}
                                        className={cn(
                                          "block px-3 py-2 rounded-md text-sm truncate transition-all",
                                          r.id === id
                                            ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium"
                                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        )}
                                      >
                                        {r.title}
                                      </Link>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}

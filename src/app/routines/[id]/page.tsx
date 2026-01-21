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
} from 'lucide-react'
import { useRoutine, useGoals, useRoutines, useCategories } from '@/hooks/useRoutines'
import { useChat } from '@/hooks/useChat'
import { useExecutor } from '@/hooks/useExecutor'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { IntegrationPanel } from '@/components/editor'
import { SourcesPanel } from '@/components/resources'
import type { ResourceSource } from '@/types'
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
  const { t } = useTranslation()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sources, setSources] = useState<ResourceSource[]>([])
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'editor' | 'sources'>('editor')
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
    title: routine?.title || '',
    blocks: [{ type: 'text', content }],
    sources: sources.map((s) => ({ title: s.title, content: s.content })),
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
      // Initialize sources from routine
      setSources(routine.sources || [])
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

      {/* Floating Header */}
      <div className="sticky top-4 z-50 px-4 mb-6">
        <header className="max-w-[1200px] mx-auto px-4 py-3 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-black/60 border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-black/5 ring-1 ring-black/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                handleSave()
                router.push('/')
              }}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex flex-col">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                className="text-lg font-bold bg-transparent border-0 p-0 focus-visible:ring-0 w-full sm:w-[300px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                placeholder="Routine title..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg hidden sm:flex"
            >
              <Save className="h-4 w-4" />
              {t('button.save')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsIntegrationOpen(true)}
              className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t('button.settings')}</span>
            </Button>
            <Button
              size="sm"
              onClick={handleRun}
              disabled={isExecuting || !routine.integration.enabled}
              className="gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md rounded-xl"
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{t('button.run')}</span>
            </Button>
          </div>
        </header>
      </div>

      {/* Main Page Layout (Fixed Height) */}
      <div className="relative z-10 max-w-[1200px] mx-auto w-full px-4 flex gap-8 h-[calc(100vh-100px)]">

        {/* Left Sidebar - Navigation */}
        <aside className="w-64 flex-shrink-0 hidden lg:block overflow-y-auto">
          <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-4 px-2">
              <Folder className="h-4 w-4" />
              <span className="font-semibold text-xs uppercase tracking-wider">{t('editor.explorer')}</span>
            </div>
            <nav className="space-y-1">
              {categories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategoryExpanded(category.id)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-3 h-3 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 shrink-0" />
                    )}
                    <span className="opacity-70">{iconMap[category.icon] || <Folder className="w-4 h-4" />}</span>
                    <span className="font-medium truncate">{category.title}</span>
                  </button>

                  {expandedCategories.has(category.id) && (
                    <div className="ml-4 space-y-1">
                      {getGoalsForCategory(category.id).map((goal) => (
                        <div key={goal.id}>
                          <button
                            onClick={() => toggleGoalExpanded(goal.id)}
                            className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-left text-xs text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                          >
                            {expandedGoals.has(goal.id) ? (
                              <ChevronDown className="w-3 h-3 shrink-0" />
                            ) : (
                              <ChevronRight className="w-3 h-3 shrink-0" />
                            )}
                            <Target className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="truncate">{goal.title}</span>
                          </button>

                          {expandedGoals.has(goal.id) && (
                            <div className="ml-5 space-y-0.5">
                              {getRoutinesForGoal(goal.id).map((r) => (
                                <Link
                                  key={r.id}
                                  href={`/routines/${r.id}`}
                                  className={cn(
                                    "block p-1.5 rounded-md text-xs truncate transition-colors",
                                    r.id === id
                                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                                      : "text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-zinc-300"
                                  )}
                                >
                                  {r.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Center Content - Editor */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Editor/Sources Switcher */}
          <div className="flex items-center gap-1 mb-6 bg-zinc-100/50 dark:bg-zinc-800/50 p-1 rounded-xl w-fit backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
            <button
              onClick={() => setActiveTab('editor')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                activeTab === 'editor'
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              {t('editor.title')}
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'sources'
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              {t('editor.sources')}
              {sources.length > 0 && <span className="bg-zinc-200 dark:bg-zinc-700 px-1.5 rounded-full text-[10px]">{sources.length}</span>}
            </button>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl shadow-sm flex-1 relative overflow-hidden">
            {activeTab === 'editor' ? (
              <div className="p-8 md:p-12 h-full overflow-y-auto">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={handleSave}
                  placeholder={t('editor.placeholder')}
                  className="w-full h-full min-h-[500px] text-lg leading-relaxed resize-none border-0 focus-visible:ring-0 bg-transparent p-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 selection:bg-indigo-100 dark:selection:bg-indigo-900/30 font-serif md:font-sans"
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="p-8 h-full overflow-y-auto">
                <SourcesPanel
                  sources={sources}
                  onAddSource={handleAddSource}
                  onRemoveSource={handleRemoveSource}
                  className="max-w-none"
                />
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - AI Chat */}
        <aside className="w-80 flex-shrink-0 hidden xl:block">
          <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col h-full shadow-sm">
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
    </div>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Github,
  Terminal,
  Code,
  Search,
  ExternalLink,
  Loader2,
  Copy,
  CheckCircle,
  AlertCircle,
  X,
  Zap,
} from 'lucide-react'
import { GITHUB_WORKFLOW_TEMPLATE, GITHUB_WORKFLOW_FILENAME } from '@/lib/executors/github-workflow-template'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Routine, ExecutorType, ExecutorConfig } from '@/types'
import { cn } from '@/lib/utils'

const executorOptions: {
  type: ExecutorType
  name: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    type: 'mcp',
    name: 'MCP Registry',
    description: 'Connect to 2000+ MCP servers',
    icon: <Globe className="h-5 w-5" />,
  },
  {
    type: 'github-action',
    name: 'GitHub Action',
    description: 'Create issues for @claude',
    icon: <Github className="h-5 w-5" />,
  },
  {
    type: 'cli',
    name: 'Claude CLI',
    description: 'Execute via claude -p',
    icon: <Terminal className="h-5 w-5" />,
  },
  {
    type: 'code-plugin',
    name: 'Code Plugin',
    description: 'Run TypeScript in-app',
    icon: <Code className="h-5 w-5" />,
  },
]

interface IntegrationTabContentProps {
  routine: Routine
  onUpdate: (updates: Partial<Routine>) => void
}

export function IntegrationTabContent({ routine, onUpdate }: IntegrationTabContentProps) {
  const [selectedType, setSelectedType] = useState<ExecutorType>(
    routine.integration.executorType
  )
  const [config, setConfig] = useState<ExecutorConfig>(routine.integration.config)
  const [enabled, setEnabled] = useState(routine.integration.enabled)
  const [schedule, setSchedule] = useState(routine.integration.schedule || '')

  // Auto-save with debounce
  const saveChanges = useCallback(() => {
    onUpdate({
      integration: {
        ...routine.integration,
        executorType: selectedType,
        config,
        enabled,
        schedule: schedule || undefined,
      },
    })
  }, [routine.integration, selectedType, config, enabled, schedule, onUpdate])

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      saveChanges()
    }, 500)
    return () => clearTimeout(timer)
  }, [selectedType, config, enabled, schedule, saveChanges])

  return (
    <div className="p-8 md:p-12 h-full overflow-y-auto custom-scrollbar space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Integration Settings</h2>
          <p className="text-sm text-zinc-500">Configure how this routine executes automatically</p>
        </div>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">Enable Integration</p>
          <p className="text-sm text-zinc-500">
            Allow this routine to be executed automatically
          </p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            enabled ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-600'
          )}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            animate={{ left: enabled ? '1.5rem' : '0.25rem' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Executor selection */}
      <div className="space-y-4">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">Executor Type</p>
        <div className="grid grid-cols-2 gap-3">
          {executorOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedType(option.type)}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border transition-all text-left',
                selectedType === option.type
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg',
                  selectedType === option.type
                    ? 'bg-indigo-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                )}
              >
                {option.icon}
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{option.name}</p>
                <p className="text-xs text-zinc-500">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration based on selected executor */}
      <div className="space-y-4">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">Configuration</p>
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
          <ExecutorConfigPanel
            type={selectedType}
            config={config}
            onChange={setConfig}
          />
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-3">
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">Schedule (Optional)</p>
          <p className="text-sm text-zinc-500">
            Use cron expression for automated execution
          </p>
        </div>
        <Input
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          placeholder="e.g., 0 9 * * * (every day at 9am)"
          className="bg-white dark:bg-zinc-800"
        />
      </div>
    </div>
  )
}

interface ExecutorConfigPanelProps {
  type: ExecutorType
  config: ExecutorConfig
  onChange: (config: ExecutorConfig) => void
}

function ExecutorConfigPanel({ type, config, onChange }: ExecutorConfigPanelProps) {
  switch (type) {
    case 'mcp':
      return (
        <MCPConfig
          server={config.mcpServer || ''}
          tools={config.mcpTools || []}
          onChange={(server, tools) =>
            onChange({ ...config, mcpServer: server, mcpTools: tools })
          }
        />
      )
    case 'github-action':
      return <GitHubActionConfig config={config} onChange={onChange} />
    case 'cli':
      return (
        <div className="space-y-3">
          <Input
            value={config.cliCommand || 'claude -p'}
            onChange={(e) => onChange({ ...config, cliCommand: e.target.value })}
            placeholder="claude -p"
            className="bg-white dark:bg-zinc-900"
          />
          <p className="text-xs text-zinc-500">
            Command to execute. Routine content will be passed as the prompt.
          </p>
        </div>
      )
    case 'code-plugin':
      return (
        <div className="space-y-3">
          <Textarea
            value={config.pluginCode || ''}
            onChange={(e) => onChange({ ...config, pluginCode: e.target.value })}
            placeholder={`// TypeScript plugin code\nexport async function execute(routine) {\n  // Your automation logic here\n  return { success: true }\n}`}
            className="font-mono text-sm bg-white dark:bg-zinc-900"
            rows={8}
          />
          <p className="text-xs text-zinc-500">
            Write TypeScript code to automate this routine
          </p>
        </div>
      )
  }
}

interface MCPConfigProps {
  server: string
  tools: string[]
  onChange: (server: string, tools: string[]) => void
}

function MCPConfig({ server, tools, onChange }: MCPConfigProps) {
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<
    { name: string; description: string; tools: string[] }[]
  >([])

  const handleSearch = async () => {
    if (!search.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/mcp?search=${encodeURIComponent(search)}&limit=10`)
      const data = await response.json()
      if (data.success && data.data?.servers) {
        setResults(
          data.data.servers.map((s: { name: string; description: string; tools?: { name: string }[] }) => ({
            name: s.name,
            description: s.description,
            tools: s.tools?.map((t: { name: string }) => t.name) || [],
          }))
        )
      }
    } catch {
      // Ignore errors
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search MCP servers..."
          className="flex-1 bg-white dark:bg-zinc-900"
        />
        <Button variant="outline" onClick={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Selected server */}
      {server && (
        <div className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-lg">
          <span className="font-medium text-indigo-700 dark:text-indigo-300">{server}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('', [])}
            className="h-6 px-2"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Search results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.name}
                  onClick={() => {
                    onChange(result.name, result.tools)
                    setResults([])
                    setSearch('')
                  }}
                  className="w-full flex items-start gap-2 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left border-b border-zinc-200 dark:border-zinc-700 last:border-0"
                >
                  <Globe className="h-4 w-4 mt-0.5 text-zinc-400" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{result.name}</p>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {result.description}
                    </p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-zinc-400" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected tools */}
      {tools.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-zinc-500">Available tools:</p>
          <div className="flex flex-wrap gap-1">
            {tools.slice(0, 5).map((tool) => (
              <span
                key={tool}
                className="text-xs bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded"
              >
                {tool}
              </span>
            ))}
            {tools.length > 5 && (
              <span className="text-xs text-zinc-500">
                +{tools.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface GitHubActionConfigProps {
  config: ExecutorConfig
  onChange: (config: ExecutorConfig) => void
}

function GitHubActionConfig({ config, onChange }: GitHubActionConfigProps) {
  const [copied, setCopied] = useState(false)
  const [showWorkflow, setShowWorkflow] = useState(false)

  const handleCopyWorkflow = async () => {
    try {
      await navigator.clipboard.writeText(GITHUB_WORKFLOW_TEMPLATE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = GITHUB_WORKFLOW_TEMPLATE
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isValidRepo = config.githubRepo?.includes('/') && config.githubRepo.split('/').length === 2

  return (
    <div className="space-y-4">
      {/* Repository Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Repository</label>
        <div className="flex gap-2">
          <Input
            value={config.githubRepo || ''}
            onChange={(e) => onChange({ ...config, githubRepo: e.target.value })}
            placeholder="owner/repository"
            className={cn(
              'flex-1 bg-white dark:bg-zinc-900',
              config.githubRepo && !isValidRepo && 'border-red-500'
            )}
          />
          {config.githubRepo && isValidRepo && (
            <Button
              variant="outline"
              size="icon"
              asChild
              className="shrink-0"
            >
              <a
                href={`https://github.com/${config.githubRepo}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
        {config.githubRepo && !isValidRepo && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Format must be: owner/repository
          </p>
        )}
      </div>

      {/* Setup Instructions */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50 p-3 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Workflow Setup</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyWorkflow}
            className="h-7 gap-1.5"
          >
            {copied ? (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy Workflow
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-zinc-500">
          Add this workflow to your repository at:
        </p>
        <code className="block text-xs bg-white dark:bg-zinc-900 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">
          .github/workflows/{GITHUB_WORKFLOW_FILENAME}
        </code>

        <button
          onClick={() => setShowWorkflow(!showWorkflow)}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {showWorkflow ? 'Hide workflow' : 'Show workflow'}
        </button>

        <AnimatePresence>
          {showWorkflow && (
            <motion.pre
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-xs bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-700 overflow-x-auto"
            >
              {GITHUB_WORKFLOW_TEMPLATE}
            </motion.pre>
          )}
        </AnimatePresence>
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-500">Requirements:</p>
        <ul className="text-xs text-zinc-500 space-y-1 list-disc list-inside">
          <li>GITHUB_TOKEN set in your environment</li>
          <li>ANTHROPIC_API_KEY in repository secrets</li>
          <li>Repository has Issues enabled</li>
        </ul>
      </div>

      {/* Documentation Link */}
      <a
        href="https://github.com/anthropics/claude-code-action"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        <ExternalLink className="h-3 w-3" />
        View claude-code-action documentation
      </a>
    </div>
  )
}

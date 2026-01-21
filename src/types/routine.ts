// Color pattern types for automatic goal coloring
export type ColorPattern = 'monochrome' | 'complementary' | 'rainbow' | 'warm' | 'cool'

// Resource source (like NotebookLM sources)
export type ResourceType = 'url' | 'text' | 'file'

export interface ResourceSource {
  id: string
  title: string
  url?: string            // URL for web sources
  type: ResourceType
  content?: string        // Fetched/stored content for AI context
  summary?: string        // AI-generated summary
  addedAt: string
}

// Category (top-level grouping: Work, Personal, Health)
export interface Category {
  id: string
  title: string
  icon: string  // Lucide icon name: 'Briefcase' | 'User' | 'Heart' etc.
  colorPattern?: ColorPattern  // Color scheme for goals in this category
  baseColor?: string  // Base color for monochrome patterns
  order: number
  createdAt: string
  updatedAt: string
}

// Goal (container for related routines, belongs to a Category)
export interface Goal {
  id: string
  title: string
  description?: string
  icon?: string
  color: string
  categoryId: string  // belongs to a Category
  sources?: ResourceSource[]  // NotebookLM-style sources
  order: number
  createdAt: string
  updatedAt: string
}

// Content block types for the editor
export type BlockType = 'text' | 'heading' | 'checklist' | 'trigger' | 'action'

export interface ContentBlock {
  id: string
  type: BlockType
  content: string
  checked?: boolean // for checklist items
  order: number
}

// Executor types
export type ExecutorType = 'mcp' | 'github-action' | 'cli' | 'code-plugin'

export interface ExecutorConfig {
  // MCP executor
  mcpServer?: string
  mcpTools?: string[]

  // GitHub Action executor
  githubRepo?: string
  githubWorkflow?: string

  // CLI executor
  cliCommand?: string

  // Code plugin executor
  pluginCode?: string
  pluginPath?: string
}

export interface RoutineIntegration {
  executorType: ExecutorType
  enabled: boolean
  config: ExecutorConfig
  schedule?: string // cron expression
  lastRun?: string
  lastResult?: 'success' | 'failure' | 'pending'
}

// Routine status
export type RoutineStatus = 'draft' | 'active' | 'paused'

// Main Routine interface
export interface Routine {
  id: string
  title: string
  goalId: string
  blocks: ContentBlock[]
  sources?: ResourceSource[]  // NotebookLM-style sources
  integration: RoutineIntegration
  status: RoutineStatus
  createdAt: string
  updatedAt: string
}

// Chat message for AI assistant
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  suggestedBlocks?: ContentBlock[]
}

// MCP Server from registry
export interface MCPServer {
  name: string
  version: string
  description: string
  repository: string
  tools: string[]
  category?: string
}

// Storage data structure
export interface StorageData {
  categories: Category[]
  goals: Goal[]
  routines: Routine[]
  version: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

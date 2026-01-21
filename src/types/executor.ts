import type { Routine, ExecutorConfig } from './routine'

// Execution result
export interface ExecutionResult {
  success: boolean
  output?: string
  error?: string
  startedAt: string
  completedAt: string
  executorType: string
  // GitHub-specific fields
  issueUrl?: string
  issueNumber?: number
}

// Base executor interface
export interface Executor {
  type: string
  name: string
  description: string

  // Validate configuration
  validateConfig(config: ExecutorConfig): Promise<{ valid: boolean; errors?: string[] }>

  // Execute the routine
  execute(routine: Routine): Promise<ExecutionResult>

  // Check if executor is available
  isAvailable(): Promise<boolean>
}

// MCP Registry response
export interface MCPRegistryResponse {
  servers: MCPServerInfo[]
  cursor?: string
  total?: number
}

export interface MCPServerInfo {
  name: string
  version: string
  description: string
  repository: string
  tools: MCPTool[]
  category?: string
  author?: string
  downloads?: number
}

export interface MCPTool {
  name: string
  description: string
  inputSchema?: Record<string, unknown>
}

// GitHub Action configuration
export interface GitHubActionConfig {
  owner: string
  repo: string
  workflow: string
  branch?: string
  inputs?: Record<string, string>
}

// CLI execution configuration
export interface CLIExecutionConfig {
  command: string
  args?: string[]
  cwd?: string
  env?: Record<string, string>
  timeout?: number
}

// Code plugin configuration
export interface CodePluginConfig {
  code: string
  runtime: 'typescript' | 'javascript'
  dependencies?: string[]
}

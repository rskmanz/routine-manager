import { MCPExecutor } from './mcp-executor'
import { GitHubActionExecutor } from './github-executor'
import { CLIExecutor } from './cli-executor'
import { CodePluginExecutor } from './code-executor'
import type { ExecutorType } from '@/types'
import type { Executor } from '@/types/executor'

export { BaseExecutor } from './base-executor'
export { MCPExecutor } from './mcp-executor'
export { GitHubActionExecutor } from './github-executor'
export { CLIExecutor } from './cli-executor'
export { CodePluginExecutor } from './code-executor'

// Factory function to get executor by type
export function getExecutor(type: ExecutorType): Executor {
  switch (type) {
    case 'mcp':
      return new MCPExecutor()
    case 'github-action':
      return new GitHubActionExecutor()
    case 'cli':
      return new CLIExecutor()
    case 'code-plugin':
      return new CodePluginExecutor()
    default:
      throw new Error(`Unknown executor type: ${type}`)
  }
}

// Get all available executors
export function getAllExecutors(): Executor[] {
  return [
    new MCPExecutor(),
    new GitHubActionExecutor(),
    new CLIExecutor(),
    new CodePluginExecutor(),
  ]
}

// Executor metadata for UI
export const executorMeta: Record<ExecutorType, { name: string; description: string; icon: string }> = {
  mcp: {
    name: 'MCP Registry',
    description: 'Connect to 2000+ MCP servers (YouTube, Calendar, Slack, etc.)',
    icon: 'globe',
  },
  'github-action': {
    name: 'GitHub Action',
    description: 'Create issues that @claude implements and creates PRs',
    icon: 'github',
  },
  cli: {
    name: 'Claude CLI',
    description: 'Execute locally via claude -p in background',
    icon: 'terminal',
  },
  'code-plugin': {
    name: 'Code Plugin',
    description: 'Generate and run TypeScript plugins in-app',
    icon: 'code',
  },
}

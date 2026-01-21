import { BaseExecutor } from './base-executor'
import type { Routine, ExecutorConfig } from '@/types'
import type { ExecutionResult } from '@/types/executor'

export class MCPExecutor extends BaseExecutor {
  type = 'mcp'
  name = 'MCP Registry'
  description = 'Execute routines using MCP servers from the registry'

  async validateConfig(config: ExecutorConfig): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = []

    if (!config.mcpServer) {
      errors.push('MCP server is required')
    }

    if (!config.mcpTools || config.mcpTools.length === 0) {
      errors.push('At least one MCP tool must be selected')
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  async execute(routine: Routine): Promise<ExecutionResult> {
    const startedAt = new Date().toISOString()

    try {
      const { mcpServer, mcpTools } = routine.integration.config

      if (!mcpServer || !mcpTools) {
        return this.createResult(false, undefined, 'Invalid MCP configuration', startedAt)
      }

      // In a real implementation, this would:
      // 1. Connect to the MCP server
      // 2. Execute the selected tools with routine context
      // 3. Return the results

      // For now, simulate execution
      const output = `MCP Execution simulated for server: ${mcpServer}\nTools: ${mcpTools.join(', ')}\nRoutine blocks processed: ${routine.blocks.length}`

      return this.createResult(true, output, undefined, startedAt)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return this.createResult(false, undefined, errorMessage, startedAt)
    }
  }

  async isAvailable(): Promise<boolean> {
    // Check if MCP registry is accessible
    try {
      const response = await fetch('https://registry.modelcontextprotocol.io/v0.1/servers?limit=1')
      return response.ok
    } catch {
      return false
    }
  }
}

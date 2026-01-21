import { BaseExecutor } from './base-executor'
import type { Routine, ExecutorConfig } from '@/types'
import type { ExecutionResult } from '@/types/executor'

export class CLIExecutor extends BaseExecutor {
  type = 'cli'
  name = 'Claude CLI'
  description = 'Execute routines using Claude CLI in the background'

  async validateConfig(config: ExecutorConfig): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = []

    if (!config.cliCommand) {
      errors.push('CLI command template is required')
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  async execute(routine: Routine): Promise<ExecutionResult> {
    const startedAt = new Date().toISOString()

    try {
      const { cliCommand } = routine.integration.config

      if (!cliCommand) {
        return this.createResult(false, undefined, 'CLI command not configured', startedAt)
      }

      // Build the prompt from routine blocks
      const prompt = this.buildPrompt(routine)

      // In a real implementation, this would:
      // 1. Execute: claude -p "prompt" --json
      // 2. Capture and parse the output
      // 3. Return the results

      const output = `CLI execution simulated\n\nCommand: ${cliCommand}\n\nPrompt:\n${prompt}`

      return this.createResult(true, output, undefined, startedAt)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return this.createResult(false, undefined, errorMessage, startedAt)
    }
  }

  private buildPrompt(routine: Routine): string {
    let prompt = `Task: ${routine.title}\n\n`

    for (const block of routine.blocks) {
      switch (block.type) {
        case 'heading':
          prompt += `## ${block.content}\n\n`
          break
        case 'checklist':
          prompt += `- ${block.content}\n`
          break
        case 'trigger':
          prompt += `When: ${block.content}\n`
          break
        case 'action':
          prompt += `Do: ${block.content}\n`
          break
        default:
          prompt += `${block.content}\n\n`
      }
    }

    return prompt
  }

  async isAvailable(): Promise<boolean> {
    // In a real implementation, check if Claude CLI is installed
    // For now, assume it's available on the server
    return true
  }
}

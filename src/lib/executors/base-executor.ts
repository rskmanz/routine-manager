import type { Routine, ExecutorConfig } from '@/types'
import type { ExecutionResult, Executor } from '@/types/executor'

export abstract class BaseExecutor implements Executor {
  abstract type: string
  abstract name: string
  abstract description: string

  abstract validateConfig(config: ExecutorConfig): Promise<{ valid: boolean; errors?: string[] }>

  abstract execute(routine: Routine): Promise<ExecutionResult>

  abstract isAvailable(): Promise<boolean>

  protected createResult(
    success: boolean,
    output?: string,
    error?: string,
    startedAt?: string
  ): ExecutionResult {
    return {
      success,
      output,
      error,
      startedAt: startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      executorType: this.type,
    }
  }
}

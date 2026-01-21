'use client'

import { useState, useCallback } from 'react'
import type { ExecutionResult } from '@/types/executor'

interface ExecuteResponse {
  success: boolean
  data?: ExecutionResult
  error?: string
  details?: string[]
}

export function useExecutor() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (routineId: string) => {
    setIsExecuting(true)
    setError(null)

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routineId }),
      })

      const data: ExecuteResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Execution failed')
      }

      if (data.data) {
        setLastResult(data.data)
      }

      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setIsExecuting(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setLastResult(null)
    setError(null)
  }, [])

  return {
    execute,
    isExecuting,
    lastResult,
    error,
    clearResult,
  }
}

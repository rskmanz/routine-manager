'use client'

import { useState, useCallback } from 'react'
import type { ChatMessage, ContentBlock } from '@/types'
import { generateId } from '@/lib/utils'
import type { ToolCallResult } from '@/lib/ai/tools'

interface SourceContext {
  title: string
  content?: string
}

interface RoutineContext {
  title: string
  blocks: { type: string; content: string }[]
  sources?: SourceContext[]
}

interface AppContext {
  categories: { id: string; title: string; icon?: string }[]
  goals: { id: string; title: string; categoryId: string }[]
  routines: { id: string; title: string; goalId: string }[]
}

interface ToolHandlers {
  onCreateCategory?: (args: { title: string; icon?: string }) => Promise<{ id: string; title: string } | null>
  onCreateGoal?: (args: { title: string; description?: string; categoryId: string; icon?: string }) => Promise<{ id: string; title: string } | null>
  onCreateRoutine?: (args: { title: string; goalId: string }) => Promise<{ id: string; title: string } | null>
}

interface ChatResponse {
  success: boolean
  data?: {
    message: string
    suggestedBlocks: { type: string; content: string }[]
    toolCalls?: ToolCallResult[]
  }
  error?: string
}

interface ExecutedToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  result: { success: boolean; data?: unknown; error?: string }
}

interface ExtendedChatMessage extends ChatMessage {
  executedToolCalls?: ExecutedToolCall[]
}

interface UseChatOptions {
  routineContext?: RoutineContext
  appContext?: AppContext
  toolHandlers?: ToolHandlers
}

export function useChat(options?: UseChatOptions) {
  const { routineContext, appContext, toolHandlers } = options || {}
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeToolCall = useCallback(
    async (toolCall: ToolCallResult): Promise<ExecutedToolCall> => {
      const { toolUseId, name, input } = toolCall

      try {
        let result: { id: string; title: string } | null = null

        switch (name) {
          case 'create_category':
            if (toolHandlers?.onCreateCategory) {
              result = await toolHandlers.onCreateCategory(input as { title: string; icon?: string })
            }
            break
          case 'create_goal':
            if (toolHandlers?.onCreateGoal) {
              result = await toolHandlers.onCreateGoal(
                input as { title: string; description?: string; categoryId: string; icon?: string }
              )
            }
            break
          case 'create_routine':
            if (toolHandlers?.onCreateRoutine) {
              result = await toolHandlers.onCreateRoutine(input as { title: string; goalId: string })
            }
            break
        }

        return {
          id: toolUseId,
          name,
          input,
          result: result
            ? { success: true, data: result }
            : { success: false, error: 'No handler available' },
        }
      } catch (err) {
        return {
          id: toolUseId,
          name,
          input,
          result: {
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        }
      }
    },
    [toolHandlers]
  )

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ExtendedChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            routineContext,
            appContext,
          }),
        })

        const data: ChatResponse = await response.json()

        if (!data.success || !data.data) {
          throw new Error(data.error || 'Failed to get response')
        }

        // Execute tool calls if any
        const executedToolCalls: ExecutedToolCall[] = []
        if (data.data.toolCalls && data.data.toolCalls.length > 0) {
          for (const toolCall of data.data.toolCalls) {
            const executed = await executeToolCall(toolCall)
            executedToolCalls.push(executed)
          }
        }

        const assistantMessage: ExtendedChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date().toISOString(),
          suggestedBlocks: data.data.suggestedBlocks.map((b, i) => ({
            id: generateId(),
            type: b.type as ContentBlock['type'],
            content: b.content,
            order: i,
          })),
          executedToolCalls: executedToolCalls.length > 0 ? executedToolCalls : undefined,
        }

        setMessages((prev) => [...prev, assistantMessage])
        return assistantMessage
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [messages, routineContext, appContext, executeToolCall]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  }
}

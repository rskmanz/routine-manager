'use client'

import { useState, useCallback } from 'react'
import type { ChatMessage, ContentBlock } from '@/types'
import { generateId } from '@/lib/utils'

interface SourceContext {
  title: string
  content?: string
}

interface RoutineContext {
  title: string
  blocks: { type: string; content: string }[]
  sources?: SourceContext[]
}

interface ChatResponse {
  success: boolean
  data?: {
    message: string
    suggestedBlocks: { type: string; content: string }[]
  }
  error?: string
}

export function useChat(routineContext?: RoutineContext) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
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
          }),
        })

        const data: ChatResponse = await response.json()

        if (!data.success || !data.data) {
          throw new Error(data.error || 'Failed to get response')
        }

        const assistantMessage: ChatMessage = {
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
    [messages, routineContext]
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

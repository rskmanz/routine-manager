import { NextRequest, NextResponse } from 'next/server'
import { chat, parseBlockSuggestions, type ChatMessage, type RoutineContext, type AppContext } from '@/lib/ai'
import { z } from 'zod'

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  routineContext: z
    .object({
      title: z.string(),
      blocks: z.array(
        z.object({
          type: z.string(),
          content: z.string(),
        })
      ),
      sources: z.array(
        z.object({
          title: z.string(),
          content: z.string().optional(),
        })
      ).optional(),
    })
    .optional(),
  appContext: z
    .object({
      categories: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          icon: z.string().optional(),
        })
      ),
      goals: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          categoryId: z.string(),
        })
      ),
      routines: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          goalId: z.string(),
        })
      ),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, routineContext, appContext } = requestSchema.parse(body)

    const result = await chat(
      messages as ChatMessage[],
      routineContext as RoutineContext | undefined,
      appContext as AppContext | undefined
    )

    const suggestedBlocks = parseBlockSuggestions(result.message)

    return NextResponse.json({
      success: true,
      data: {
        message: result.message,
        suggestedBlocks,
        toolCalls: result.toolCalls,
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

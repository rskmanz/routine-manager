import { NextRequest, NextResponse } from 'next/server'
import { chat, parseBlockSuggestions, type ChatMessage, type RoutineContext } from '@/lib/ai'
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
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, routineContext } = requestSchema.parse(body)

    const response = await chat(
      messages as ChatMessage[],
      routineContext as RoutineContext | undefined
    )

    const suggestedBlocks = parseBlockSuggestions(response)

    return NextResponse.json({
      success: true,
      data: {
        message: response,
        suggestedBlocks,
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

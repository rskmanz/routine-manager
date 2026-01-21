import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getExecutor } from '@/lib/executors'
import { getRoutineById, updateRoutine } from '@/lib/storage'

const requestSchema = z.object({
  routineId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { routineId } = requestSchema.parse(body)

    const routine = getRoutineById(routineId)
    if (!routine) {
      return NextResponse.json(
        { success: false, error: 'Routine not found' },
        { status: 404 }
      )
    }

    if (!routine.integration.enabled) {
      return NextResponse.json(
        { success: false, error: 'Integration is not enabled for this routine' },
        { status: 400 }
      )
    }

    const executor = getExecutor(routine.integration.executorType)

    // Validate configuration
    const validation = await executor.validateConfig(routine.integration.config)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid configuration', details: validation.errors },
        { status: 400 }
      )
    }

    // Check availability
    const isAvailable = await executor.isAvailable()
    if (!isAvailable) {
      return NextResponse.json(
        { success: false, error: `${executor.name} is not available` },
        { status: 503 }
      )
    }

    // Execute
    const result = await executor.execute(routine)

    // Update routine with last run info
    updateRoutine(routineId, {
      integration: {
        ...routine.integration,
        lastRun: result.completedAt,
        lastResult: result.success ? 'success' : 'failure',
      },
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Execute API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to execute routine' },
      { status: 500 }
    )
  }
}

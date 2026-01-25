import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import * as tursoStorage from '@/lib/turso/storage'
import { migrateDataToUser } from '@/lib/turso/schema'

export async function GET(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const type = url.searchParams.get('type')

  try {
    switch (type) {
      case 'categories':
        const categories = await tursoStorage.getCategories(userId)
        return NextResponse.json(categories)

      case 'goals':
        const categoryId = url.searchParams.get('categoryId')
        const goals = categoryId
          ? await tursoStorage.getGoalsByCategory(categoryId, userId)
          : await tursoStorage.getGoals(userId)
        return NextResponse.json(goals)

      case 'routines':
        const goalId = url.searchParams.get('goalId')
        const routines = goalId
          ? await tursoStorage.getRoutinesByGoal(goalId, userId)
          : await tursoStorage.getRoutines(userId)
        return NextResponse.json(routines)

      case 'routine':
        const routineId = url.searchParams.get('id')
        if (!routineId) {
          return NextResponse.json({ error: 'Missing id' }, { status: 400 })
        }
        const routine = await tursoStorage.getRoutineById(routineId, userId)
        return NextResponse.json(routine || null)

      case 'completions':
        const completions = await tursoStorage.getCompletions(userId)
        return NextResponse.json(completions)

      case 'completionsInRange':
        const startDate = url.searchParams.get('startDate')
        const endDate = url.searchParams.get('endDate')
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'Missing dates' }, { status: 400 })
        }
        const rangeCompletions = await tursoStorage.getCompletionsInRange(startDate, endDate, userId)
        return NextResponse.json(rangeCompletions)

      case 'all':
        const [allCategories, allGoals, allRoutines, allCompletions] = await Promise.all([
          tursoStorage.getCategories(userId),
          tursoStorage.getGoals(userId),
          tursoStorage.getRoutines(userId),
          tursoStorage.getCompletions(userId),
        ])
        return NextResponse.json({
          categories: allCategories,
          goals: allGoals,
          routines: allRoutines,
          completions: allCompletions,
        })

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { type, data } = await request.json()

    switch (type) {
      case 'category':
        const newCategory = await tursoStorage.createCategory(data, userId)
        return NextResponse.json(newCategory)

      case 'goal':
        const newGoal = await tursoStorage.createGoal(data, userId)
        return NextResponse.json(newGoal)

      case 'routine':
        const newRoutine = await tursoStorage.createRoutine(data, userId)
        return NextResponse.json(newRoutine)

      case 'completion':
        const newCompletion = await tursoStorage.createCompletion(data, userId)
        return NextResponse.json(newCompletion)

      case 'migrate':
        const result = await migrateDataToUser(userId)
        return NextResponse.json(result)

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { type, id, data } = await request.json()

    switch (type) {
      case 'category':
        const updatedCategory = await tursoStorage.updateCategory(id, data, userId)
        return NextResponse.json(updatedCategory)

      case 'goal':
        const updatedGoal = await tursoStorage.updateGoal(id, data, userId)
        return NextResponse.json(updatedGoal)

      case 'routine':
        const updatedRoutine = await tursoStorage.updateRoutine(id, data, userId)
        return NextResponse.json(updatedRoutine)

      case 'completion':
        const updatedCompletion = await tursoStorage.updateCompletion(id, data, userId)
        return NextResponse.json(updatedCompletion)

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const type = url.searchParams.get('type')
  const id = url.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  try {
    switch (type) {
      case 'category':
        const categoryDeleted = await tursoStorage.deleteCategory(id, userId)
        return NextResponse.json({ success: categoryDeleted })

      case 'goal':
        const goalDeleted = await tursoStorage.deleteGoal(id, userId)
        return NextResponse.json({ success: goalDeleted })

      case 'routine':
        const routineDeleted = await tursoStorage.deleteRoutine(id, userId)
        return NextResponse.json({ success: routineDeleted })

      case 'completion':
        const completionDeleted = await tursoStorage.deleteCompletion(id, userId)
        return NextResponse.json({ success: completionDeleted })

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

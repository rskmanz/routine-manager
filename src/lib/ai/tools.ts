// AI Tool Definitions for Anthropic Claude
// These tools allow the AI to create categories, goals, and routines

import type { Tool } from '@anthropic-ai/sdk/resources/messages'

export const AI_TOOLS: Tool[] = [
  {
    name: 'create_category',
    description: 'Create a new category for organizing goals and routines. Use this when the user asks to create a category or needs a new organizational group.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: 'The name of the category (e.g., "Health & Fitness", "Work", "Personal Development")',
        },
        icon: {
          type: 'string',
          description: 'Icon name from Lucide icons (e.g., "Briefcase", "Heart", "Star", "Book", "Dumbbell"). Default is "Folder"',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'create_goal',
    description: 'Create a new goal within a category. Use this when the user wants to add a goal or objective.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: 'The name of the goal (e.g., "Learn Japanese", "Lose 10kg", "Read 20 books")',
        },
        description: {
          type: 'string',
          description: 'A brief description of the goal and what success looks like',
        },
        categoryId: {
          type: 'string',
          description: 'The ID of the category to add this goal to. Required.',
        },
        icon: {
          type: 'string',
          description: 'An emoji icon for the goal (e.g., "🎯", "💪", "📚")',
        },
      },
      required: ['title', 'categoryId'],
    },
  },
  {
    name: 'create_routine',
    description: 'Create a new routine for achieving a goal. Use this when the user wants to establish a new habit or routine.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: 'The name of the routine (e.g., "Morning Workout", "Daily Reading", "Weekly Review")',
        },
        goalId: {
          type: 'string',
          description: 'The ID of the goal this routine supports. Required.',
        },
      },
      required: ['title', 'goalId'],
    },
  },
]

// Tool call result types
export interface ToolCallResult {
  toolUseId: string
  name: string
  input: Record<string, unknown>
}

// Helper to get action text for UI display
export function getToolActionText(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case 'create_category':
      return `カテゴリ「${args.title}」を作成しました`
    case 'create_goal':
      return `ゴール「${args.title}」を作成しました`
    case 'create_routine':
      return `ルーティン「${args.title}」を作成しました`
    default:
      return `${name} を実行しました`
  }
}

import Anthropic from '@anthropic-ai/sdk'
import { AI_TOOLS, type ToolCallResult } from './tools'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface SourceContext {
  title: string
  content?: string
}

export interface RoutineContext {
  title: string
  blocks: { type: string; content: string }[]
  sources?: SourceContext[]
}

export interface AppContext {
  categories: { id: string; title: string; icon?: string }[]
  goals: { id: string; title: string; categoryId: string }[]
  routines: { id: string; title: string; goalId: string }[]
}

export interface ChatResult {
  message: string
  toolCalls: ToolCallResult[]
}

const SYSTEM_PROMPT = `You are an AI assistant helping users create and manage their personal routines.

Your capabilities:
1. Suggest content for routine blocks (text, headings, checklists, triggers, actions)
2. Help organize and structure routines
3. Recommend automation strategies using different executors (MCP servers, GitHub Actions, CLI commands, code plugins)
4. Provide tips for habit formation and routine optimization
5. **CREATE categories, goals, and routines using the available tools**

IMPORTANT TOOL USAGE:
- When the user asks to create a category, goal, or routine, USE THE APPROPRIATE TOOL to create it.
- For create_goal: You must provide a valid categoryId. If no category exists, create one first.
- For create_routine: You must provide a valid goalId. If no goal exists, create one first.
- Always explain what you created after using a tool.

When suggesting blocks, format them as:
[BLOCK:type]
content here
[/BLOCK]

Where type can be: text, heading, checklist, trigger, action

Be concise and helpful. Focus on practical, actionable suggestions.`

export async function chat(
  messages: ChatMessage[],
  routineContext?: RoutineContext,
  appContext?: AppContext
): Promise<ChatResult> {
  let systemPrompt = SYSTEM_PROMPT

  // Add app context (available categories, goals, routines)
  if (appContext) {
    systemPrompt += `\n\n## Available Data\n`
    if (appContext.categories.length > 0) {
      systemPrompt += `Categories:\n${appContext.categories.map(c => `- ${c.title} (id: ${c.id})`).join('\n')}\n\n`
    } else {
      systemPrompt += `No categories exist yet. Create one first before creating goals.\n\n`
    }
    if (appContext.goals.length > 0) {
      systemPrompt += `Goals:\n${appContext.goals.map(g => `- ${g.title} (id: ${g.id}, categoryId: ${g.categoryId})`).join('\n')}\n\n`
    }
    if (appContext.routines.length > 0) {
      systemPrompt += `Routines:\n${appContext.routines.map(r => `- ${r.title} (id: ${r.id}, goalId: ${r.goalId})`).join('\n')}\n`
    }
  }

  if (routineContext) {
    systemPrompt += `\n\nCurrent routine context:
Title: ${routineContext.title}
Blocks: ${JSON.stringify(routineContext.blocks, null, 2)}`

    // Add sources if available (NotebookLM-style)
    if (routineContext.sources && routineContext.sources.length > 0) {
      systemPrompt += `\n\n## Reference Sources\nThe user has provided the following sources for context. Use these to inform your suggestions:\n`
      routineContext.sources.forEach((source, index) => {
        systemPrompt += `\n### Source ${index + 1}: ${source.title}\n`
        if (source.content) {
          // Limit content length to prevent token overflow
          const truncatedContent = source.content.slice(0, 3000)
          systemPrompt += truncatedContent
          if (source.content.length > 3000) {
            systemPrompt += '\n[Content truncated...]'
          }
        }
        systemPrompt += '\n'
      })
    }
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    tools: AI_TOOLS,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  // Extract text content and tool calls
  let message = ''
  const toolCalls: ToolCallResult[] = []

  for (const block of response.content) {
    if (block.type === 'text') {
      message += block.text
    } else if (block.type === 'tool_use') {
      toolCalls.push({
        toolUseId: block.id,
        name: block.name,
        input: block.input as Record<string, unknown>,
      })
    }
  }

  return { message, toolCalls }
}

// Legacy function for backward compatibility
export async function chatSimple(
  messages: ChatMessage[],
  routineContext?: RoutineContext
): Promise<string> {
  const result = await chat(messages, routineContext)
  return result.message
}

export function parseBlockSuggestions(text: string): { type: string; content: string }[] {
  const blockRegex = /\[BLOCK:(\w+)\]([\s\S]*?)\[\/BLOCK\]/g
  const blocks: { type: string; content: string }[] = []

  let match
  while ((match = blockRegex.exec(text)) !== null) {
    blocks.push({
      type: match[1],
      content: match[2].trim(),
    })
  }

  return blocks
}

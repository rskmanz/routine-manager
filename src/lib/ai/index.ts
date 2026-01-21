import Anthropic from '@anthropic-ai/sdk'

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

const SYSTEM_PROMPT = `You are an AI assistant helping users create and manage their personal routines.

Your capabilities:
1. Suggest content for routine blocks (text, headings, checklists, triggers, actions)
2. Help organize and structure routines
3. Recommend automation strategies using different executors (MCP servers, GitHub Actions, CLI commands, code plugins)
4. Provide tips for habit formation and routine optimization

When suggesting blocks, format them as:
[BLOCK:type]
content here
[/BLOCK]

Where type can be: text, heading, checklist, trigger, action

Be concise and helpful. Focus on practical, actionable suggestions.`

export async function chat(
  messages: ChatMessage[],
  routineContext?: RoutineContext
): Promise<string> {
  let systemPrompt = SYSTEM_PROMPT

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
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock ? textBlock.text : ''
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

// AI Response Parser
// Detects create suggestions from AI responses

export interface CreateSuggestion {
  type: 'category' | 'goal' | 'routine'
  data: {
    title: string
    description?: string
    categoryId?: string
    goalId?: string
    icon?: string
  }
}

// Patterns to detect creation suggestions in AI responses
const PATTERNS = {
  category: [
    /「(.+?)」(?:という|という名前の)?カテゴリ(?:を作成|を追加)/,
    /カテゴリ[「『](.+?)[」』](?:を作成|を追加)/,
    /create (?:a )?(?:new )?category[:\s]+[「『"]?(.+?)[」』"]?/i,
    /new category[:\s]+[「『"]?(.+?)[」』"]?/i,
  ],
  goal: [
    /「(.+?)」(?:という|という名前の)?ゴール(?:を作成|を追加)/,
    /ゴール[「『](.+?)[」』](?:を作成|を追加)/,
    /create (?:a )?(?:new )?goal[:\s]+[「『"]?(.+?)[」』"]?/i,
    /new goal[:\s]+[「『"]?(.+?)[」』"]?/i,
  ],
  routine: [
    /「(.+?)」(?:という|という名前の)?ルーティン(?:を作成|を追加)/,
    /ルーティン[「『](.+?)[」』](?:を作成|を追加)/,
    /create (?:a )?(?:new )?routine[:\s]+[「『"]?(.+?)[」』"]?/i,
    /new routine[:\s]+[「『"]?(.+?)[」』"]?/i,
  ],
}

/**
 * Parse AI response content to detect creation suggestions
 */
export function parseCreateSuggestion(content: string): CreateSuggestion | null {
  // Check for category suggestions
  for (const pattern of PATTERNS.category) {
    const match = content.match(pattern)
    if (match) {
      return {
        type: 'category',
        data: {
          title: match[1].trim(),
        },
      }
    }
  }

  // Check for goal suggestions
  for (const pattern of PATTERNS.goal) {
    const match = content.match(pattern)
    if (match) {
      return {
        type: 'goal',
        data: {
          title: match[1].trim(),
        },
      }
    }
  }

  // Check for routine suggestions
  for (const pattern of PATTERNS.routine) {
    const match = content.match(pattern)
    if (match) {
      return {
        type: 'routine',
        data: {
          title: match[1].trim(),
        },
      }
    }
  }

  return null
}

/**
 * Parse multiple suggestions from a single response
 */
export function parseAllSuggestions(content: string): CreateSuggestion[] {
  const suggestions: CreateSuggestion[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    const suggestion = parseCreateSuggestion(line)
    if (suggestion) {
      suggestions.push(suggestion)
    }
  }

  // Remove duplicates by title
  const seen = new Set<string>()
  return suggestions.filter((s) => {
    const key = `${s.type}:${s.data.title}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Check if content contains any actionable suggestions
 */
export function hasCreateSuggestion(content: string): boolean {
  return parseCreateSuggestion(content) !== null
}

/**
 * Extract a description from the AI response if available
 */
export function extractDescription(content: string, title: string): string | undefined {
  // Look for description patterns near the title
  const patterns = [
    new RegExp(`${title}[：:][\\s]*(.+?)(?:\\n|$)`, 'i'),
    new RegExp(`${title}は(.+?)(?:です|。|\\n|$)`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      const desc = match[1].trim()
      if (desc.length > 5 && desc.length < 200) {
        return desc
      }
    }
  }

  return undefined
}

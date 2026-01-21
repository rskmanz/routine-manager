import type { MCPRegistryResponse, MCPServerInfo } from '@/types/executor'

const MCP_REGISTRY_BASE_URL = 'https://registry.modelcontextprotocol.io/v0.1'

export interface MCPSearchOptions {
  search?: string
  limit?: number
  cursor?: string
  category?: string
}

export async function searchMCPServers(
  options: MCPSearchOptions = {}
): Promise<MCPRegistryResponse> {
  const { search, limit = 20, cursor, category } = options

  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (limit) params.set('limit', limit.toString())
  if (cursor) params.set('cursor', cursor)
  if (category) params.set('category', category)

  const url = `${MCP_REGISTRY_BASE_URL}/servers?${params.toString()}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch MCP servers: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    servers: data.servers || [],
    cursor: data.cursor,
    total: data.total,
  }
}

export async function getMCPServer(name: string): Promise<MCPServerInfo | null> {
  try {
    const response = await fetch(`${MCP_REGISTRY_BASE_URL}/servers/${encodeURIComponent(name)}`)

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to fetch MCP server: ${response.statusText}`)
    }

    return await response.json()
  } catch {
    return null
  }
}

// Popular MCP server categories
export const MCP_CATEGORIES = [
  'productivity',
  'developer-tools',
  'media',
  'communication',
  'data',
  'ai-ml',
  'utilities',
] as const

// Recommended MCP servers for routine automation
export const RECOMMENDED_SERVERS = [
  {
    name: 'youtube',
    description: 'Search and fetch YouTube video information',
    useCase: 'Learning routines, content consumption',
  },
  {
    name: 'google-calendar',
    description: 'Manage Google Calendar events',
    useCase: 'Schedule management, time blocking',
  },
  {
    name: 'slack',
    description: 'Send and receive Slack messages',
    useCase: 'Team communication, notifications',
  },
  {
    name: 'notion',
    description: 'Interact with Notion databases and pages',
    useCase: 'Documentation, note-taking',
  },
  {
    name: 'github',
    description: 'GitHub repository operations',
    useCase: 'Development workflows, code management',
  },
] as const

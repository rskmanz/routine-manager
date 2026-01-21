import { NextRequest, NextResponse } from 'next/server'
import { searchMCPServers, getMCPServer } from '@/lib/mcp/registry'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const limit = searchParams.get('limit')
    const cursor = searchParams.get('cursor') || undefined
    const name = searchParams.get('name')

    // If name is provided, fetch single server
    if (name) {
      const server = await getMCPServer(name)
      if (!server) {
        return NextResponse.json(
          { success: false, error: 'Server not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: server })
    }

    // Otherwise, search servers
    const result = await searchMCPServers({
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('MCP API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch MCP servers' },
      { status: 500 }
    )
  }
}

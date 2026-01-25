import { createClient, Client } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

export const turso: Client | null = url
  ? createClient({ url, authToken })
  : null

export function isTursoConfigured(): boolean {
  return turso !== null
}

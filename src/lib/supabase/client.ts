import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

// Create Supabase client (will be null if not configured)
// Using 'any' for database type to avoid strict typing issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient<any> | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null

// Helper to check if we should use Supabase or localStorage
export function useSupabase(): boolean {
  return isSupabaseConfigured && supabase !== null
}

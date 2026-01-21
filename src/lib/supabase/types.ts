// Supabase Database Types
// These types match the SQL schema defined in the plan

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          title: string
          icon: string | null
          color_pattern: string | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          icon?: string | null
          color_pattern?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          icon?: string | null
          color_pattern?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          title: string
          description: string | null
          icon: string | null
          color: string | null
          category_id: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          icon?: string | null
          color?: string | null
          category_id: string
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          category_id?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      routines: {
        Row: {
          id: string
          title: string
          goal_id: string
          blocks: unknown[]
          sources: unknown[]
          status: string
          integration: unknown
          schedule: unknown | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          goal_id: string
          blocks?: unknown[]
          sources?: unknown[]
          status?: string
          integration?: unknown
          schedule?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          goal_id?: string
          blocks?: unknown[]
          sources?: unknown[]
          status?: string
          integration?: unknown
          schedule?: unknown | null
          created_at?: string
          updated_at?: string
        }
      }
      completions: {
        Row: {
          id: string
          routine_id: string
          scheduled_date: string
          completed_at: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          routine_id: string
          scheduled_date: string
          completed_at?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          routine_id?: string
          scheduled_date?: string
          completed_at?: string | null
          status?: string
          created_at?: string
        }
      }
    }
  }
}

// Helper type to convert Supabase row to app types
export type CategoryRow = Database['public']['Tables']['categories']['Row']
export type GoalRow = Database['public']['Tables']['goals']['Row']
export type RoutineRow = Database['public']['Tables']['routines']['Row']
export type CompletionRow = Database['public']['Tables']['completions']['Row']

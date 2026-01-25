import { turso } from './client'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  icon TEXT DEFAULT 'Folder',
  color_pattern TEXT DEFAULT 'rainbow',
  "order" INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '',
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  goal_id TEXT REFERENCES goals(id) ON DELETE CASCADE,
  blocks TEXT DEFAULT '[]',
  sources TEXT DEFAULT '[]',
  tasks TEXT DEFAULT '[]',
  status TEXT DEFAULT 'active',
  integration TEXT DEFAULT '{"enabled":false}',
  schedule TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS completions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  routine_id TEXT REFERENCES routines(id) ON DELETE CASCADE,
  scheduled_date TEXT NOT NULL,
  completed_at TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`

const MIGRATION_ADD_USER_ID = `
ALTER TABLE categories ADD COLUMN user_id TEXT;
ALTER TABLE goals ADD COLUMN user_id TEXT;
ALTER TABLE routines ADD COLUMN user_id TEXT;
ALTER TABLE completions ADD COLUMN user_id TEXT;
`

let initialized = false

export async function initializeSchema(): Promise<void> {
  if (initialized || !turso) return

  const statements = SCHEMA.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  for (const statement of statements) {
    await turso.execute(statement)
  }

  // Try to add user_id columns if they don't exist (migration for existing tables)
  await migrateAddUserIdColumns()

  initialized = true
}

async function migrateAddUserIdColumns(): Promise<void> {
  if (!turso) return

  const tables = ['categories', 'goals', 'routines', 'completions']

  for (const table of tables) {
    try {
      // Check if user_id column exists
      const result = await turso.execute(`PRAGMA table_info(${table})`)
      const hasUserId = result.rows.some(row => row.name === 'user_id')

      if (!hasUserId) {
        await turso.execute(`ALTER TABLE ${table} ADD COLUMN user_id TEXT`)
      }
    } catch {
      // Column might already exist, ignore error
    }
  }
}

export async function migrateDataToUser(userId: string): Promise<{ migrated: number }> {
  if (!turso) throw new Error('Turso not configured')

  let totalMigrated = 0

  // Update all records without user_id to the specified user
  const tables = ['categories', 'goals', 'routines', 'completions']

  for (const table of tables) {
    const result = await turso.execute({
      sql: `UPDATE ${table} SET user_id = ? WHERE user_id IS NULL OR user_id = ''`,
      args: [userId],
    })
    totalMigrated += result.rowsAffected
  }

  return { migrated: totalMigrated }
}

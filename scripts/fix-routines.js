const { createClient } = require('@libsql/client');

const turso = createClient({
  url: 'libsql://routine-rskman.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjkzMzQ3OTgsImlkIjoiZGQzOWUyMGUtNzAzOS00YTAyLWIxMGQtY2RhMDNkNmJlMzdhIiwicmlkIjoiNTM1MmI5NjQtYjE2NC00Njk5LTgxZGYtZWMxZTBmOGJjN2ExIn0.fpZ9fiO8tkLRk2E5gM4186vilB2fwk9HoabG_or-GAdkO3gUHL09mXwdTfaRlpLD2mAr5hwWfA23f8DmY-MaBg'
});

async function fixRoutines() {
  // Goal IDs from the database
  const goalIds = {
    rejob: 'd8a0c6b5-a07a-41a6-9834-66fd77f02b95',
    osushi: 'cedde380-6c4a-428d-9219-b91f9af82307',
    delightX: '35021e31-20a1-4967-af18-34a443080e97',
    bayond: '7c327084-0647-4718-ac46-36bba87e0809',
    hanryo: '89867d6f-8059-4294-be9a-c08d48be2a1d'
  };

  // Based on user's structure:
  // - rejob → Daily Work
  // - Osushi → Daily Work (with tasks: Teams, Test with bulk update)
  // - Delight X → Weekly Report
  // - Bayond → Myond (with tasks: Website, Pitch)
  // - HanRyo → Daily Work

  // Delete all existing routines and create new ones
  console.log('Deleting old routines...');
  await turso.execute('DELETE FROM routines');

  const now = new Date().toISOString();
  const routines = [
    {
      id: crypto.randomUUID(),
      title: 'Daily Work',
      goalId: goalIds.rejob,
      schedule: JSON.stringify({ frequency: 'daily', enabled: true, reminderTime: '09:00' }),
      tasks: JSON.stringify([])
    },
    {
      id: crypto.randomUUID(),
      title: 'Daily Work',
      goalId: goalIds.osushi,
      schedule: JSON.stringify({ frequency: 'daily', enabled: true, reminderTime: '09:00' }),
      tasks: JSON.stringify([
        { id: 'task-1', title: 'Teams', completed: false },
        { id: 'task-2', title: 'Test with bulk update', completed: false }
      ])
    },
    {
      id: crypto.randomUUID(),
      title: 'Weekly Report',
      goalId: goalIds.delightX,
      schedule: JSON.stringify({ frequency: 'weekly', enabled: true, daysOfWeek: ['mon'], reminderTime: '09:00' }),
      tasks: JSON.stringify([])
    },
    {
      id: crypto.randomUUID(),
      title: 'Myond',
      goalId: goalIds.bayond,
      schedule: JSON.stringify({ frequency: 'daily', enabled: true, reminderTime: '09:00' }),
      tasks: JSON.stringify([
        { id: 'task-3', title: 'Website', completed: false },
        { id: 'task-4', title: 'Pitch', completed: false }
      ])
    },
    {
      id: crypto.randomUUID(),
      title: 'Daily Work',
      goalId: goalIds.hanryo,
      schedule: JSON.stringify({ frequency: 'daily', enabled: true, reminderTime: '09:00' }),
      tasks: JSON.stringify([])
    }
  ];

  console.log('Creating new routines...');
  for (const routine of routines) {
    await turso.execute({
      sql: `INSERT INTO routines (id, title, goal_id, blocks, sources, tasks, status, integration, schedule, created_at, updated_at)
            VALUES (?, ?, ?, '[]', '[]', ?, 'active', '{"enabled":false}', ?, ?, ?)`,
      args: [routine.id, routine.title, routine.goalId, routine.tasks, routine.schedule, now, now]
    });
    console.log(`Created: ${routine.title} -> goal ${routine.goalId}`);
  }

  // Verify
  console.log('\nVerifying...');
  const result = await turso.execute(`
    SELECT r.title as routine, g.title as goal
    FROM routines r
    JOIN goals g ON r.goal_id = g.id
  `);
  console.log('Routines with goals:');
  for (const row of result.rows) {
    console.log(`  ${row.goal} -> ${row.routine}`);
  }

  console.log('\nDone!');
}

fixRoutines().catch(console.error);

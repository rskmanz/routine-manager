const { createClient } = require('@libsql/client');

const turso = createClient({
  url: 'libsql://routine-rskman.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjkzMzQ3OTgsImlkIjoiZGQzOWUyMGUtNzAzOS00YTAyLWIxMGQtY2RhMDNkNmJlMzdhIiwicmlkIjoiNTM1MmI5NjQtYjE2NC00Njk5LTgxZGYtZWMxZTBmOGJjN2ExIn0.fpZ9fiO8tkLRk2E5gM4186vilB2fwk9HoabG_or-GAdkO3gUHL09mXwdTfaRlpLD2mAr5hwWfA23f8DmY-MaBg'
});

async function fixRelationships() {
  // Category IDs (from export)
  const categories = {
    sideProjects: '8babcae0-526f-43c0-aa27-d0551e3f1f16',
    vcs: '8a30155c-6c77-4e12-95e4-1bc770cf316d',
    main: '7f747ed4-3538-4b53-9d42-8eca1526ad8d'
  };

  // Fix goals - update categoryId to match existing categories
  const goalUpdates = [
    { title: 'rejob', categoryId: categories.sideProjects },
    { title: 'Osushi', categoryId: categories.sideProjects },
    { title: 'Founder University', categoryId: categories.vcs },
    { title: 'Delight X', categoryId: categories.vcs },
    { title: 'Bayond', categoryId: categories.main },
    { title: 'HanRyo', categoryId: categories.main }
  ];

  console.log('Fixing goal categoryIds...');
  for (const { title, categoryId } of goalUpdates) {
    const result = await turso.execute({
      sql: 'UPDATE goals SET category_id = ? WHERE title = ?',
      args: [categoryId, title]
    });
    console.log(`Updated ${title}: ${result.rowsAffected} rows`);
  }

  // Get updated goals to get their IDs
  console.log('\nFetching goals...');
  const goalsResult = await turso.execute('SELECT id, title, category_id FROM goals');
  console.log('Goals:', goalsResult.rows);

  // Create a map of goal titles to IDs
  const goalIds = {};
  for (const row of goalsResult.rows) {
    goalIds[row.title] = row.id;
  }

  // Fix routines - update goalId to match existing goals
  const routineUpdates = [
    { title: 'Daily Work', goalTitle: 'rejob' }, // First Daily Work -> rejob
    { title: 'Myond', goalTitle: 'Bayond' },
  ];

  console.log('\nFixing routine goalIds...');

  // Update routines based on expected mapping
  // Daily Work routines -> various goals
  // Let's check what routines exist and fix them

  const routinesResult = await turso.execute('SELECT id, title, goal_id FROM routines');
  console.log('Routines:', routinesResult.rows);

  console.log('\nDone!');
}

fixRelationships().catch(console.error);

import { calculateAlgorithmS } from '../src/lib/engine';
import { prisma } from '../src/lib/prisma';

async function testEngine() {
  console.log('--- STARTING ALGORITHM S TEST ---');

  // 1. Get a sample task and user from the DB (seeded data)
  const task = await prisma.task.findFirst({
    where: { status: 'OPEN' },
    include: { requester: true }
  });

  const user = await prisma.user.findFirst({
    where: { role: 'PLAYER' }
  });

  if (!task || !user) {
    console.error('No test data found in DB. Please run init-db first.');
    return;
  }

  console.log(`Testing with Task: "${task.title}" and User: "${user.anonymousName}"`);

  try {
    // 2. Execute calculation with various scenarios
    const results = await calculateAlgorithmS({
      taskId: task.id,
      userId: user.id,
      requesterId: task.requesterId,
      actualHours: 2,
      expenses: 0,
      rating: 5 // Perfect Score
    });

    console.log('--- TEST RESULTS ---');
    console.log('Final Score:', results.finalScore);
    console.log('Multipliers:', JSON.stringify(results.factors, null, 2));

    // Basic assertion
    if (results.finalScore > 0 && results.factors.Wu > 0) {
      console.log('✅ TEST PASSED: Algorithm produced valid score and factors.');
    } else {
      console.warn('⚠️ TEST WARNING: Scores are 0 or negative. Check logic.');
    }

  } catch (error: any) {
    console.error('❌ TEST FAILED:', error.message);
  } finally {
    process.exit(0);
  }
}

testEngine();

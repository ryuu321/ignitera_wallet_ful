/**
 * Restored Seeding Script for High Fidelity Commit 16e6271
 * Ensures the system starts with data compatible with the old field names.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Cleaning up existing records...');
    await prisma.transaction.deleteMany({});
    await prisma.bid.deleteMany({});
    await prisma.taskMessage.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.skillMaster.deleteMany({});

    console.log('Seeding initial operators...');
    const users = await Promise.all([
      prisma.user.create({
        data: {
          anonymousName: 'Vortex-Lead-99',
          role: 'ADMIN', rank: 'A',
          monthlyScore: 0, totalScore: 120.5,
          balanceFlow: 5000, balanceStock: 2500, balanceIgn: 1000,
          skills: '["Leadership", "Architecture"]'
        }
      }),
      prisma.user.create({
        data: {
          anonymousName: 'Shadow-Mover-01',
          role: 'PLAYER', rank: 'Z',
          monthlyScore: 0, totalScore: 45.2,
          balanceFlow: 1000, balanceStock: 300, balanceIgn: 200,
          skills: '["Execution"]'
        }
      }),
      prisma.user.create({
        data: {
          anonymousName: 'Nova-Logic-X',
          role: 'PLAYER', rank: 'C',
          monthlyScore: 0, totalScore: 88.5,
          balanceFlow: 1200, balanceStock: 450, balanceIgn: 400,
          skills: '["Logic", "Design"]'
        }
      }),
    ]);

    console.log(`Seeded ${users.length} stable users.`);

    console.log('Seeding initial mission...');
    await prisma.task.create({
      data: {
        title: 'High Fidelity System Bootstrap',
        description: 'Syncing S-Score Engine with stable High-Fidelity UI.',
        baseReward: 450,
        requesterId: users[0].id,
        status: 'OPEN',
        tags: '["System", "Restoration"]'
      }
    });

    console.log('System ready.');
  } catch (err) {
    console.error('SEED FAILED:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

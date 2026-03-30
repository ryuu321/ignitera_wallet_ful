import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if we already have users
    const userCount = await prisma.user.count();
    if (userCount > 0) return NextResponse.json({ message: 'DB already initialized' });

    // Seed mock users
    const usersData = [
      { 
        anonymousName: 'Vortex-Lead-99', 
        role: 'MANAGER', 
        skills: JSON.stringify(['Management', 'Strategy', 'Economy']),
        balanceFlow: 5000,
        balanceStock: 1200,
        evaluationScore: 94.2
      },
      { 
        anonymousName: 'Shadow-Mover-01', 
        role: 'PLAYER', 
        skills: JSON.stringify(['AI Research', 'Python', 'Neural-Link']),
        balanceFlow: 800,
        balanceStock: 450,
        evaluationScore: 88.5
      },
      { 
        anonymousName: 'Nova-Logic-X', 
        role: 'PLAYER', 
        skills: JSON.stringify(['UI/UX', 'Framer-Motion', 'React']),
        balanceFlow: 1200,
        balanceStock: 890,
        evaluationScore: 72.3
      },
    ];

    const [manager, u1, u2] = await Promise.all(
      usersData.map(data => prisma.user.create({ data }))
    );

    // Seed mock tasks
    const t1 = await prisma.task.create({
      data: {
        title: 'Backend API Implementation',
        description: 'Design and implement REST endpoints for Task management.',
        requesterId: manager.id,
        baseReward: 500,
        status: 'OPEN'
      }
    });

    const t2 = await prisma.task.create({
      data: {
        title: 'Mobile UI Prototyping',
        description: 'Create a Flutter-like UI mockup for the mobile marketplace.',
        requesterId: manager.id,
        baseReward: 350,
        status: 'BIDDING'
      }
    });

    // Seed Bids
    await prisma.bid.create({
      data: {
        taskId: t2.id,
        bidderId: u1.id,
        amount: 320,
        message: 'Experienced with high-fidelity React prototyping.',
        status: 'PENDING'
      }
    });

    await prisma.bid.create({
      data: {
        taskId: t2.id,
        bidderId: u2.id,
        amount: 380,
        message: 'Full-stack approach with design skills.',
        status: 'PENDING'
      }
    });

    // Seed a completed transaction for history
    await prisma.transaction.create({
        data: {
            fromUserId: manager.id,
            toUserId: u1.id,
            amount: 400,
            type: 'PAYMENT',
            wu: 1.45,
            wd: 0.84,
            pc: 1.0,
            q: 0.9,
            ac: 1.0,
            finalScore: 400 * 1.45 * 0.84 * 1.0 * 0.9 * 1.0
        }
    });

    return NextResponse.json({ message: 'DB initialized successfully with full bidding lifecycle' });
  } catch (error: any) {
    console.error('DATABASE_CONNECTION_ERROR:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

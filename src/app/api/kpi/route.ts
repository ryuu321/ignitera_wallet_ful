import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const taskCount = await prisma.task.count();
    const completedTasks = await prisma.task.count({ where: { status: 'COMPLETED' } });
    
    // In a real app, circulation would be the sum of recent transactions
    const transactions = await prisma.transaction.findMany({
      where: { timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    });
    
    const circulation = transactions.reduce((acc: number, t: any) => acc + t.amount, 0);
    
    // Sample distribution of scores
    const users = await prisma.user.findMany({
       select: { evaluationScore: true }
    });
    
    const scores = users.map((u: any) => u.evaluationScore);
    const sTier = scores.filter((s: number) => s >= 90).length;
    const aTier = scores.filter((s: number) => s >= 80 && s < 90).length;
    const bTier = scores.filter((s: number) => s >= 70 && s < 80).length;
    const cTier = scores.filter((s: number) => s < 70).length;

    const recentTx = await prisma.transaction.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { toUser: { select: { anonymousName: true } } }
    });

    return NextResponse.json({
      circulationVolume: circulation,
      completionRate: taskCount > 0 ? (completedTasks / taskCount) * 100 : 0,
      dispersion: 0.84, 
      qualityDistribution: [sTier, aTier, bTier, cTier],
      weeklyCirculation: [120, 150, 130, 180, 200, 170, 210],
      transactions: recentTx
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch KPI data' }, { status: 500 });
  }
}

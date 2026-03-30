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
      take: 30,
      orderBy: { timestamp: 'desc' },
      include: { 
        toUser: { select: { anonymousName: true } } as any,
        fromUser: { select: { anonymousName: true } } as any 
      }
    });

    const avgAc = await (prisma.transaction.aggregate({ _avg: { ac: true } as any }) as any);
    const avgWu = await (prisma.transaction.aggregate({ _avg: { wu: true } as any }) as any);
    const avgEb = await (prisma.transaction.aggregate({ _avg: { eb: true } as any }) as any);

    // Grouping for "Volume by Role" Chart
    const roles = ['ADMIN', 'PLAYER', 'MANAGER', 'LEADER'];
    const roleVolume = await Promise.all(roles.map(async (role) => {
      const sum = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { toUser: { role: role } as any }
      });
      return sum._sum.amount || 0;
    }));

    return NextResponse.json({
      circulationVolume: circulation,
      completionRate: taskCount > 0 ? (completedTasks / taskCount) * 100 : 0,
      dispersion: 0.84, 
      avgAc: avgAc._avg.ac || 1.0,
      avgWu: avgWu._avg.wu || 1.0,
      avgEb: avgEb._avg.eb || 0.0,
      qualityDistribution: [sTier, aTier, bTier, cTier],
      weeklyCirculation: [120, 150, 130, 180, 200, 170, 210],
      roleLabels: roles,
      roleVolume: roleVolume,
      transactions: recentTx
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch KPI data' }, { status: 500 });
  }
}

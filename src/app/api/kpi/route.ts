import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const taskCount = await prisma.task.count();
    const completedTasksStatus = await prisma.task.count({ where: { status: 'COMPLETED' } });
    
    // Transactions for the last 7 days (Circulation)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyTransactions = await prisma.transaction.findMany({
      where: { timestamp: { gte: sevenDaysAgo } },
    });
    const circulation = weeklyTransactions.reduce((acc: number, t: any) => acc + t.amount, 0);
    
    // Score Tier Distribution
    const users = await prisma.user.findMany({ select: { totalScore: true } });
    const scores = users.map((u: any) => u.totalScore);
    const sTier = scores.filter((s: number) => s >= 90).length;
    const aTier = scores.filter((s: number) => s >= 80 && s < 90).length;
    const bTier = scores.filter((s: number) => s >= 70 && s < 80).length;
    const cTier = scores.filter((s: number) => s < 70).length;

    // Recent Audit Logs (All 11 Factors)
    const recentTx = await prisma.transaction.findMany({
      take: 50,
      orderBy: { timestamp: 'desc' },
      include: { 
        toUser: { select: { anonymousName: true, role: true } },
        fromUser: { select: { anonymousName: true } }
      }
    });

    // Aggregates for Radar/Summary Chart
    const avgStats = await prisma.transaction.aggregate({
      _avg: {
        ac: true, wu: true, wd: true, aa: true, df: true, sf: true, eb: true, rr: true, q: true, pc: true
      }
    });

    // Grouping for "Volume by Role" Chart
    const roles = ['ADMIN', 'PLAYER', 'MANAGER', 'LEADER'];
    const roleVolume = await Promise.all(roles.map(async (role) => {
      const sum = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { toUser: { role: role } }
      });
      return sum._sum.amount || 0;
    }));

    return NextResponse.json({
      circulationVolume: circulation,
      completionRate: taskCount > 0 ? (completedTasksStatus / taskCount) * 100 : 0,
      avgFactors: {
        ac: avgStats._avg.ac || 1.0,
        wu: avgStats._avg.wu || 1.0,
        wd: avgStats._avg.wd || 1.0,
        aa: avgStats._avg.aa || 1.0,
        df: avgStats._avg.df || 1.0,
        sf: avgStats._avg.sf || 1.0,
        eb: avgStats._avg.eb || 1.0,
        rr: avgStats._avg.rr || 1.0,
        pc: avgStats._avg.pc || 1.0,
        q: avgStats._avg.q || 1.0,
      },
      qualityDistribution: [sTier, aTier, bTier, cTier],
      roleLabels: roles,
      roleVolume: roleVolume,
      transactions: recentTx
    });
  } catch (error: any) {
    console.error(`[KPI API ERROR] ${error.message}`);
    return NextResponse.json({ error: 'Failed to fetch KPI data' }, { status: 500 });
  }
}

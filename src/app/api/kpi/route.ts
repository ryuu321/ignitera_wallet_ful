import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Domain 1: S (Evaluation)
    const users = await prisma.user.findMany({ select: { totalScore: true, monthlyScore: true, balanceIgn: true, balanceStock: true, rank: true, anonymousName: true } });
    const totalScorePool = users.reduce((acc, u) => acc + (u.totalScore || 0), 0);
    const avgScore = users.length > 0 ? totalScorePool / users.length : 0;

    // Domain 2: C_flow (Market)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyTransactions = await prisma.transaction.findMany({
      where: { timestamp: { gte: sevenDaysAgo } },
    });
    const circulation = weeklyTransactions.reduce((acc: number, t: any) => acc + t.amount, 0);

    // Domain 3: C_stock (Assets)
    const totalStockPool = users.reduce((acc, u) => acc + (u.balanceStock || 0), 0);

    // Domain 4: IGN (Investment)
    const totalIgnPool = users.reduce((acc, u) => acc + (u.balanceIgn || 0), 0);
    const weeklyExpenses = await prisma.expense.findMany({
      where: { timestamp: { gte: sevenDaysAgo } },
    });
    const investmentVolume = weeklyExpenses.reduce((acc: number, e: any) => acc + e.amount, 0);

    // Rank (S-only)
    const rankDistribution = {
      A: users.filter(u => u.rank === 'A').length,
      B: users.filter(u => u.rank === 'B').length,
      C: users.filter(u => u.rank === 'C').length,
      D: users.filter(u => u.rank === 'D').length,
    };

    // Transactions for Audit
    const recentTx = await prisma.transaction.findMany({
      take: 50,
      orderBy: { timestamp: 'desc' },
      include: { 
        toUser: { select: { anonymousName: true, role: true, rank: true } },
        fromUser: { select: { anonymousName: true } }
      }
    });

    // Averaged Factors for the Chart
    const avgStats = await prisma.transaction.aggregate({
      _avg: {
        ac: true, wu: true, wd: true, aa: true, df: true, sf: true, eb: true, rr: true, q: true, pc: true, finalScore: true
      }
    });

    const roles = ['ADMIN', 'PLAYER', 'MANAGER', 'LEADER'];
    const roleVolume = await Promise.all(roles.map(async (role) => {
      const sum = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { toUser: { role: role } }
      });
      return sum._sum.amount || 0;
    }));

    return NextResponse.json({
      totalScorePool,
      avgScore,
      circulationVolume: circulation,
      totalStockPool,
      totalIgnPool,
      investmentVolume,
      rankDistribution,
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
        s: avgStats._avg.finalScore || 0,
      },
      roleLabels: roles,
      roleVolume: roleVolume,
      transactions: recentTx
    });
  } catch (error: any) {
    console.error(`[KPI API ERROR] ${error.message}`);
    return NextResponse.json({ error: 'Failed to fetch KPI data' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  calculateFinalScore, 
  calculatePc,
  determineWu,
  determineAc,
  determineWd,
  determineEb
} from '@/lib/algorithm';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const { qualityScore } = await req.json(); // Q (0.0 - 1.0)
    const now = new Date();

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        requester: true,
        assignee: true,
      }
    });

    if (!task || !task.assignee || !task.assigneeId) {
      return NextResponse.json({ error: 'Task not ready for completion' }, { status: 400 });
    }

    if (task.status === 'COMPLETED') {
        return NextResponse.json({ error: 'Task is already completed' }, { status: 400 });
    }

    const C = task.baseReward; // Using baseReward for consistency

    // --- NEW ALGORITHM S: DATA GATHERING ---

    // 1. Efficiency Bonus (Eb)
    const tAny = task as any;
    const actualHours = (now.getTime() - task.updatedAt.getTime()) / (1000 * 3600);
    const Eb = determineEb(tAny.expectedHours || 1.0, actualHours);

    // 2. Skill Uniqueness (Wu: Percentile-based)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get all completed tasks in last 30d
    const recentTasks = await prisma.task.findMany({
      where: { status: 'COMPLETED', updatedAt: { gte: thirtyDaysAgo } },
      select: { tags: true } as any
    }) as any[];
    
    const tagFreqs: Record<string, number> = {};
    recentTasks.forEach((t: any) => {
      const tags = JSON.parse((t.tags as string) || '[]');
      tags.forEach((tag: string) => {
        tagFreqs[tag] = (tagFreqs[tag] || 0) + 1;
      });
    });

    const taskTags = JSON.parse(tAny.tags || '[]');
    const currentTagFreq = Math.min(...taskTags.map((tag: string) => tagFreqs[tag] || 1));
    const allFreqs = Object.values(tagFreqs);
    if (allFreqs.length === 0) allFreqs.push(1);
    
    const Wu = determineWu(currentTagFreq, allFreqs);

    // 3. Distribution (Wd: Individual reliance)
    const assigneeHistory = await prisma.task.findMany({
      where: { assigneeId: task.assigneeId, status: 'COMPLETED' },
      select: { requesterId: true }
    });
    const Wd = determineWd(assigneeHistory);

    // 4. Anti-Collusion (Ac: Fraud Score F)
    const totalAssigneeTxs = await prisma.transaction.findMany({
      where: { toUserId: task.assigneeId },
      select: { fromUserId: true, amount: true }
    });
    
    const partnerTxs = totalAssigneeTxs.filter(tx => tx.fromUserId === task.requesterId);
    const r = totalAssigneeTxs.length > 0 ? partnerTxs.length / totalAssigneeTxs.length : 0;
    
    // Closed Loop (c)
    const mutualTxs = await prisma.transaction.findMany({
      where: { fromUserId: task.assigneeId, toUserId: task.requesterId }
    });
    const totalAllTxs = totalAssigneeTxs.length + (await prisma.transaction.count({ where: { fromUserId: task.assigneeId } }));
    const c = totalAllTxs > 0 ? (partnerTxs.length + mutualTxs.length) / totalAllTxs : 0;

    // Price Anomaly (p)
    const allTxs = await prisma.transaction.findMany({ select: { amount: true }, take: 100 });
    const amounts = allTxs.map(t => t.amount).sort((a,b) => a-b);
    const median = amounts.length > 0 ? amounts[Math.floor(amounts.length / 2)] : C;
    const p = Math.abs(C - median) / median;

    const Ac = determineAc({ recurrence: r, closedLoop: c, priceAnomaly: p });

    // 5. Standard Factors
    const Q = parseFloat(qualityScore);
    const Pc = calculatePc(tAny.position);
    const Aa = 1.0; // Activity Placeholder
    const Rc = 1.0; // Rank Placeholder

    // --- FINAL CALCULATION ---
    const S = calculateFinalScore({
        coinAmount: C,
        qualityRating: Q,
        activityRate: Aa,
        rankMultiplier: Rc,
        skillUniqueness: Wu,
        roleMultiplier: Pc,
        efficiencyBonus: Eb,
        distributionRate: Wd,
        antiCollusion: Ac
    });

    console.log(`[ALGORITHM S LOG] ID:${taskId} C:${C} Q:${Q} Wu:${Wu.toFixed(3)} Wd:${Wd.toFixed(3)} Ac:${Ac.toFixed(2)} Eb:${Eb.toFixed(2)} Score:${S.toFixed(2)}`);

    // --- DATABASE UPDATES ---
    // Skill Level Update (Same logic as before)
    let currentSkills = JSON.parse(task.assignee.skills || '[]');
    const updatedSkills = [...currentSkills];
    taskTags.forEach((tag: string) => {
      const idx = updatedSkills.findIndex((s: any) => s.name === tag);
      if (idx > -1) {
        if (updatedSkills[idx].level === 'GRAY') updatedSkills[idx].level = 'BRONZE';
      } else {
        updatedSkills.push({ name: tag, level: 'BRONZE' });
      }
    });

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          taskId,
          fromUserId: task.requesterId,
          toUserId: task.assigneeId,
          amount: C, type: 'PAYMENT',
          wu: Wu, wd: Wd, pc: Pc, q: Q, ac: Ac, eb: Eb, finalScore: S
        } as any
      }),
      prisma.task.update({
        where: { id: taskId },
        data: { status: 'COMPLETED', qualityScore: Q }
      }),
      prisma.user.update({
        where: { id: task.requesterId },
        data: { balanceFlow: { decrement: C } } // Simplified flow deduction
      }),
      prisma.user.update({
        where: { id: task.assigneeId },
        data: {
          balanceStock: { increment: C }, 
          evaluationScore: { increment: S },
          skills: JSON.stringify(updatedSkills)
        }
      })
    ]);

    return NextResponse.json({ finalScoreS: S, factors: { Wu, Wd, Ac, Eb, Pc, Q } });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

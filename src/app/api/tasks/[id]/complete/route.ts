import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateAlgorithmS, updateSkillEMA, median } from '@/lib/algorithm';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const { qualityScore, actualHours: inputActualHours } = await req.json(); // rating, actualHours
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

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

    const tAny = task as any;
    const uAny = task.assignee as any;
    const ratingNum = parseFloat(qualityScore) || 3.0;

    // --- 1. STATISTICS GATHERING ---

    // [Wu] Uniqueness
    const recentCompletedTasks = await prisma.task.findMany({
      where: { status: 'COMPLETED', updatedAt: { gte: thirtyDaysAgo } },
      select: { tags: true }
    });
    const tagFreqs: Record<string, number> = {};
    recentCompletedTasks.forEach(t => {
      const tags = JSON.parse(t.tags || '[]');
      tags.forEach((tag: string) => tagFreqs[tag] = (tagFreqs[tag] || 0) + 1);
    });
    const taskTags = JSON.parse(tAny.tags || '[]');
    const currentTaskFreq = Math.max(1, ...taskTags.map((tag: string) => tagFreqs[tag] || 1));
    const allFreqs = Object.values(tagFreqs).length > 0 ? Object.values(tagFreqs) : [1];

    // [Wd] Distribution
    const assigneeTotalTasks = await prisma.task.findMany({
      where: { assigneeId: task.assigneeId, status: 'COMPLETED' },
      select: { requesterId: true }
    });
    const rCounts: Record<string, number> = {};
    assigneeTotalTasks.forEach(t => rCounts[t.requesterId] = (rCounts[t.requesterId] || 0) + 1);
    const maxReqCount = assigneeTotalTasks.length > 0 ? Math.max(...Object.values(rCounts)) : 0;
    const maxReqShare = assigneeTotalTasks.length > 0 ? maxReqCount / assigneeTotalTasks.length : 0;

    // [Ac] Anti-collusion
    const allTxs = await prisma.transaction.findMany({ select: { fromUserId: true, toUserId: true, amount: true } });
    const samePartnerCount = allTxs.filter(tx => tx.fromUserId === task.requesterId && tx.toUserId === task.assigneeId).length;
    const mutualTxCount = allTxs.filter(tx => (tx.fromUserId === task.requesterId && tx.toUserId === task.assigneeId) || (tx.fromUserId === task.assigneeId && tx.toUserId === task.requesterId)).length;
    const amounts = allTxs.map(tx => tx.amount);
    const medianRewardGlobal = median(amounts.length > 0 ? amounts : [task.baseReward]);

    // [Aa] Activity
    const allRecentRecentTxs = await prisma.transaction.findMany({
       where: { timestamp: { gte: thirtyDaysAgo } },
       select: { df: true, toUserId: true } // df holds difficulty value
    });
    const userLoads: Record<string, number> = {};
    allRecentRecentTxs.forEach(tx => userLoads[tx.toUserId] = (userLoads[tx.toUserId] || 0) + (tx.df || 0));
    const userTotalDiff = userLoads[task.assigneeId] || 0;
    const globalAvgDiffPerUser = Object.values(userLoads).length > 0 ? 
      Object.values(userLoads).reduce((a, b) => a + b, 0) / Object.values(userLoads).length : 1.0;
    const avgSystemDifficulty = allRecentRecentTxs.length > 0 ? 
      allRecentRecentTxs.reduce((a, b) => a + (b.df || 0), 0) / allRecentRecentTxs.length : 1.0;

    // [Sf] Skill Factor
    const performerSkills = (await prisma.user.findMany({
      where: { tasksAssigned: { some: { tags: { contains: taskTags[0] || '' }, status: 'COMPLETED' } } },
      select: { skillLevel: true }
    })).map(u => u.skillLevel);
    const medianPastSkill = median(performerSkills.length > 0 ? performerSkills : [1.0]);

    // --- 2. EXECUTE ALGORITHM S ---
    const actualHours = inputActualHours || (now.getTime() - task.updatedAt.getTime()) / (1000 * 3600);

    const { S, components, metrics } = calculateAlgorithmS({
      reward: task.baseReward,
      cost: 0,
      rank: uAny.rank || 'Z',
      taskFrequency30d: currentTaskFreq,
      frequencyDistribution30d: allFreqs,
      maxRequesterShare: maxReqShare,
      position: tAny.position || 'GENERAL',
      rating: ratingNum,
      samePartnerTxCount: samePartnerCount,
      totalTxCount: allTxs.filter(tx => tx.toUserId === task.assigneeId).length,
      mutualTxCount: mutualTxCount,
      medianRewardGlobal: medianRewardGlobal,
      userTotalDifficulty: userTotalDiff,
      globalAvgDifficultyPerUser: globalAvgDiffPerUser,
      actualHours: actualHours,
      expectedHours: tAny.expectedHours || 1.0,
      numOutputs: tAny.outputs || 1,
      numBranches: tAny.branches || 0,
      numSkills: tAny.skillCount || 1,
      numExternal: tAny.externalCount || 0,
      avgSystemDifficulty: avgSystemDifficulty,
      medianPastPerformersSkill: medianPastSkill,
      userSkillEMA: uAny.skillLevel || 1.0,
    });

    // --- 3. ATOMIC UPDATE & AUDIT ---
    const newSkillLevel = updateSkillEMA(uAny.skillLevel || 1.0, metrics.D, components.Q);

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          taskId,
          fromUserId: task.requesterId,
          toUserId: task.assigneeId,
          amount: components.C,
          finalScore: S,
          wu: components.Wu,
          wd: components.Wd,
          pc: components.Pc,
          q: components.Q,
          ac: components.Ac,
          aa: components.Aa,
          df: components.Df,
          sf: components.Sf,
          eb: components.Eb,
          rr: components.Rr, // Integrated R_rank audit
          timestamp: now
        }
      }),
      prisma.task.update({
        where: { id: taskId },
        data: { status: 'COMPLETED' }
      }),
      prisma.user.update({
        where: { id: task.assigneeId },
        data: {
          balanceStock: { increment: task.baseReward },
          totalScore: { increment: S },
          monthlyScore: { increment: S },
          skillLevel: newSkillLevel
        }
      }),
      prisma.user.update({
        where: { id: task.requesterId },
        data: { balanceFlow: { decrement: task.baseReward } }
      })
    ]);

    return NextResponse.json({ S, components, metrics });
  } catch (error: any) {
    console.error(`[COMPLETION API FINAL] ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

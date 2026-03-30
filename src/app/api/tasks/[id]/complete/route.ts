import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateAlgorithmS, updateSkillEMA, median } from '@/lib/algorithm';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const { qualityScore, actualHours: inputActualHours } = await req.json(); // rating (1-5), actualHours
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

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

    // --- 1. STATISTICS GATHERING (11 FACTORS) ---

    // [Wu] Task Frequency (Uniqueness)
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
    const freqDistrib = Object.values(tagFreqs).length > 0 ? Object.values(tagFreqs) : [1];

    // [Wd] Distribution (Reliance)
    const assigneeCompletedTasks = await prisma.task.findMany({
      where: { assigneeId: task.assigneeId, status: 'COMPLETED' },
      select: { requesterId: true }
    });
    const totalAssignedCount = assigneeCompletedTasks.length;
    const requesterCounts: Record<string, number> = {};
    assigneeCompletedTasks.forEach(t => requesterCounts[t.requesterId] = (requesterCounts[t.requesterId] || 0) + 1);
    const maxReqCount = totalAssignedCount > 0 ? Math.max(...Object.values(requesterCounts)) : 0;
    const maxReqShare = totalAssignedCount > 0 ? maxReqCount / totalAssignedCount : 0;

    // [Ac] Anti-collusion
    const allTxs = await prisma.transaction.findMany({ select: { fromUserId: true, toUserId: true, amount: true } });
    const samePartnerCount = allTxs.filter(tx => tx.fromUserId === task.requesterId && tx.toUserId === task.assigneeId).length;
    const mutualTxCount = allTxs.filter(tx => (tx.fromUserId === task.requesterId && tx.toUserId === task.assigneeId) || (tx.fromUserId === task.assigneeId && tx.toUserId === task.requesterId)).length;
    const amounts = allTxs.map(tx => tx.amount);
    const medianRewardGlobal = median(amounts.length > 0 ? amounts : [task.baseReward]);

    // [Aa] Activity & [Df] System Load
    const allRecentRecentTxs = await prisma.transaction.findMany({
       where: { timestamp: { gte: thirtyDaysAgo } },
       select: { difficulty: true, toUserId: true }
    });
    const userLoads: Record<string, number> = {};
    allRecentRecentTxs.forEach(tx => userLoads[tx.toUserId] = (userLoads[tx.toUserId] || 0) + (tx.difficulty || 0));
    const userTotalDiff = userLoads[task.assigneeId] || 0;
    const globalAvgDiffPerUser = Object.values(userLoads).length > 0 ? 
      Object.values(userLoads).reduce((a, b) => a + b, 0) / Object.values(userLoads).length : 1.0;
    const avgSystemDifficulty = allRecentRecentTxs.length > 0 ? 
      allRecentRecentTxs.reduce((a, b) => a + (b.difficulty || 0), 0) / allRecentRecentTxs.length : 1.0;

    // [Sf] Skill Factor
    const similarTasksPerformers = await prisma.task.findMany({
      where: { tags: { contains: taskTags[0] || '' }, status: 'COMPLETED' },
      include: { assignee: { select: { skillLevel: true } } }
    });
    const performerSkills = similarTasksPerformers.map(t => t.assignee?.skillLevel || 1.0);
    const medianPastSkill = median(performerSkills.length > 0 ? performerSkills : [1.0]);

    // [Rf] Rank Factor (90d)
    const ninetyDayTxs = await prisma.transaction.findMany({
      where: { timestamp: { gte: ninetyDaysAgo } },
      select: { finalScore: true, toUserId: true }
    });
    const ninetyDaySums: Record<string, number> = {};
    ninetyDayTxs.forEach(tx => ninetyDaySums[tx.toUserId] = (ninetyDaySums[tx.toUserId] || 0) + tx.finalScore);
    const user90dScore = ninetyDaySums[task.assigneeId] || 0;
    const scoreDistrib90d = Object.values(ninetyDaySums).length > 0 ? Object.values(ninetyDaySums) : [0];

    // --- 2. EXECUTE ALGORITHM ---
    const actualHours = inputActualHours || (now.getTime() - task.updatedAt.getTime()) / (1000 * 3600);

    const { S, components, metrics } = calculateAlgorithmS({
      reward: task.baseReward,
      cost: 0,
      taskFrequency30d: currentTaskFreq,
      frequencyDistribution30d: freqDistrib,
      requesterTaskCount: requesterCounts[task.requesterId] || 0,
      totalTaskCountByAssignee: totalAssignedCount,
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
      past90dScore: user90dScore,
      scoreDistribution90d: scoreDistrib90d,
    });

    // --- 3. FINAL UPDATES & AUDIT ---
    const newSkillLevel = updateSkillEMA(uAny.skillLevel || 1.0, metrics.D, components.Q);

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          taskId,
          fromUserId: task.requesterId,
          toUserId: task.assigneeId,
          amount: components.C,
          wu: components.Wu,
          wd: components.Wd,
          pc: components.Pc,
          q: components.Q,
          ac: components.Ac,
          aa: components.Aa,
          df: components.Df,
          sf: components.Sf,
          eb: components.Eb,
          rf: components.Rf,
          actualHours: actualHours,
          expectedHours: tAny.expectedHours || 1.0,
          difficulty: metrics.D,
          complexity: metrics.X,
          rating: Math.round(ratingNum),
          fraudScore: metrics.F,
          finalScore: S,
          timestamp: now
        }
      }),
      prisma.task.update({
        where: { id: taskId },
        data: { status: 'COMPLETED', finalReward: S }
      }),
      prisma.user.update({
        where: { id: task.assigneeId },
        data: {
          balanceStock: { increment: task.baseReward },
          evaluationScore: { increment: S },
          monthlyScore: { increment: S }, // NEW: Accumulate for ranking
          skillLevel: newSkillLevel
        }
      }),
      prisma.user.update({
        where: { id: task.requesterId },
        data: {
          balanceFlow: { decrement: task.baseReward }
        }
      })
    ]);

    return NextResponse.json({ S, components, metrics });
  } catch (error: any) {
    console.error(`[ALGORITHM S FINAL] ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

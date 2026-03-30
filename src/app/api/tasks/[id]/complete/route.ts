import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateAlgorithmS } from '@/lib/algorithm';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const { qualityScore, actualHours: inputActualHours } = await req.json(); // Q (1-5), h_act
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

    const tAny = task as any;
    const uAny = task.assignee as any;

    // --- 1. STATISTICS GATHERING for Relational Factors ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Wu Distribution
    const recentTasks = (await prisma.task.findMany({
      where: { status: 'COMPLETED', updatedAt: { gte: thirtyDaysAgo } },
      select: { tags: true } as any
    })) as any[];
    
    const tagFreqs: Record<string, number> = {};
    recentTasks.forEach((t: any) => {
      const tags = JSON.parse((t.tags as string) || '[]');
      tags.forEach((tag: string) => {
        tagFreqs[tag] = (tagFreqs[tag] || 0) + 1;
      });
    });
    const taskTags = JSON.parse(tAny.tags || '[]');
    const currentTagFreq = Math.min(...(taskTags.length > 0 ? taskTags.map((tag: string) => tagFreqs[tag] || 1) : [1]));
    const allFreqs = Object.values(tagFreqs);
    if (allFreqs.length === 0) allFreqs.push(1);

    // Wd Reliance
    const assigneeHistory = await prisma.task.findMany({
      where: { assigneeId: task.assigneeId, status: 'COMPLETED' },
      select: { requesterId: true }
    });
    const counts: Record<string, number> = {};
    assigneeHistory.forEach(h => counts[h.requesterId] = (counts[h.requesterId] || 0) + 1);
    const maxCount = assigneeHistory.length > 0 ? Math.max(...Object.values(counts)) : 0;
    const reliance_ratio = assigneeHistory.length > 0 ? maxCount / assigneeHistory.length : 0;

    // Global Activity (L_base) and Difficulty (D_avg)
    const recentTxs = (await prisma.transaction.findMany({
      where: { timestamp: { gte: thirtyDaysAgo } },
      select: { difficulty: true, finalScore: true } as any
    })) as any[];
    const all_activity_L = recentTxs.length > 0 ? recentTxs.map((tx: any) => tx.difficulty * 1.0) : [1.0];

    // Collusion metrics
    const totalAssigneeTxs = await prisma.transaction.findMany({
      where: { toUserId: task.assigneeId },
      select: { fromUserId: true, amount: true }
    });
    const partnerTxs = totalAssigneeTxs.filter(tx => tx.fromUserId === task.requesterId);
    const r = totalAssigneeTxs.length > 0 ? partnerTxs.length / totalAssigneeTxs.length : 0;
    const mutualTxs = await prisma.transaction.findMany({
      where: { fromUserId: task.assigneeId, toUserId: task.requesterId }
    });
    const totalAllTxs = totalAssigneeTxs.length + (await prisma.transaction.count({ where: { fromUserId: task.assigneeId } }));
    const c = totalAllTxs > 0 ? (partnerTxs.length + mutualTxs.length) / totalAllTxs : 0;
    const allTxs = (await prisma.transaction.findMany({ select: { amount: true }, take: 100 })) as any[];
    const amounts = allTxs.map((t:any) => t.amount).sort((a:number,b:number) => a-b);
    const median = amounts.length > 0 ? amounts[Math.floor(amounts.length / 2)] : (task.baseReward || 100);
    const p = Math.abs((task.baseReward || 100) - median) / median;

    // --- 2. RUN ALGORITHM ENGINE ---
    const actualHours = inputActualHours || (now.getTime() - task.updatedAt.getTime()) / (1000 * 3600);
    
    const { score, factors, logs } = calculateAlgorithmS({
      reward: task.baseReward || 100,
      redistribution_cost: 0,
      actual_hours: actualHours,
      expected_hours: (task as any).expectedHours || 1.0,
      rating: parseFloat(qualityScore) || 3.0,
      complexity: {
        n_o: (task as any).outputs || 1,
        n_b: (task as any).branches || 0,
        n_s: (task as any).skillCount || 1,
        n_e: (task as any).externalCount || 0
      },
      required_skill_level: (task as any).requiredSkill || 1.0,
      user_skill_level: uAny.skillLevel || 1.0,
      user_role: uAny.role || "PLAYER",
      user_rank: uAny.rank || "E",
      all_task_freqs_30d: allFreqs,
      t_freq: currentTagFreq,
      all_activity_L: all_activity_L,
      reliance_ratio: reliance_ratio,
      collusion_metrics: { r, c, p }
    });

    // --- 3. DATABASE UPDATES ---
    const updatedSkills = JSON.parse(task.assignee.skills || '[]');
    // (Logic for skill progression could be added here)

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          taskId,
          fromUserId: task.requesterId,
          toUserId: task.assigneeId,
          amount: factors.C, type: 'PAYMENT',
          wu: factors.Wu, 
          wd: factors.Wd, 
          pc: factors.Pc, 
          q: factors.Q, 
          ac: factors.Ac, 
          aa: factors.Aa,
          rc: factors.Rc,
          eb: factors.Eb,
          actualHours: actualHours,
          rating: factors.Q, // Mapping normalized Q back if needed
          difficulty: factors.D,
          finalScore: score
        } as any
      }),
      prisma.task.update({
        where: { id: taskId },
        data: { status: 'COMPLETED' }
      }),
      prisma.user.update({
        where: { id: task.requesterId },
        data: { balanceFlow: { decrement: task.baseReward } }
      }),
      prisma.user.update({
        where: { id: task.assigneeId },
        data: {
          balanceStock: { increment: task.baseReward }, 
          evaluationScore: { increment: score },
          // skills: JSON.stringify(updatedSkills)
        }
      })
    ]);

    return NextResponse.json({ finalScoreS: score, factors, logs });
  } catch (error: any) {
    console.error(`[ALGORITHM S ERROR] ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

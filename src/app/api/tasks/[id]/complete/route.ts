import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  calculateFinalScore, 
  determineWu, 
  determineAc,
  determineWd
} from '@/lib/algorithm';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const { qualityScore } = await req.json(); // Q (0.0 - 1.0)

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        requester: true,
        assignee: true,
      }
    });

    if (!task || !task.assignee || !task.assigneeId || !task.finalReward) {
      return NextResponse.json({ error: 'Task not ready for completion' }, { status: 400 });
    }

    if (task.status === 'COMPLETED') {
        return NextResponse.json({ error: 'Task is already completed' }, { status: 400 });
    }

    const C = task.finalReward;
    const totalRequesterBalance = task.requester.balanceFlow + task.requester.balanceStock;

    if (totalRequesterBalance < C) {
        return NextResponse.json({ error: 'Insufficent total balance (Flow + Stock) to pay the reward' }, { status: 400 });
    }

    // --- ALGORITHM S CALCULATION ---
    
    // 1. Get all user skills for Wu calculation
    const allUsers = await prisma.user.findMany({ select: { skills: true } });
    const allSkills = allUsers.flatMap((u: any) => JSON.parse(u.skills));
    const assigneeSkills = JSON.parse(task.assignee.skills);
    
    // 2. Get transaction history for Ac calculation
    const history = await prisma.transaction.findMany({
      select: { fromUserId: true, toUserId: true }
    });
    const historyMapped = history.map((h: any) => ({ fromId: h.fromUserId, toId: h.toUserId }));

    // 3. Components
    const Wu = determineWu(assigneeSkills, allSkills);
    const Wd = determineWd(task.assigneeId, historyMapped); 
    const Pc = task.assignee.role === 'MANAGER' ? 1.2 : 1.0;
    const Q = parseFloat(qualityScore);
    const Ac = determineAc(task.requesterId, task.assigneeId, historyMapped);

    const S = calculateFinalScore({
        coinAmount: C,
        skillUniqueness: Wu,
        networkDispersion: Wd,
        roleMultiplier: Pc,
        qualityRating: Q,
        collusionFactor: Ac
    });

    // --- DATABASE UPDATES (ATOMIC TRANSACTION) ---
    const flowBalance = task.requester.balanceFlow;
    let flowDecrement = C;
    let stockDecrement = 0;

    // If Flow is insufficient, take from Stock
    if (flowBalance < C) {
      flowDecrement = flowBalance;
      stockDecrement = C - flowBalance;
    }

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          taskId,
          fromUserId: task.requesterId,
          toUserId: task.assigneeId,
          amount: C, type: 'PAYMENT',
          wu: Wu, wd: Wd, pc: Pc, q: Q, ac: Ac, finalScore: S
        }
      }),
      prisma.task.update({
        where: { id: taskId },
        data: { status: 'COMPLETED', qualityScore: Q }
      }),
      prisma.user.update({
        where: { id: task.requesterId },
        data: { 
          balanceFlow: { decrement: flowDecrement },
          balanceStock: { decrement: stockDecrement }
        }
      }),
      prisma.user.update({
        where: { id: task.assigneeId },
        data: {
          balanceStock: { increment: C }, // C (Contract Reward) added to Stock
          evaluationScore: { increment: S } // S (Algrithm Score) added to Evaluation only
        }
      })
    ]);

    return NextResponse.json({ finalScoreS: S });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

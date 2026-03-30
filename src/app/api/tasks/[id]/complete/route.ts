import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  calculateFinalScore, 
  determineWu, 
  determineAc 
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
    const C = task.finalReward;
    const Wu = determineWu(assigneeSkills, allSkills);
    const Wd = 0.84; // Placeholder for network dispersion (Wd)
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
        data: { balanceFlow: { decrement: C } }
      }),
      prisma.user.update({
        where: { id: task.assigneeId },
        data: {
          balanceStock: { increment: S },
          evaluationScore: { increment: S / 100 }
        }
      })
    ]);

    return NextResponse.json({ finalScoreS: S });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

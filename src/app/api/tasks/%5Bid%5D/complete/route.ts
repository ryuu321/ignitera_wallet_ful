import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateAlgorithmS } from '@/lib/engine';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const body = await req.json();
    
    // Inputs for Algorithm S
    const { 
      actualHours, 
      expenseAmount,
      wu, wd, pc, q, ac, aa, df, sf, eb 
    } = body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, requester: true }
    });

    if (!task || !task.assigneeId || !task.assignee) {
      return NextResponse.json({ error: 'Task or assignee not found' }, { status: 404 });
    }

    // 1. Prepare Input for Algorithm S
    const sInput = {
      wu: wu ?? 1.0,
      wd: wd ?? 1.0,
      pc: pc ?? 1.0,
      q: q ?? 1.0,
      ac: ac ?? 1.0,
      aa: aa ?? 1.0,
      df: df ?? 1.0,
      sf: sf ?? 1.0,
      eb: eb ?? 1.0,
      reward: task.baseReward,
      hours: actualHours ?? 1,
      expenses: expenseAmount ?? 0,
      rank: task.assignee.rank,
    };

    // 2. Calculate Final Score (S)
    const finalScore = calculateAlgorithmS(sInput);

    // 3. Update Database (Atomic Transaction)
    // - S (Evaluation): Update Score
    // - Market (C_flow): Decrease requester's balanceFlow
    // - Assets (C_stock): Increase assignee's balanceStock
    const [updatedUser, completedTask] = await prisma.$transaction([
      // Assignee Data (Score and Assets)
      prisma.user.update({
        where: { id: task.assigneeId },
        data: {
          balanceStock: { increment: task.baseReward },
          monthlyScore: { increment: finalScore },
          totalScore: { increment: finalScore },
        }
      }),
      // Requester Data (Flow Economy)
      prisma.user.update({
        where: { id: task.requesterId },
        data: {
          balanceFlow: { decrement: task.baseReward },
        }
      }),
      // Task Status Update
      prisma.task.update({
        where: { id: taskId },
        data: { status: 'COMPLETED' }
      }),
      // Log the Transaction
      prisma.transaction.create({
        data: {
          taskId,
          fromUserId: task.requesterId,
          toUserId: task.assigneeId,
          amount: task.baseReward,
          finalScore: finalScore,
          wu: sInput.wu, wd: sInput.wd, pc: sInput.pc, q: sInput.q,
          ac: sInput.ac, aa: sInput.aa, df: sInput.df, sf: sInput.sf,
          eb: sInput.eb,
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      finalScore, 
      reward: task.baseReward 
    });

  } catch (error: any) {
    console.error(`[COMPLETION API ERROR] ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

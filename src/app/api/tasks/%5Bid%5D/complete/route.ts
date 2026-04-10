import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateAlgorithmS } from '@/lib/engine';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const body = await req.json();
    
    // Inputs for Algorithm S
    const { actualHours, expenseAmount, rating } = body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, requester: true }
    });

    if (!task || !task.assigneeId || !task.assignee || !task.requester) {
      return NextResponse.json({ error: 'Task / Roles not found' }, { status: 404 });
    }

    // 1. Calculate Reward Subtraction (Requester side)
    const totalPayment = task.baseReward;
    const availableFlow = task.requester.balanceFlow;
    const availableStock = task.requester.balanceStock;

    if (availableFlow + availableStock < totalPayment) {
       return NextResponse.json({ error: 'Requester has insufficient total balance' }, { status: 400 });
    }

    const flowPayment = Math.min(availableFlow, totalPayment);
    const stockPayment = Math.max(0, totalPayment - flowPayment);

    // 2. Calculate Final Score (S) using the full statistical engine
    const { finalScore, factors } = await calculateAlgorithmS({
      taskId,
      userId: task.assigneeId,
      requesterId: task.requesterId,
      actualHours: actualHours ?? 1,
      expenses: expenseAmount ?? 0,
      rating: rating ?? 3,
    });

    // 3. Update Database (Atomic Transaction)
    await prisma.$transaction([
      // 3a. Assignee Data (Score and Assets)
      prisma.user.update({
        where: { id: task.assigneeId },
        data: {
          balanceStock: { increment: task.baseReward },
          monthlyScore: { increment: finalScore },
          totalScore: { increment: finalScore },
        }
      }),
      // 3b. Requester Data (Multiple domain subtraction)
      prisma.user.update({
        where: { id: task.requesterId },
        data: {
          balanceFlow: { decrement: flowPayment },
          balanceStock: { decrement: stockPayment },
        }
      }),
      // 3c. Task Status Update
      prisma.task.update({
        where: { id: taskId },
        data: { status: 'COMPLETED', finalReward: task.baseReward }
      }),
      // 3d. Log the Transaction (Recording all components for audit)
      prisma.transaction.create({
        data: {
          taskId,
          fromUserId: task.requesterId,
          toUserId: task.assigneeId,
          amount: task.baseReward,
          finalScore: finalScore,
          wu: factors.Wu, 
          wd: factors.Wd, 
          pc: factors.Pc, 
          q: factors.Q,
          ac: factors.Ac, 
          aa: factors.Aa, 
          df: factors.Df, 
          sf: factors.Sf,
          eb: factors.Eb, 
          rr: factors.Rr,
          rawActualHours: actualHours,
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      finalScore, 
      multipliers: factors,
      payment: { flowUsed: flowPayment, stockUsed: stockPayment }
    });

  } catch (error: any) {
    console.error(`[COMPLETION API ERROR] ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

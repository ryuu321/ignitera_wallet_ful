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

    if (!task || !task.assigneeId || !task.assignee || !task.requester) {
      return NextResponse.json({ error: 'Task / Roles not found' }, { status: 404 });
    }

    // 1. Calculate Reward Subtraction (Requester side)
    // - totalPayment = task.baseReward
    // - subtract from balanceFlow first
    // - remainder from balanceStock
    const totalPayment = task.baseReward;
    const availableFlow = task.requester.balanceFlow;
    const availableStock = task.requester.balanceStock;

    if (availableFlow + availableStock < totalPayment) {
       return NextResponse.json({ error: 'Requester has insufficient total balance at completion stage' }, { status: 400 });
    }

    const flowPayment = Math.min(availableFlow, totalPayment);
    const stockPayment = totalPayment - flowPayment;

    // 2. Prepare Input for Algorithm S
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

    // 3. Calculate Final Score (S)
    const finalScore = calculateAlgorithmS(sInput);

    // 4. Update Database (Atomic Transaction)
    // - S (Evaluation): Update Score
    // - Market (C_flow / C_stock): Payment from requester
    // - Assets (C_stock): Increment receiver assets
    const [updatedUser, completedTask] = await prisma.$transaction([
      // 4a. Assignee Data (Score and Assets)
      prisma.user.update({
        where: { id: task.assigneeId },
        data: {
          balanceStock: { increment: task.baseReward },
          monthlyScore: { increment: finalScore },
          totalScore: { increment: finalScore },
        }
      }),
      // 4b. Requester Data (Multiple domain subtraction)
      prisma.user.update({
        where: { id: task.requesterId },
        data: {
          balanceFlow: { decrement: flowPayment },
          balanceStock: { decrement: stockPayment },
        }
      }),
      // 4c. Task Status Update
      prisma.task.update({
        where: { id: taskId },
        data: { status: 'COMPLETED' }
      }),
      // 4d. Log the Transaction
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
      reward: task.baseReward,
      flowUsed: flowPayment,
      stockUsed: stockPayment
    });

  } catch (error: any) {
    console.error(`[COMPLETION API ERROR] ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const { bidId } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      const bid = await tx.bid.findUnique({
        where: { id: bidId },
        include: { bidder: true }
      });
      if (!bid) throw new Error('Bid not found');

      const task = await tx.task.findUnique({
        where: { id: taskId },
        include: { requester: true }
      });
      if (!task) throw new Error('Task not found');

      // Reconciliation: Base Reward was pre-deducted at creation.
      // Now adjust for the actual Bid Amount.
      const diff = bid.amount - task.baseReward;
      const requester = task.requester;

      if (diff > 0) {
        // Auction result is higher than baseline: Deduct more
        const canDeductFlow = Math.min(requester.balanceFlow, diff);
        const remainingDeficit = diff - canDeductFlow;
        if (requester.balanceStock < remainingDeficit) throw new Error('残高不足のため入札を受諾できません（ストック残高が不足しています）');
        
        await tx.user.update({
          where: { id: task.requesterId },
          data: {
            balanceFlow: requester.balanceFlow - canDeductFlow,
            balanceStock: requester.balanceStock - remainingDeficit
          }
        });
      } else if (diff < 0) {
        // Auction result is lower than baseline: Refund the difference
        const refund = Math.abs(diff);
        await tx.user.update({
          where: { id: task.requesterId },
          data: {
            balanceFlow: { increment: refund }
          }
        });
      }

      // Update the task with the assigned user and accepted amount
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          assigneeId: bid.bidderId,
          finalReward: bid.amount,
          status: 'IN_PROGRESS'
        }
      });

      // Update bid status
      await tx.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' }
      });

      // Reject other bids
      await tx.bid.updateMany({
        where: { taskId, id: { not: bidId } },
        data: { status: 'REJECTED' }
      });

      return updatedTask;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

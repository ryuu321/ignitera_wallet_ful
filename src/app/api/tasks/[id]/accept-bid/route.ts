import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const { bidId } = await req.json();

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { bidder: true }
    });

    if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });

    // Update the task with the assigned user and accepted amount
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assigneeId: bid.bidderId,
        finalReward: bid.amount,
        status: 'IN_PROGRESS'
      }
    });

    // Update bid status
    await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'ACCEPTED' }
    });

    // Reject other bids
    await prisma.bid.updateMany({
      where: { taskId, id: { not: bidId } },
      data: { status: 'REJECTED' }
    });

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

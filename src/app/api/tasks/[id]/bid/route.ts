import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { bidderId, amount, message } = await req.json();
    const { id: taskId } = await params;

    // 1. Check Task Existence
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.status !== 'OPEN') {
      return NextResponse.json({ error: 'Task is no longer accepting bids' }, { status: 400 });
    }

    // 2. Check Bidder Existence
    const bidder = await prisma.user.findUnique({
      where: { id: bidderId },
    });

    if (!bidder) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Prevent self-bidding
    if (task.requesterId === bidderId) {
      return NextResponse.json({ error: 'Cannot bid on your own task' }, { status: 400 });
    }

    // 4. Create Bid
    const bid = await prisma.bid.create({
      data: {
        taskId,
        bidderId,
        amount: parseFloat(amount),
        message: message || '',
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, bid });
  } catch (error: any) {
    console.error('[BID ERROR]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const { bidderId, amount, message } = await req.json();

    // Check if task exists and is open for bidding
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (task.status !== 'OPEN' && task.status !== 'BIDDING') {
      return NextResponse.json({ error: 'Task is not open for bidding' }, { status: 400 });
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        taskId,
        bidderId,
        amount: parseFloat(amount),
        message,
      },
      include: { bidder: true }
    });

    // Update task status to BIDDING if it was OPEN
    if (task.status === 'OPEN') {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'BIDDING' }
      });
    }

    return NextResponse.json(bid);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const bids = await prisma.bid.findMany({
      where: { taskId: taskId },
      include: { bidder: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(bids);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateFinalScore } from '@/lib/algorithm';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: { 
        requester: true, 
        assignee: true,
        bids: { include: { bidder: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, description, requesterId, baseReward, position } = data;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        requesterId,
        baseReward: parseFloat(baseReward),
        position: position || 'GENERAL',
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

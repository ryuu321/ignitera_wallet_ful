import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        requester: { select: { id: true, anonymousName: true, rank: true } },
        assignee: { select: { id: true, anonymousName: true, rank: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Fetch Task Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, baseReward, requesterId, tags, expectedHours, position } = await req.json();
    const rewardVal = parseFloat(baseReward);

    // 1. Validation: Requester must have enough TOTAL resources (Flow + Stock)
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { balanceFlow: true, balanceStock: true }
    });

    if (!requester || ((requester.balanceFlow || 0) + (requester.balanceStock || 0)) < rewardVal) {
      return NextResponse.json({ 
        error: `Insufficient budget. Total required: ${rewardVal}, Available: ${(requester?.balanceFlow || 0) + (requester?.balanceStock || 0)}` 
      }, { status: 400 });
    }

    // 2. Create Task (Do NOT subtract from balance at this stage as per user request)
    const task = await prisma.task.create({
      data: {
        title,
        description,
        baseReward: rewardVal, 
        expectedHours: parseFloat(expectedHours) || 1.0,
        position: position || 'GENERAL',
        requesterId,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : '[]',
        status: 'OPEN',
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('[TASK CREATE ERROR]', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const { 
      title, description, requesterId, baseReward, position, tags, expectedHours,
      requiredSkill, outputs, branches, skillCount, externalCount
    } = data;

    const rewardNum = parseFloat(baseReward);
    
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: requesterId }
      });

      if (!user) throw new Error('User not found');

      let newFlow = user.balanceFlow;
      let newStock = user.balanceStock;
      
      if (newFlow >= rewardNum) {
        // Enough Flow
        newFlow -= rewardNum;
      } else {
        // Deficit: Take all flow, take remaining from stock
        const deficit = rewardNum - newFlow;
        if (newStock < deficit) throw new Error('Insufficient balance (Flow + Stock combined)');
        newFlow = 0;
        newStock -= deficit;
      }

      // Update User
      await tx.user.update({
        where: { id: requesterId },
        data: { balanceFlow: newFlow, balanceStock: newStock }
      });

      // Create Task
      return await tx.task.create({
        data: {
          title,
          description,
          requesterId,
          baseReward: rewardNum,
          position: position || 'GENERAL',
          tags: Array.isArray(tags) ? JSON.stringify(tags) : (tags || "[]"),
          expectedHours: parseFloat(expectedHours || '1.0'),
          requiredSkill: parseFloat(requiredSkill || '1.0'),
          outputs: parseInt(outputs || '1'),
          branches: parseInt(branches || '0'),
          skillCount: parseInt(skillCount || '1'),
          externalCount: parseInt(externalCount || '0'),
        } as any,
        include: { requester: true }
      });
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to create task' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const messages = await prisma.taskMessage.findMany({
      where: { taskId },
      include: { user: { select: { anonymousName: true } } },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const { userId, content } = await req.json();

    const message = await prisma.taskMessage.create({
      data: {
        taskId,
        userId,
        content
      },
      include: { user: { select: { anonymousName: true } } }
    });

    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

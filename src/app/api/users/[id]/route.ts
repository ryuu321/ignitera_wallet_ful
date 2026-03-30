import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Only allow updating skills and realName for now
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(body.skills && { skills: body.skills }),
        ...(body.realName && { realName: body.realName }),
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

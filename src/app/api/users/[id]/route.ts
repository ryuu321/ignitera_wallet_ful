import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { skills, skillLevel } = body;
    
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(skills !== undefined && { skills }),
        ...(skillLevel !== undefined && { skillLevel: parseFloat(skillLevel) }),
      }
    });

    return NextResponse.json(user);
  } catch (err: any) {
    console.error('PATCH USER ERROR:', err);
    return NextResponse.json({ error: 'Failed to update neural profile.' }, { status: 500 });
  }
}

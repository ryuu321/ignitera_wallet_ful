import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const skills = await prisma.skillMaster.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(skills);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, category } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const newSkill = await prisma.skillMaster.create({
      data: {
        name,
        category: category || 'GENERAL'
      }
    });

    return NextResponse.json(newSkill);
  } catch (err: any) {
    if (err.code === 'P2002') {
        return NextResponse.json({ error: 'Skill already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

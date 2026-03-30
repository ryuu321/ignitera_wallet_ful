import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SKILL_CATEGORIES } from '@/lib/skills';

export async function GET() {
  try {
    let skills = await prisma.skillMaster.findMany();
    
    // Seed if empty
    if (skills.length === 0) {
      const seedData = Object.entries(SKILL_CATEGORIES).flatMap(([cat, names]) => 
        names.map(name => ({ name, category: cat }))
      );
      await prisma.skillMaster.createMany({ data: seedData });
      skills = await prisma.skillMaster.findMany();
    }
    
    return NextResponse.json(skills);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, category } = await req.json();
    const skill = await prisma.skillMaster.create({
      data: { name, category: category || 'General' }
    });
    return NextResponse.json(skill);
  } catch (error) {
    return NextResponse.json({ error: 'Skill already exists or invalid data' }, { status: 400 });
  }
}

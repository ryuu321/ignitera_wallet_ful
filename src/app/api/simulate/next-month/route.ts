import { NextResponse } from 'next/server';
import { finalizeMonth } from '@/lib/rank';

export async function POST() {
  try {
    await finalizeMonth();
    return NextResponse.json({ message: 'Next month simulated successfully' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

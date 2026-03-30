import { NextResponse } from 'next/server';
import { finalizeMonth, finalizeSeason } from '@/lib/rank';

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    if (action === 'FINALIZE_MONTH') {
      await finalizeMonth();
      return NextResponse.json({ message: 'Month finalized and ranks updated.' });
    }

    if (action === 'FINALIZE_SEASON') {
      await finalizeSeason('2026-S1');
      return NextResponse.json({ message: 'Season finalized and ranks reset.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error(`[RANK ADMIN ERROR] ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

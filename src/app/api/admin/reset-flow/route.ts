import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Reset all users balanceFlow to default monthly allocation
    await prisma.user.updateMany({
      data: { balanceFlow: 1000 }
    });
    
    // Log this action
    await prisma.kPILog.create({
      data: {
        metricName: 'ADMIN_ACTION',
        value: 1.0, // Representing a reset event
      }
    });

    return NextResponse.json({ message: 'Monthly flow coins have been reset for all users.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset flow coins' }, { status: 500 });
  }
}

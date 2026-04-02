import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json();
    const exchangeAmount = parseFloat(amount);

    if (isNaN(exchangeAmount) || exchangeAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.balanceStock < exchangeAmount) {
      return NextResponse.json({ error: 'Insufficient Stock balance' }, { status: 400 });
    }

    // Atomic Move: Stock (Domain 3) -> IGN (Domain 4)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        balanceStock: { decrement: exchangeAmount },
        balanceIgn: { increment: exchangeAmount },
      }
    });

    // Log the exchange as a special transaction or KPI event?
    await prisma.kPILog.create({
      data: {
        metricName: `EXCHANGE_STOCK_IGN_${user.anonymousName}`,
        value: exchangeAmount,
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      newBalanceStock: updatedUser.balanceStock,
      newBalanceIgn: updatedUser.balanceIgn 
    });

  } catch (error: any) {
    console.error(`[EXCHANGE API ERROR] ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

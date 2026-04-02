import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, amount, category, description } = await req.json();
    const useAmount = parseFloat(amount);

    if (isNaN(useAmount) || useAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.balanceIgn < useAmount) {
      return NextResponse.json({ error: 'Insufficient IGN balance' }, { status: 400 });
    }

    // Atomic Move: IGN (Domain 4) -> Tool/Outsource/Investment spend
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        balanceIgn: { decrement: useAmount },
      }
    });

    // Create Expense log
    await prisma.expense.create({
      data: {
        userId,
        amount: useAmount,
        category: category || 'GENERAL',
        description: description || 'Investment Activity',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      newBalanceIgn: updatedUser.balanceIgn 
    });

  } catch (error: any) {
    console.error(`[EXPENSE API ERROR] ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Spend IGN for corporate amenities, seat fees, or dining.
 */
export async function POST(req: Request) {
  try {
    const { userId, amount, category, description } = await req.json();
    const spendAmount = parseFloat(amount);

    if (isNaN(spendAmount) || spendAmount <= 0) {
      return NextResponse.json({ error: 'Invalid expense amount' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      if (user.balanceIgn < spendAmount) {
        throw new Error('IGN残高が不足しています（Stockから換金してください）');
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balanceIgn: { decrement: spendAmount }
        }
      });

      // Log as a special transaction type
      await tx.transaction.create({
        data: {
          fromUserId: userId,
          toUserId: 'SYSTEM_EXPENSE', // System account for tracking expenses
          type: 'IGN_EXPENSE',
          amount: spendAmount,
          finalScore: 0
        }
      });

      return updatedUser;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

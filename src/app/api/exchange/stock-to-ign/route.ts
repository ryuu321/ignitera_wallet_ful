import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Exchange Stock (High-value Asset) to IGN (Liquid Internal Currency)
 * Use case: Amenities, desk fees, local dining, etc.
 */
export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json();
    const exchangeAmount = parseFloat(amount);

    if (isNaN(exchangeAmount) || exchangeAmount <= 0) {
      return NextResponse.json({ error: 'Invalid exchange amount' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      if (user.balanceStock < exchangeAmount) {
        throw new Error('Stock残高が不足しています');
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balanceStock: { decrement: exchangeAmount },
          balanceIgn: { increment: exchangeAmount }
        }
      });

      // Log the exchange in transactions? 
      // For now, let's create a generic transaction log
      await tx.transaction.create({
        data: {
          fromUserId: userId,
          toUserId: userId, // Self-exchange
          type: 'IGN_EXCHANGE',
          amount: exchangeAmount,
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

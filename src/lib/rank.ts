import { prisma } from './prisma';

/**
 * Rank System - Independent Module (Final Version)
 * Z(25) to A(0) - total 26 levels
 */

export const RANK_LADDER = [
  'Z', 'Y', 'X', 'W', 'V', 'U', 'T', 'S', 'R', 'Q', 'P', 'O', 'N',
  'M', 'L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'
];

export const T_0 = 100;     // Baseline threshold for Z -> Y
export const ALPHA = 1.20;  // Exponential growth factor
export const BETA = 0.7;    // Maintenance factor (M_r = BETA * T_r)

// Capacity limits for top ranks
export const RANK_CAPACITIES: Record<string, number> = {
  'A': 3,
  'B': 5,
  'C': 10,
  'D': 20
};

/**
 * Calculate threshold score to reach rank r from Z
 * Tr = T0 * a^n
 */
export const getPromotionThreshold = (rank: string): number => {
  const n = RANK_LADDER.indexOf(rank);
  if (n <= 0) return 0; // Z has no threshold to stay
  return Math.round(T_0 * Math.pow(ALPHA, n));
};

/**
 * Core Ranking Logic - Update single user's rank status
 */
export const processUserRankUpdate = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const currentIdx = RANK_LADDER.indexOf(user.rank);
  const nextRank = RANK_LADDER[currentIdx + 1];
  
  // 1. Promotion (S_month >= T_r)
  if (nextRank) {
    const Tr = getPromotionThreshold(nextRank);
    if (user.monthlyScore >= Tr) {
      // Check for Capacity if nextRank is A-D
      if (RANK_CAPACITIES[nextRank]) {
        const count = await prisma.user.count({ where: { rank: nextRank } });
        if (count < RANK_CAPACITIES[nextRank]) {
          await promote(userId, nextRank);
          return;
        } else {
          // Full! Must outperform the lowest in that rank to displace
          const lowestInRank = await prisma.user.findFirst({
            where: { rank: nextRank },
            orderBy: { monthlyScore: 'asc' }
          });
          if (lowestInRank && user.monthlyScore > lowestInRank.monthlyScore) {
             // Displacement!
             await demote(lowestInRank.id, user.rank); // Push him down
             await promote(userId, nextRank);         // Take his spot
             return;
          }
        }
      } else {
        await promote(userId, nextRank);
        return;
      }
    }
  }

  // 2. Demotion (S_month < M_r)
  // Only for Middle rank and above (e.g., above rank S)
  const isMiddleOrAbove = currentIdx >= RANK_LADDER.indexOf('S');
  if (isMiddleOrAbove) {
    const Tr = getPromotionThreshold(user.rank);
    const Mr = BETA * Tr;
    if (user.monthlyScore < Mr) {
      if (user.graceMonths >= 1) {
        // 2nd month failing -> Demote!
        const prevRank = RANK_LADDER[currentIdx - 1];
        if (prevRank) await demote(userId, prevRank);
      } else {
        // 1st month grace
        await prisma.user.update({
          where: { id: userId },
          data: { graceMonths: { increment: 1 } }
        });
      }
    } else {
      // Met the mark -> Reset grace
      await prisma.user.update({
        where: { id: userId },
        data: { graceMonths: 0 }
      });
    }
  }
};

async function promote(userId: string, targetRank: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { rank: targetRank, graceMonths: 0 }
  });
}

async function demote(userId: string, targetRank: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { rank: targetRank, graceMonths: 0 }
  });
}

/**
 * End of Month Processor
 */
export const finalizeMonth = async () => {
  const users = await prisma.user.findMany();
  for (const u of users) {
    await processUserRankUpdate(u.id);
  }
  
  // Reset Monthly Scores
  await prisma.user.updateMany({
    data: {
      prevMonthlyScore: { set: 0 }, // temp store
    }
  });
  // Swap
  const all = await prisma.user.findMany();
  for (const u of all) {
     await prisma.user.update({
       where: { id: u.id },
       data: { 
         prevMonthlyScore: u.monthlyScore,
         monthlyScore: 0
       }
     });
  }
};

/**
 * Season End Cleanup (Resets ranks)
 */
export const finalizeSeason = async () => {
  const users = await prisma.user.findMany();
  for (const u of users) {
    const idx = RANK_LADDER.indexOf(u.rank);
    let targetRank = u.rank;
    
    if (u.rank === 'A') targetRank = 'C';
    else if (u.rank === 'B') targetRank = 'D';
    else if (u.rank === 'C') targetRank = 'E';
    else if (idx > 0) targetRank = RANK_LADDER[idx - 1]; // 1 rank down
    
    await prisma.user.update({
      where: { id: u.id },
      data: { rank: targetRank, monthlyScore: 0, graceMonths: 0 }
    });
  }
};

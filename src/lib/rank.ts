import { prisma } from './prisma';

/**
 * Rank System - Integrated Spec (A to Z)
 * A(Highest) ... Z(Lowest)
 */

export const RANK_LADDER = [
  'Z', 'Y', 'X', 'W', 'V', 'U', 'T', 'S', 'R', 'Q', 'P', 'O', 'N',
  'M', 'L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'
];

export const T_0 = 100;     // Baseline threshold for Z -> Y
export const ALPHA = 1.20;  // Exponential growth factor
export const BETA = 0.7;    // Maintenance factor (M_r = 0.7 * T_r)

// Final Specified Capacities (A-D)
export const RANK_CAPACITIES: Record<string, number> = {
  'A': 10,
  'B': 20,
  'C': 30,
  'D': 50
};

/**
 * Calculate threshold score (Tr) for reaching rank index n from Z
 * n=0(Z), n=1(Y)... n=25(A)
 */
export const getPromotionThreshold = (rank: string): number => {
  const n = RANK_LADDER.indexOf(rank);
  if (n <= 0) return 0;
  return Math.round(T_0 * Math.pow(ALPHA, n));
};

/**
 * Update logic for a single user (Monthly Evaluation)
 */
export const processUserRankUpdate = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const currentIdx = RANK_LADDER.indexOf(user.rank);
  const nextRank = RANK_LADDER[currentIdx + 1];
  
  // 1. Promotion (S_month >= Tr)
  if (nextRank) {
    const Tr = getPromotionThreshold(nextRank);
    if (user.monthlyScore >= Tr) {
      // Check Capacity for A-D
      if (RANK_CAPACITIES[nextRank]) {
        const count = await prisma.user.count({ where: { rank: nextRank } });
        if (count < RANK_CAPACITIES[nextRank]) {
          await updateRank(userId, nextRank);
          return;
        } else {
          // Rank is full! Displacement logic (Compare S_month)
          const lowestInRank = await prisma.user.findFirst({
            where: { rank: nextRank },
            orderBy: { monthlyScore: 'asc' }
          });
          if (lowestInRank && user.monthlyScore > lowestInRank.monthlyScore) {
             // Push down the underperformer, take their spot
             await updateRank(lowestInRank.id, user.rank);
             await updateRank(userId, nextRank);
             return;
          }
        }
      } else {
        await updateRank(userId, nextRank);
        return;
      }
    }
  }

  // 2. Demotion (S_month < Mr)
  // middle or above (e.g., above M rank)
  const midlineIdx = RANK_LADDER.indexOf('M'); 
  if (currentIdx >= midlineIdx) {
    const TrCurrent = getPromotionThreshold(user.rank);
    const Mr = BETA * TrCurrent;
    if (user.monthlyScore < Mr) {
      if (user.graceMonths >= 1) {
        const prevRank = RANK_LADDER[currentIdx - 1];
        if (prevRank) await updateRank(userId, prevRank);
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: { graceMonths: { increment: 1 } }
        });
      }
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { graceMonths: 0 }
      });
    }
  }
};

async function updateRank(userId: string, targetRank: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { rank: targetRank, graceMonths: 0 }
  });
}

/**
 * Automated Monthly Finalization
 */
export const finalizeMonth = async () => {
  const users = await prisma.user.findMany();
  for (const u of users) {
    await processUserRankUpdate(u.id);
  }
  
  // Swap scores for reference
  for (const u of users) {
    await prisma.user.update({
      where: { id: u.id },
      data: {
        lastMonthScore: u.monthlyScore,
        monthlyScore: 0
      }
    });
  }
};

/**
 * Season End Cleanup (Special resets)
 */
export const finalizeSeason = async (seasonId: string) => {
  const users = await prisma.user.findMany();
  for (const u of users) {
    // Audit current season
    await prisma.rankHistory.create({
      data: {
        userId: u.id,
        rank: u.rank,
        score: u.totalScore,
        seasonId: seasonId
      }
    });

    const currentRank = u.rank;
    let targetRank = currentRank;
    const idx = RANK_LADDER.indexOf(currentRank);

    // SEASON RESET LOGIC
    if (currentRank === 'A') targetRank = 'C';
    else if (currentRank === 'B') targetRank = 'D';
    else if (currentRank === 'C') targetRank = 'E';
    else if (idx > 0) {
      targetRank = RANK_LADDER[idx - 1]; // 1-rank down for general
    }
    // Z persists Z

    await prisma.user.update({
      where: { id: u.id },
      data: {
        rank: targetRank,
        monthlyScore: 0,
        graceMonths: 0
      }
    });
  }
};

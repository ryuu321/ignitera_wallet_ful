import { prisma } from './prisma';
import { getRankThreshold, determineRankChange } from './engine';

export const RANK_LADDER = ['D', 'C', 'B', 'A'];

/**
 * ランク昇格のしきい値を計算 (Algorithm S 準拠)
 * Tr = 100 * 1.2^n
 */
export const getPromotionThreshold = (rank: string) => {
  const index = RANK_LADDER.indexOf(rank.toUpperCase());
  if (index === -1) return 100;
  return getRankThreshold(index);
};

export const getDemotionThreshold = (rank: string) => {
  return 0.7 * getPromotionThreshold(rank);
};

/**
 * 月次締め処理 (月を進めるシミュレーション)
 * Algorithm S に基づくランク昇降格を適用
 */
export const finalizeMonth = async () => {
  const users = await prisma.user.findMany() as any[];
  const updates = [];

  // 定員枠の管理
  const caps: Record<string, number> = { A: 10, B: 20, C: 30, D: 50 };
  const rankCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

  // スコア順にソートして上位から定員を埋める
  const sortedUsers = [...users].sort((a, b) => (b.monthlyScore || 0) - (a.monthlyScore || 0));

  for (const user of sortedUsers) {
    const { nextRank, action } = determineRankChange(user.rank, user.monthlyScore || 0);
    
    let finalNextRank = nextRank;
    // 定員オーバーの場合は現状維持
    if (action === 'PROMOTE' && rankCounts[finalNextRank] >= caps[finalNextRank]) {
      finalNextRank = user.rank;
    }
    
    rankCounts[finalNextRank]++;

    updates.push(
      prisma.user.update({
        where: { id: user.id },
        data: {
          rank: finalNextRank,
          lastMonthScore: user.monthlyScore || 0,
          monthlyScore: 0,
          balanceFlow: 1000, // 月次の Flow 予算リセット (C_flow)
        }
      })
    );
    
    // KPI ログ
    await prisma.kPILog.create({
      data: {
        metricName: `MONTHLY_FINALIZE_${user.anonymousName}`,
        value: user.monthlyScore || 0,
        timestamp: new Date()
      }
    });
  }

  await prisma.$transaction(updates);
};

/**
 * シーズン締め処理
 */
export const finalizeSeason = async (seasonId: string) => {
  const users = await prisma.user.findMany() as any[];
  
  for (const user of users) {
    await prisma.rankHistory.create({
      data: {
        userId: user.id,
        seasonId,
        rank: user.rank,
        score: user.totalScore || 0
      }
    });
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        rank: 'D', // 初期リセット
        monthlyScore: 0,
        totalScore: 0,
        lastMonthScore: 0,
        balanceFlow: 1000,
        balanceStock: 0, // シーズンリセットでは残高もリセット? 必要に応じて調整
      }
    });
  }
};

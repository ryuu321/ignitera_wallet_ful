import { prisma } from './prisma';

export const RANK_LADDER = [
  'Z', 'Y', 'X', 'W', 'V', 'U', 'T', 'S', 'R', 'Q', 'P', 'O', 'N', 'M', 'L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'
];

/**
 * ランク昇格に必要な月次スコア（Monthly Score）のしきい値を計算
 * 基底値を 1000 とし、ランクが上がるごとに 1.15倍 ずつ増加させる
 */
export const getPromotionThreshold = (rank: string) => {
  const n = RANK_LADDER.indexOf(rank.toUpperCase());
  if (n <= 0) return 0; 
  return Math.round(1000 * Math.pow(1.15, n - 1));
};

export const getRankCorrection = (rank: string) => {
  const r_pos = RANK_LADDER.slice().reverse().indexOf(rank.toUpperCase()) + 1;
  return 1 + 0.003 * (13 - r_pos);
};

/**
 * 月次締め処理 (月を進めるシミュレーション)
 */
export const finalizeMonth = async () => {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    // ランク維持の判定などは複雑なため、現状はスコアのスライドとFlowリセットを優先
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastMonthScore: user.monthlyScore,
        monthlyScore: 0,
        balanceFlow: 1000, // 月次の発行可能枠を再付与
        graceMonths: 0 
      }
    });

    // 履歴レコードを残す (KPI分析用)
    await prisma.kPILog.create({
      data: {
        metricName: `MONTHLY_FINALIZE_${user.anonymousName}`,
        value: user.monthlyScore,
        timestamp: new Date()
      }
    });
  }
};

/**
 * シーズン締め処理
 */
export const finalizeSeason = async (seasonId: string) => {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    // 履歴を保存
    await prisma.rankHistory.create({
      data: {
        userId: user.id,
        seasonId,
        rank: user.rank,
        score: user.totalScore
      }
    });
    
    // シーズンリセット (全てのパラメータを初期化)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        rank: 'Z',
        monthlyScore: 0,
        totalScore: 0,
        lastMonthScore: 0,
        balanceFlow: 1000,
        balanceStock: 0,
        graceMonths: 0
      }
    });
  }
};

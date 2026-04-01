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
 * 月次締め処理
 */
export const finalizeMonth = async () => {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastMonthScore: user.monthlyScore,
        monthlyScore: 0,
        graceMonths: 0 // 月次締め時に猶予期間リセット（運用ルールによる）
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
    
    // シーズンリセット
    await prisma.user.update({
      where: { id: user.id },
      data: {
        rank: 'Z', // 必要に応じて初期化
        monthlyScore: 0,
        totalScore: 0,
        lastMonthScore: 0,
        graceMonths: 0
      }
    });
  }
};

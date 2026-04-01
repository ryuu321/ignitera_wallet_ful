export const RANK_LADDER = [
  'Z', 'Y', 'X', 'W', 'V', 'U', 'T', 'S', 'R', 'Q', 'P', 'O', 'N', 'M', 'L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'
];

/**
 * ランク昇格に必要な月次スコア（Monthly Score）のしきい値を計算
 * 基底値を 1000 とし、ランクが上がるごとに 1.15倍 ずつ増加させる
 */
export const getPromotionThreshold = (rank: string) => {
  const n = RANK_LADDER.indexOf(rank.toUpperCase());
  if (n <= 0) return 0; // Zランク自体のしきい値は0
  
  // Z(0) -> Y(1) のとき: 1000
  // Y(1) -> X(2) のとき: 1150
  return Math.round(1000 * Math.pow(1.15, n - 1));
};

export const getRankCorrection = (rank: string) => {
  const r_pos = RANK_LADDER.slice().reverse().indexOf(rank.toUpperCase()) + 1;
  return 1 + 0.003 * (13 - r_pos);
};

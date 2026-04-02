/**
 * Algorithm S: Evaluation Engine - Separation of Concerns
 * Strictly decouples S (Evaluation), C_flow (Market), C_stock (Assets), and IGN (Investment).
 */

export interface SInput {
  wu: number; wd: number; pc: number; q: number;
  ac: number; aa: number; df: number; sf: number;
  eb: number; reward: number; hours: number;
  expenses: number; rank: string;
}

export function calculateAlgorithmS(input: SInput): number {
  const { wu, wd, pc, q, ac, aa, df, sf, eb, reward, hours, expenses, rank } = input;
  
  // 1. Base Value (V_base)
  const V_base = wu * wd * pc * q * ac * aa * df * sf * eb;
  
  // 2. Reward Value (V_rev) - Log scaled individual reward (C_flow)
  const k = 0.1;
  const V_rev = k * Math.log(1 + reward);
  
  // 3. Total Value (V)
  const V = V_base + V_rev;
  
  // 4. Evaluation Cost (C_eval)
  const w = 2000; // Hourly base
  const C_eval = (w * hours) + expenses;
  
  // 5. Investment Efficiency (Ec)
  const Ec = C_eval > 0 ? V / C_eval : V;
  
  // 6. Efficiency Correction f(Ec)
  const alpha = 0.1;
  const f_Ec = 1 + alpha * Math.log(1 + Ec);
  
  // 7. Rank Correction R_rank
  const rankMap: Record<string, number> = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'Z': 13 };
  const r = rankMap[rank.toUpperCase()] || 13;
  const R_rank = 1 + 0.003 * (13 - r);
  
  // 8. Final Score (S)
  const S = V * f_Ec * R_rank;
  
  return parseFloat(S.toFixed(4));
}

export function getRankCorrection(rank: string): number {
  const rankMap: Record<string, number> = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'Z': 13 };
  const r = rankMap[rank.toUpperCase()] || 13;
  return 1 + 0.003 * (13 - r);
}

export function getRankThreshold(n: number): number {
  return 100 * Math.pow(1.2, n);
}

export function determineRankChange(currentRank: string, sMonth: number): { nextRank: string, action: 'PROMOTE' | 'DEMOTE' | 'STAY' } {
  const ranks = ['D', 'C', 'B', 'A'];
  const currentIndex = ranks.indexOf(currentRank.toUpperCase());
  
  if (currentIndex === -1) return { nextRank: 'D', action: 'STAY' };
  
  const Tr = getRankThreshold(currentIndex);
  
  if (sMonth >= Tr && currentIndex < ranks.length - 1) {
    return { nextRank: ranks[currentIndex + 1], action: 'PROMOTE' };
  }
  
  if (sMonth < 0.7 * Tr && currentIndex > 0) {
    return { nextRank: ranks[currentIndex - 1], action: 'DEMOTE' };
  }
  
  return { nextRank: currentRank, action: 'STAY' };
}

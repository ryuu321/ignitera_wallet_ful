/**
 * Integrated Algorithm S + Rank Correction (Final Spec)
 * 
 * S = C × W_u × W_d × P_c × Q × A_c × A_a × D_f × S_f × E_b × R_rank
 * 
 * R_rank(r) = 1 + gamma * (mid - r)
 * r: Rank position index (A=1, Z=26)
 * mid: 13, gamma: 0.003
 */

import { RANK_LADDER } from './rank';

export const clamp = (min: number, val: number, max: number): number => {
  return Math.max(min, Math.min(val, max));
};

export const median = (values: number[]): number => {
  if (!values || values.length === 0) return 1.0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const calculatePercentile = (val: number, distribution: number[]): number => {
  if (!distribution || distribution.length === 0) return 0.5;
  const count = distribution.filter(x => x < val).length;
  return count / distribution.length;
};

export const POSITION_WEIGHTS: Record<string, number> = {
  'GENERAL': 1.00,
  'LEADER': 1.10,
  'SPECIALIST': 1.15,
  'MANAGER': 1.20
};

export interface AlgorithmInputs {
  reward: number;
  cost: number;
  
  // Rank - for R_rank
  rank: string; // A...Z
  
  // Wu - Uniqueness
  taskFrequency30d: number;
  frequencyDistribution30d: number[];
  
  // Wd - Distribution
  maxRequesterShare: number;
  
  // Pc - Position
  position: string;
  
  // Q - Quality
  rating: number; // 1-5
  
  // Ac - Anti-collusion (F score items)
  samePartnerTxCount: number;
  totalTxCount: number;
  mutualTxCount: number;
  medianRewardGlobal: number;
  
  // Aa - Activity
  userTotalDifficulty: number;
  globalAvgDifficultyPerUser: number;
  
  // Df - Difficulty factor
  actualHours: number;
  expectedHours: number;
  numOutputs: number;
  numBranches: number;
  numSkills: number;
  numExternal: number;
  avgSystemDifficulty: number; // D_avg
  
  // Sf - Skill factor
  medianPastPerformersSkill: number; // s_req
  userSkillEMA: number; // s_usr
  
  // Eb - Efficiency bonus
}

export const calculateAlgorithmS = (inputs: AlgorithmInputs) => {
  const alpha = 0.5;
  const beta = 0.4;
  const gamma = 0.003;
  const midRankIdx = 13; // M Rank around middle

  // --- C: Coin ---
  const C = Math.max(0, inputs.reward - inputs.cost);
  
  // --- Wu: Uniqueness ---
  const percFt = calculatePercentile(inputs.taskFrequency30d, inputs.frequencyDistribution30d);
  const Wu = 1 + 0.5 * (1 - percFt);
  
  // --- Wd: Distribution ---
  const Wd = 1 - 0.3 * inputs.maxRequesterShare;
  
  // --- Pc: Position ---
  const Pc = POSITION_WEIGHTS[inputs.position.toUpperCase()] || 1.0;
  
  // --- Q: Quality ---
  const Q = 0.8 + 0.1 * (inputs.rating - 1);
  
  // --- Ac: Anti-collusion ---
  const r_coll = inputs.samePartnerTxCount / Math.max(1, inputs.totalTxCount);
  const c_coll = inputs.mutualTxCount / Math.max(1, inputs.totalTxCount);
  const p_coll = Math.abs(inputs.reward - inputs.medianRewardGlobal) / Math.max(1, inputs.medianRewardGlobal);
  const F = 0.4 * r_coll + 0.4 * c_coll + 0.2 * p_coll;
  let Ac = 1.0;
  if (F >= 0.6) Ac = 0.5;
  else if (F >= 0.3) Ac = 0.8;
  
  // --- Aa: Activity ---
  const Aa = 1 + 0.3 * Math.sqrt(inputs.userTotalDifficulty / Math.max(1, inputs.globalAvgDifficultyPerUser));
  
  // --- Df: Difficulty factor ---
  const X_base = 1 + 0.2 * inputs.numOutputs + 0.3 * inputs.numBranches + 0.3 * inputs.numSkills + 0.5 * inputs.numExternal;
  const X_adj = clamp(0.8, 1 + 0.3 * (inputs.actualHours / Math.max(0.1, inputs.expectedHours) - 1), 1.2);
  const X = X_base * X_adj;
  const D = inputs.actualHours * X;
  const Df = clamp(1.0, 1 + alpha * ((D - inputs.avgSystemDifficulty) / Math.max(1, inputs.avgSystemDifficulty)), 1.5);
  
  // --- Sf: Skill factor ---
  const g = inputs.medianPastPerformersSkill / Math.max(0.1, inputs.userSkillEMA);
  const Sf = clamp(0.8, 1 + beta * (g - 1), 1.2);
  
  // --- Eb: Efficiency bonus ---
  const Eb = 1 + clamp(-0.1, 0.5 * (inputs.expectedHours / Math.max(0.1, inputs.actualHours) - 1), 0.2);
  
  // --- Rr: Rank Correction (New Integrated Spec) ---
  // r is the rank position index (A=1, Z=26)
  // Our RANK_LADDER is [A, B... Z], indexed 0 to 25.
  // So r = index + 1
  const r_pos = RANK_LADDER.slice().reverse().indexOf(inputs.rank.toUpperCase()) + 1;
  const Rr = 1 + gamma * (midRankIdx - r_pos);
  
  // --- S: Final Integrated Score ---
  const S = C * Wu * Wd * Pc * Q * Ac * Aa * Df * Sf * Eb * Rr;

  return {
    S,
    components: { C, Wu, Wd, Pc, Q, Ac, Aa, Df, Sf, Eb, Rr },
    metrics: { F, r_coll, c_coll, p_coll, X_base, X_adj, X, D, r_pos }
  };
};

export const updateSkillEMA = (currentSkill: number, D: number, Q: number, gamma_ema: number = 0.25): number => {
  const xt = D * Q;
  return gamma_ema * xt + (1 - gamma_ema) * currentSkill;
};

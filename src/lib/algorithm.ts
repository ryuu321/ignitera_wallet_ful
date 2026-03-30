/**
 * Ignitera Algorithm S: Advanced Behavioral Evaluation Engine
 * 
 * Formal Specification Revision: 2026-03-30
 * 
 * Evaluation Structure:
 * S = (Reward Factors) * (Control Factors)
 * 
 * Reward Factors (加点): C, Q, Aa, Rc, Wu, Pc, Eb
 * Control Factors (減点): Wd, Ac
 */

export interface EvaluationInput {
  // Reward Factors
  coinAmount: number;      // C
  qualityRating: number;    // Q (0.0 - 1.0)
  activityRate: number;     // Aa (Default 1.0)
  rankMultiplier: number;   // Rc (Default 1.0)
  skillUniqueness: number;  // Wu (1.0 - 1.5)
  roleMultiplier: number;   // Pc (1.0 - 1.2)
  efficiencyBonus: number;  // Eb (-0.1 - 0.2)
  
  // Control Factors
  distributionRate: number; // Wd (0.7 - 1.0)
  antiCollusion: number;    // Ac (0.5 - 1.0)
}

/**
 * Calculates the final score S based on the separated factor layers.
 */
export function calculateFinalScore(input: EvaluationInput): number {
  const { 
    coinAmount, 
    qualityRating, 
    activityRate, 
    rankMultiplier, 
    skillUniqueness, 
    roleMultiplier, 
    efficiencyBonus,
    distributionRate,
    antiCollusion
  } = input;

  // Layer 1: Reward Base
  const rewardFactors = 
    coinAmount * 
    qualityRating * 
    activityRate * 
    rankMultiplier * 
    skillUniqueness * 
    roleMultiplier * 
    (1 + efficiencyBonus);

  // Layer 2: Control Adjustments
  const finalScore = rewardFactors * distributionRate * antiCollusion;

  return finalScore;
}

/**
 * Pc (Position Multiplier)
 */
export function calculatePc(position: string): number {
  switch (position) {
    case 'MANAGER': return 1.2;
    case 'SUB_MANAGER': return 1.15;
    case 'SPECIALIST': return 1.1;
    case 'GENERAL': return 1.0;
    default: return 1.0;
  }
}

/**
 * Wu (Skill Uniqueness)
 * Wu = 1 + 0.5 * (1 - percentile(frequency_30d))
 * Range: 1.0 - 1.5
 */
export function determineWu(taskFrequency: number, allTaskFrequencies: number[]): number {
  if (allTaskFrequencies.length === 0) return 1.0;
  
  const sorted = [...allTaskFrequencies].sort((a, b) => a - b);
  // Find rank (lowest frequency is most unique)
  // Percentile of the frequency value t in the distribution
  const rank = sorted.indexOf(taskFrequency);
  const percentile = rank / sorted.length;
  
  // Rare skills (low frequency) get higher Wu
  const Wu = 1 + 0.5 * (1 - percentile);
  return Wu;
}

/**
 * Wd (Distribution Rate)
 * r_d = max(n_j / N) (Max reliance ratio on a single requester)
 * Wd = 1 - 0.3 * r_d
 * Range: 0.7 - 1.0
 */
export function determineWd(registrations: { requesterId: string }[]): number {
  if (registrations.length === 0) return 1.0;
  
  const counts: Record<string, number> = {};
  registrations.forEach(r => {
    counts[r.requesterId] = (counts[r.requesterId] || 0) + 1;
  });
  
  const maxCount = Math.max(...Object.values(counts));
  const rd = maxCount / registrations.length;
  
  const Wd = 1 - 0.3 * rd;
  return Wd;
}

/**
 * Ac (Anti-Collusion Factor)
 * F = 0.4r + 0.4c + 0.2p
 * f < 0.3 -> 1.0, f < 0.6 -> 0.8, else -> 0.5
 */
export function determineAc(metrics: {
  recurrence: number;      // r = transactions with this partner / total
  closedLoop: number;      // c = mutual transactions / total
  priceAnomaly: number;    // p = |reward - median| / median
}): number {
  const { recurrence, closedLoop, priceAnomaly } = metrics;
  
  const F = 0.4 * recurrence + 0.4 * closedLoop + 0.2 * priceAnomaly;
  
  if (F < 0.3) return 1.0;
  if (F < 0.6) return 0.8;
  return 0.5;
}

/**
 * Eb (Efficiency Bonus)
 * Eb = clamp(-0.1, 0.5 * (hexp/hact - 1), 0.2)
 */
export function determineEb(expectedHours: number, actualHours: number): number {
  if (actualHours <= 0) return 0.2; // Exceptional speed
  
  const ratio = (expectedHours / actualHours) - 1;
  const rawEb = 0.5 * ratio;
  
  // Clamp between -0.1 and 0.2
  return Math.min(0.2, Math.max(-0.1, rawEb));
}

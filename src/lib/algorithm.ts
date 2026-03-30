/**
 * Ignitera Algorithm: S = C * Wu * Wd * Pc * Q * Ac
 */

export interface EvaluationInput {
  coinAmount: number;      // C
  skillUniqueness: number;  // Wu: 1.0 - 2.0 (higher for rare skills)
  networkDispersion: number; // Wd: 1.0 - 1.5 (higher for diverse connections)
  roleMultiplier: number;   // Pc: 1.0 (Player) or 1.2 (Manager)
  qualityRating: number;    // Q: 0.0 - 1.0 (peer review)
  collusionFactor: number;  // Ac: 0.0 - 1.0 (lower if history shows collusion)
}

/**
 * Calculates the final stock coin score for bonus calculation.
 */
export function calculateFinalScore(input: EvaluationInput): number {
  const { 
    coinAmount, 
    skillUniqueness, 
    networkDispersion, 
    roleMultiplier, 
    qualityRating, 
    collusionFactor 
  } = input;

  return (
    coinAmount * 
    skillUniqueness * 
    networkDispersion * 
    roleMultiplier * 
    qualityRating * 
    collusionFactor
  );
}

/**
 * Helper to determine skill uniqueness based on global frequency.
 */
export function determineWu(userSkills: string[], allUserSkills: string[]): number {
  if (allUserSkills.length === 0) return 1.0;
  
  // Wu = 1 + (1 - (userSkillFrequency / totalSkillsCount))
  // For simplicity, we calculate an average uniqueness across user's skills
  const frequencies = userSkills.map(skill => {
    const count = allUserSkills.filter(s => s === skill).length;
    return count / allUserSkills.length;
  });
  
  const avgFreq = frequencies.reduce((a, b) => a + b, 0) / (frequencies.length || 1);
  return 1 + (1 - avgFreq); // Range ~1.0 - 2.0
}

/**
 * Anti-collusion factor (Ac) calculation based on recent transactions.
 */
export function determineAc(fromUserId: string, toUserId: string, history: { fromId: string, toId: string }[]): number {
  const totalBetween = history.filter(t => 
    (t.fromId === fromUserId && t.toId === toUserId) || 
    (t.fromId === toUserId && t.toId === fromUserId)
  ).length;

  const totalTransactions = history.length || 1;
  const ratio = totalBetween / totalTransactions;

  // If more than 30% of user's transactions are with one person, penalize
  if (ratio > 0.3) {
    return Math.max(0.1, 1 - (ratio - 0.3) * 2);
  }
  
  return 1.0;
}

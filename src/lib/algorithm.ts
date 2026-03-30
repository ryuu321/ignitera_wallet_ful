/**
 * Ignitera Algorithm: S = C * Wu * Wd * Pc * Q * Ac
 * Range Aligned Version
 */

export interface EvaluationInput {
  coinAmount: number;      // C: 100 - 1000
  skillUniqueness: number;  // Wu: 1.0 - 2.0
  networkDispersion: number; // Wd: 0.5 - 1.0
  roleMultiplier: number;   // Pc: 1.0 - 1.2
  qualityRating: number;    // Q: 0.0 - 1.0
  collusionFactor: number;  // Ac: 0.0 - 1.0
}

/**
 * Calculates the final stock coin score (S).
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
 * Skill Uniqueness (Wu): 1.0 - 2.0
 * Based on rarity of the skill in the overall ecosystem.
 */
export function determineWu(userSkills: string[], allUserSkills: string[]): number {
  if (allUserSkills.length === 0 || userSkills.length === 0) return 1.0;
  
  const skillOccurrences: { [key: string]: number } = {};
  allUserSkills.forEach(s => skillOccurrences[s] = (skillOccurrences[s] || 0) + 1);
  
  const totalUsersWithSkills = allUserSkills.length;
  
  const uniquenessScores = userSkills.map(skill => {
    const freq = (skillOccurrences[skill] || 1) / totalUsersWithSkills;
    // Scale to reach 2.0 max for very rare skills
    return 1 + (1 - Math.pow(freq, 0.5)); 
  });
  
  return Math.min(2.0, Math.max(...uniquenessScores));
}

/**
 * Network Dispersion (Wd): 0.5 - 1.0
 * Higher if the user works with more variety of people.
 */
export function determineWd(userId: string, history: { fromId: string, toId: string }[]): number {
  if (history.length === 0) return 1.0; // Start with healthy score or 0.5? User said increases on dispersion.
  
  const connections = new Set<string>();
  let userTransactionsCount = 0;
  
  history.forEach(t => {
    if (t.fromId === userId) {
      connections.add(t.toId);
      userTransactionsCount++;
    } else if (t.toId === userId) {
      connections.add(t.fromId);
      userTransactionsCount++;
    }
  });

  if (userTransactionsCount === 0) return 1.0;
  
  // Ratio of unique collaborators to total transactions
  const ratio = Math.min(1.0, connections.size / (userTransactionsCount || 1));
  
  // Range: 0.5 (low dispersion) to 1.0 (high dispersion)
  return 0.5 + (ratio * 0.5);
}

/**
 * Anti-Collusion Factor (Ac): 0.0 - 1.0
 * Drops to 0 if heavy collusion is detected.
 */
export function determineAc(fromUserId: string, toUserId: string, history: { fromId: string, toId: string }[]): number {
  const userHistory = history.filter(t => t.fromId === fromUserId || t.toId === fromUserId);
  const totalTransactions = userHistory.length || 1;
  
  const pairTransactions = userHistory.filter(t => 
    (t.fromId === fromUserId && t.toId === toUserId) || 
    (t.fromId === toUserId && t.toId === fromUserId)
  ).length;

  const ratio = pairTransactions / totalTransactions;

  // If more than 30% of total history is with this single person, penalize heavily
  if (ratio > 0.3) {
    const penalty = (ratio - 0.3) * 2;
    return Math.max(0.0, 1.0 - penalty);
  }
  
  return 1.0;
}

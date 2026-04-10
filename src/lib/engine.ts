import { prisma } from './prisma';

/**
 * ■ Algorithm S: Definitive Edition (v.Final)
 * Structure: 
 * 1. V_base = Wu * Ac * Wd * Aa * Df * Sf * Eb * Pc * Q
 * 2. V      = V_base + V_rev
 * 3. Ec     = V / Ce -> f(Ec)
 * 4. S      = V * f(Ec) * Rr
 */

export interface EvaluationContext {
  taskId: string;
  userId: string;
  requesterId: string;
  actualHours: number;
  expenses: number;
  rating: number; // 1-5
}

const clamp = (min: number, val: number, max: number) => Math.max(min, Math.min(val, max));

/**
 * Rank Correction Factor Rr
 * Based on the User's Rank (A=1, B=2, ..., Z=13)
 */
export function getRankCorrection(rank: string): number {
  const rankMap: Record<string, number> = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'Z': 13 };
  const r = rankMap[rank.toUpperCase()] || 13;
  return 1 + 0.003 * (13 - r);
}

/**
 * Calculates current load metrics for activity factor Aa
 */
async function fetchLoadStats(userId: string) {
  const [userTasks, allTasks] = await Promise.all([
    prisma.task.findMany({ where: { assigneeId: userId, status: 'COMPLETED' } }),
    prisma.task.findMany({ where: { status: 'COMPLETED' } })
  ]);
  const userCount = await prisma.user.count();
  const calculateL = (tasks: any[]) => tasks.reduce((sum, t) => sum + (t.baseReward * 0.1), 0);
  const L = calculateL(userTasks);
  const TOTAL_L = calculateL(allTasks);
  const L_base = TOTAL_L / (userCount || 1);
  return { L, L_base };
}

async function fetchObjectiveStats(ctx: EvaluationContext) {
  const { taskId, userId, requesterId } = ctx;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [task, user, totalTasks, similarTasksCount, userHistory, pairTransactions, loadStats] = await Promise.all([
    prisma.task.findUnique({ where: { id: taskId } }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.task.count(),
    prisma.task.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.task.findMany({ where: { assigneeId: userId, status: 'COMPLETED' }, take: 20 }),
    prisma.transaction.count({ where: { fromUserId: requesterId, toUserId: userId } }),
    fetchLoadStats(userId)
  ]);

  if (!task || !user) throw new Error('Evaluation context missing');
  return { task, user, totalTasks, similarTasksCount, userHistory, pairTransactions, ...loadStats };
}

export async function calculateAlgorithmS(ctx: EvaluationContext) {
  const stats = await fetchObjectiveStats(ctx);
  const { task, user } = stats;

  // --- 1. Objective Factors (The components of V_base) ---

  const Wu = 1 + 0.5 * (1 - (stats.similarTasksCount / (stats.totalTasks || 1)));
  const rd = stats.userHistory.filter(t => t.requesterId === ctx.requesterId).length / (stats.userHistory.length || 1);
  const Wd = 1 - 0.3 * rd;
  const roleMultipliers: Record<string, number> = { 'PLAYER': 1.0, 'LEADER': 1.1, 'SPECIALIST': 1.15, 'MANAGER': 1.2 };
  const Pc = roleMultipliers[user.role.toUpperCase()] || 1.0;
  const Q = 0.8 + 0.1 * (ctx.rating - 1);
  const r_recurrence = stats.pairTransactions / (stats.userHistory.length || 1);
  const Ac = r_recurrence > 0.6 ? 0.5 : (r_recurrence > 0.3 ? 0.8 : 1.0);
  const Aa = 1 + 0.3 * Math.sqrt(stats.L / (stats.L_base || 1));
  
  const X_base = 1 + (0.2 * task.outputs) + (0.3 * task.branches) + (0.3 * task.skillCount) + (0.5 * task.externalCount);
  const X_adj = clamp(0.8, 1 + 0.3 * (ctx.actualHours / (task.expectedHours || 1) - 1), 1.2);
  const D = ctx.actualHours * X_base * X_adj;
  const Df = clamp(1.0, 1 + 0.1 * ((D - 50) / 50), 1.5);
  const Sf = clamp(0.8, 1 + 0.2 * ((task.requiredSkill / (user.skillLevel || 1.0)) - 1), 1.2);
  const Eb = 1 + clamp(-0.1, 0.5 * (task.expectedHours / ctx.actualHours - 1), 0.2);

  // --- 2. V_base and V Construction ---
  
  // V_base = Wu * Ac * Wd * Aa * Df * Sf * Eb * Pc * Q
  const V_base = Wu * Ac * Wd * Aa * Df * Sf * Eb * Pc * Q;
  const V_rev = 0.1 * Math.log(1 + task.baseReward);
  const V = V_base + V_rev;

  // --- 3. Efficiency Framework (Ec) ---

  const C_eval = (2000 * ctx.actualHours) + ctx.expenses;
  const Ec = V / (C_eval || 1);
  const f_Ec = 1 + 0.1 * Math.log(1 + Ec);

  // --- 4. Final Score (S) ---
  const Rr = getRankCorrection(user.rank);
  const S = V * f_Ec * Rr;

  return {
    finalScore: parseFloat(S.toFixed(4)),
    factors: { Wu, Ac, Wd, Aa, Df, Sf, Eb, Pc, Q, V, Ec, f_Ec, Rr }
  };
}

export function getRankThreshold(n: number): number {
  return 100 * Math.pow(1.2, n);
}

export function determineRankChange(currentRank: string, sMonth: number): { nextRank: string, action: 'PROMOTE' | 'DEMOTE' | 'STAY' } {
  const ranks = ['D', 'C', 'B', 'A'];
  const currentIndex = ranks.indexOf(currentRank.toUpperCase());
  if (currentIndex === -1) return { nextRank: 'D', action: 'STAY' };
  
  const Tr = getRankThreshold(currentIndex);
  if (sMonth >= Tr && currentIndex < ranks.length - 1) return { nextRank: ranks[currentIndex + 1], action: 'PROMOTE' };
  if (sMonth < 0.7 * Tr && currentIndex > 0) return { nextRank: ranks[currentIndex - 1], action: 'DEMOTE' };
  return { nextRank: currentRank, action: 'STAY' };
}

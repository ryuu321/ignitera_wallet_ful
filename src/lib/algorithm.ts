/**
 * Algorithm S - Final Production Specification (v2.0)
 * behavioral evaluation logic for ecosystem health and fair reward.
 */

export interface TaskComplexityParams {
  n_o: number; // outputs
  n_b: number; // branches
  n_s: number; // skill_count
  n_e: number; // external_count
}

export interface CalculationParams {
  // Base
  reward: number; // C_base
  redistribution_cost: number;
  
  // Execution Data
  actual_hours: number; // h_act
  expected_hours: number; // h_exp
  rating: number; // 1-5 scale (Q_base)
  
  // Complexity
  complexity: TaskComplexityParams;
  required_skill_level: number; // s_req
  user_skill_level: number; // s_usr
  
  // Context
  user_role: string; // PLAYER, MANAGER, etc.
  user_rank: string; // E, D, C, B, A, S
  
  // Statistical Inputs (for Percentile and Activity)
  all_task_freqs_30d: number[]; 
  t_freq: number; // frequency of current task type
  all_activity_L: number[]; // global activity units
  
  // Collusion/Network Health
  reliance_ratio: number; // r_d (max reliance on single requester)
  collusion_metrics: {
    r: number; // recurrence (same partner)
    c: number; // closed loop
    p: number; // price anomaly
  };
}

export function calculateAlgorithmS(params: CalculationParams) {
  const logs: string[] = [];
  const log = (msg: string) => logs.push(msg);

  // --- 1. Base Coin (C) ---
  const C = Math.max(0, params.reward - params.redistribution_cost);
  log(`C (Coin): ${C} (Reward: ${params.reward}, Cost: ${params.redistribution_cost})`);

  // --- 2. Complexity (X) & Difficulty (D) ---
  // X_base = 1 + 0.2*n_o + 0.3*n_b + 0.3*n_s + 0.5*n_e
  const X_base = 1 + 
    (0.2 * params.complexity.n_o) + 
    (0.3 * params.complexity.n_b) + 
    (0.3 * params.complexity.n_s) + 
    (0.5 * params.complexity.n_e);
  
  // X_adj = clamp(0.8, 1 + 0.3(h_act/h_exp - 1), 1.2)
  const X_adj = Math.min(1.2, Math.max(0.8, 1 + 0.3 * (params.actual_hours / params.expected_hours - 1)));
  
  const X = X_base * X_adj;
  
  // s = s_req / s_usr
  const s = params.required_skill_level / params.user_skill_level;
  
  // D = h * s * X
  const D = params.actual_hours * s * X;
  log(`D (Difficulty): ${D.toFixed(3)} (X: ${X.toFixed(2)}, s: ${s.toFixed(2)}, h: ${params.actual_hours})`);

  // --- 3. Reward Factors ---

  // Wu: Uniqueness (Percentile based)
  const freqs = [...params.all_task_freqs_30d].sort((a, b) => a - b);
  const rank = freqs.indexOf(params.t_freq);
  const percentile = freqs.length > 0 ? (rank / freqs.length) : 0;
  const Wu = 1 + 0.5 * (1 - percentile);
  log(`Wu (Uniqueness): ${Wu.toFixed(3)} (Percentile: ${percentile.toFixed(2)})`);

  // Pc: Position
  const Pc = params.user_role.toLowerCase() === "player" ? 1.0 : 1.15;
  log(`Pc (Position): ${Pc} (Role: ${params.user_role})`);

  // Q: Quality (0.8 + 0.1 * (rating - 1))
  const Q = 0.8 + 0.1 * (params.rating - 1);
  log(`Q (Quality): ${Q.toFixed(2)} (Rating: ${params.rating})`);

  // Aa: Activity
  const L = D * params.actual_hours * X; // L = D * h * X (#8)
  const L_base = params.all_activity_L.length > 0 
    ? params.all_activity_L.reduce((a, b) => a + b, 0) / params.all_activity_L.length 
    : 1;
  const Aa = 1 + 0.3 * (L / L_base);
  log(`Aa (Activity): ${Aa.toFixed(3)} (L: ${L.toFixed(1)}, L_base: ${L_base.toFixed(1)})`);

  // Rc: Rank Contribution
  const rankMultipliers: Record<string, number> = { E: 1.0, D: 1.05, C: 1.1, B: 1.15, A: 1.2, S: 1.3 };
  const R = rankMultipliers[params.user_rank.toUpperCase()] || 1.0;
  const D_avg = params.all_activity_L.length > 0 ? 10.0 : 1.0; // Assuming D_avg is needed from stats
  const D_f = 1 + 0.2 * (D - D_avg);
  const Rc = R * D_f;
  log(`Rc (Rank): ${Rc.toFixed(3)} (R: ${R}, D_f: ${D_f.toFixed(2)})`);

  // Eb: Efficiency Bonus (clamp(-0.1, 0.5 * (h_exp/h_act - 1), 0.2))
  const Eb_raw = 0.5 * (params.expected_hours / params.actual_hours - 1);
  const Eb = Math.min(0.2, Math.max(-0.1, Eb_raw));
  log(`Eb (Efficiency): ${Eb.toFixed(3)} (Raw: ${Eb_raw.toFixed(2)})`);

  // --- 4. Control Factors ---

  // Wd: Distribution (1 - 0.3 * r_d)
  const Wd = 1 - 0.3 * params.reliance_ratio;
  log(`Wd (Distribution): ${Wd.toFixed(3)} (r_d: ${params.reliance_ratio.toFixed(2)})`);

  // Ac: Anti-collusion (F = 0.4r + 0.4c + 0.2p)
  const F = (0.4 * params.collusion_metrics.r) + 
            (0.4 * params.collusion_metrics.c) + 
            (0.2 * params.collusion_metrics.p);
  let Ac = 1.0;
  if (F < 0.3) Ac = 1.0;
  else if (F < 0.6) Ac = 0.8;
  else Ac = 0.5;
  log(`Ac (Anti-collusion): ${Ac.toFixed(2)} (F: ${F.toFixed(2)})`);

  // --- 5. Final Score (S) ---
  // S = C * Wu * Wd * Pc * Q * Ac * Aa * Rc * (1 + Eb)
  const score = C * Wu * Wd * Pc * Q * Ac * Aa * Rc * (1 + Eb);
  log(`Final Score S: ${score.toFixed(2)}`);

  return {
    score: Number(score.toFixed(4)),
    factors: { C, Wu, Wd, Pc, Q, Aa, Rc, Eb, Ac, D, X },
    logs
  };
}

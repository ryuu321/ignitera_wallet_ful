"use client"

import React, { useState, useEffect } from 'react';
import { 
  User, ArrowLeft, Award, Zap, History, Brain, TrendingUp, LayoutDashboard, X, Calculator, ShieldCheck, Trophy, ArrowUpCircle, AlertTriangle, Info, ChevronRight, BarChart3, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);

  // Rank Constants (Matching lib/rank.ts & algorithm.ts)
  const RANK_LADDER = ['Z', 'Y', 'X', 'W', 'V', 'U', 'T', 'S', 'R', 'Q', 'P', 'O', 'N', 'M', 'L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const getPromotionThreshold = (rank: string) => {
    const n = RANK_LADDER.indexOf(rank);
    if (n <= 0) return 0;
    return Math.round(100 * Math.pow(1.20, n));
  };
  const getRankCorrection = (rank: string) => {
    const r_pos = RANK_LADDER.slice().reverse().indexOf(rank.toUpperCase()) + 1;
    return 1 + 0.003 * (13 - r_pos);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedUserId = localStorage.getItem('demo-user-id');
        const uRes = await fetch('/api/users');
        const uData = await uRes.json();
        let user = uData[0];
        if (savedUserId) user = uData.find((u: any) => u.id === savedUserId) || user;
        
        const txRes = await fetch('/api/kpi'); 
        const kpiData = await txRes.json();
        const myTx = kpiData.transactions?.filter((tx: any) => tx.toUserId === user?.id) || [];
        
        setCurrentUser(user);
        setHistory(myTx);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading || !currentUser) {
     return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: '#6366f1' }}>Syncing Neural Profile...</div>;
  }

  const currentIdx = RANK_LADDER.indexOf(currentUser.rank || 'Z');
  const nextRank = RANK_LADDER[currentIdx + 1];
  const trNext = nextRank ? getPromotionThreshold(nextRank) : 0;
  const mrCurrent = Math.round(getPromotionThreshold(currentUser.rank || 'Z') * 0.7);
  const progressPercent = nextRank ? Math.min(100, (currentUser.monthlyScore / trNext) * 100) : 100;
  const rankBonus = getRankCorrection(currentUser.rank);

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', color: 'white' }}>
      <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}><ArrowLeft size={20} color="#6366f1" /></div>
            <span className={styles.logoText}>Network Hub</span>
         </Link>
         
         <div style={{ marginTop: '30px', padding: '10px' }}>
            <div className={clsx("glass-card", styles.userProfileSummary)} style={{ padding: '24px', border: '1px solid #6366f1' }}>
               <div className={styles.avatar} style={{ width: '64px', height: '64px', fontSize: '1.8rem', background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}>{currentUser.anonymousName[0]}</div>
               <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>{currentUser.anonymousName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6366f1', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 'bold' }}>
                    <ShieldCheck size={14} />
                    <span>RANK-{currentUser.rank} / {currentUser.role}</span>
                  </div>
               </div>
            </div>

            <nav style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <Link href="/kpi" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                  <Trophy size={18} color="#fbbf24" />
                  <span style={{ fontSize: '0.85rem' }}>Global Leaderboard</span>
               </Link>
            </nav>
            
            <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '1px' }}>RECOVERY WINDOW</div>
               <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>18 Days to Cycle Reset</div>
               <div className={styles.progressBarWrapper} style={{ height: '4px', background: 'rgba(255,255,255,0.05)', marginTop: '10px' }}>
                    <div style={{ width: '60%', height: '100%', background: '#6366f1' }} />
               </div>
            </div>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-1.5px' }}>Neural <span style={{ color: '#6366f1' }}>Career Profile</span></h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: '1rem', marginTop: '4px' }}>Hierarchical position audit for internal network asset management.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
             <div className="glass-card" style={{ padding: '20px 30px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Month S</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '950', color: '#6366f1' }}>{currentUser.monthlyScore.toFixed(1)}</div>
             </div>
             <div className="glass-card" style={{ padding: '20px 30px', textAlign: 'center', border: '1px solid #10b981' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Lifetime S</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '950', color: '#10b981' }}>{currentUser.totalScore?.toFixed(1)}</div>
             </div>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '28px' }}>
            {/* Two-Layer Career Dashboard */}
            <div className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '10rem', fontWeight: '950', color: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }}>{currentUser.rank}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ArrowUpCircle color="#6366f1" size={24} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Competitive Rank</h3>
                    </div>
                    <button 
                      onClick={() => setShowDetail(!showDetail)}
                      style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#6366f1', borderRadius: '20px', padding: '6px 14px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
                    >
                      {showDetail ? <ChevronRight size={14} /> : <Info size={14} />}
                      {showDetail ? 'Brief Summary' : 'Deep Audit'}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                  {!showDetail ? (
                    <motion.div key="normal" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: '950', color: 'white', marginBottom: '10px' }}>{currentUser.rank}</div>
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                                <span style={{ fontWeight: 'bold' }}>Growth toward Rank-{nextRank || 'MAX'}</span>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{progressPercent.toFixed(1)}%</span>
                            </div>
                            <div className={styles.progressBarWrapper} style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ height: '100%', borderRadius: '6px', background: 'linear-gradient(90deg, #6366f1, #a855f7)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <Zap size={18} color="#fbbf24" fill="#fbbf24" />
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                                RANK BONUS ACTIVE: <span style={{ color: '#fbbf24' }}>x{rankBonus.toFixed(3)} S</span>
                            </div>
                        </div>
                    </motion.div>
                  ) : (
                    <motion.div key="detail" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>PROMOTION (Tr)</div>
                                <div style={{ fontSize: '1rem', fontWeight: '900' }}>{trNext} S</div>
                            </div>
                            <div className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>MAINTAIN (Mr)</div>
                                <div style={{ fontSize: '1rem', fontWeight: '900', color: '#f59e0b' }}>{mrCurrent} S</div>
                            </div>
                            <div className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>RANK MULTIPLIER (Rr)</div>
                                <div style={{ fontSize: '1rem', fontWeight: '900', color: '#6366f1' }}>x{rankBonus.toFixed(3)}</div>
                            </div>
                            <div className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>SKILL LEVEL (Sf)</div>
                                <div style={{ fontSize: '1rem', fontWeight: '900', color: '#a855f7' }}>{currentUser.skillLevel?.toFixed(2)}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                            Algorithm S v2.0 Final Spec Integration. Score calculation utilizes active position Pc, COLLUSION-INDEX F ({currentUser.graceMonths > 0 ? 'FAIL' : 'PASS'}), and DIFF-MAGNITUDE D.
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>

            {/* Performance DNA Card */}
            <div className="glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                    <BarChart3 color="#a855f7" size={24} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Evaluator DNA</h3>
                </div>
                <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                   {[65, 40, 85, 30, 95, 70, 50].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} style={{ flex: 1, background: i === 4 ? '#6366f1' : 'rgba(99, 102, 241, 0.2)', borderRadius: '4px' }} />
                   ))}
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '900' }}>x1.22</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>AVG WU</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '900' }}>0.94</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>AVG Q</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '900' }}>A-Tier</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>EFFICIENCY</div>
                    </div>
                </div>
            </div>

            {/* Audit History Table */}
            <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Activity color="#6366f1" size={24} />
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '900' }}>Career Auditor Ledger</h3>
                    </div>
                    <Link href="/kpi" style={{ fontSize: '0.8rem', color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' }}>All Network History →</Link>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <th style={{ padding: '16px' }}>Timestamp</th>
                        <th style={{ padding: '16px' }}>Rank (Rr)</th>
                        <th style={{ padding: '16px' }}>Diff (Df)</th>
                        <th style={{ padding: '16px' }}>Skill (Sf)</th>
                        <th style={{ padding: '16px' }}>Quality (Q)</th>
                        <th style={{ padding: '16px' }}>Coll (Ac)</th>
                        <th style={{ padding: '16px', color: 'white', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Final S</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length > 0 ? history.map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem' }}>
                          <td style={{ padding: '16px', opacity: 0.5, whiteSpace: 'nowrap' }}>{new Date(tx.timestamp).toLocaleString()}</td>
                          <td style={{ padding: '16px', color: '#6366f1', fontWeight: 'bold' }}>x{tx.rr?.toFixed(3)}</td>
                          <td style={{ padding: '16px' }}>x{tx.df?.toFixed(2)}</td>
                          <td style={{ padding: '16px', color: '#a855f7' }}>x{tx.sf?.toFixed(2)}</td>
                          <td style={{ padding: '16px', color: '#10b981' }}>x{tx.q?.toFixed(2)}</td>
                          <td style={{ padding: '16px', color: tx.ac < 0.9 ? '#f59e0b' : 'inherit' }}>{tx.ac < 1 ? 'Shielded' : 'Clean'}</td>
                          <td style={{ padding: '16px', fontWeight: '950', color: '#6366f1', borderLeft: '1px solid rgba(255,255,255,0.1)', fontSize: '1rem' }}>
                            {tx.finalScore?.toFixed(1)} <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>PTS</span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>No hierarchical data packets found. Complete missions to start climb.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}

"use client"

import React, { useState, useEffect } from 'react';
import { 
  User, 
  ArrowLeft, 
  Award, 
  Zap, 
  History, 
  Brain,
  TrendingUp,
  LayoutDashboard,
  X,
  Calculator,
  ShieldCheck,
  Trophy,
  ArrowUpCircle,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [masterSkills, setMasterSkills] = useState<any[]>([]);

  // Rank Constants (Matching lib/rank.ts)
  const RANK_LADDER = ['Z', 'Y', 'X', 'W', 'V', 'U', 'T', 'S', 'R', 'Q', 'P', 'O', 'N', 'M', 'L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const getPromotionThreshold = (rank: string) => {
    const n = RANK_LADDER.indexOf(rank);
    if (n <= 0) return 0;
    return Math.round(100 * Math.pow(1.20, n));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedUserId = localStorage.getItem('demo-user-id');
        const uRes = await fetch('/api/users');
        const uData = await uRes.json();
        
        let user = uData[0];
        if (savedUserId) {
          const found = uData.find((u: any) => u.id === savedUserId);
          if (found) user = found;
        }
        
        const txRes = await fetch('/api/kpi'); 
        const kpiData = await txRes.json();
        const myTx = kpiData.transactions?.filter((tx: any) => tx.toUserId === user?.id) || [];
        
        const sRes = await fetch('/api/skills');
        const sData = await sRes.json();
        setMasterSkills(sData);
        
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

  const skills = JSON.parse(currentUser.skills || '[]');
  const currentIdx = RANK_LADDER.indexOf(currentUser.rank || 'Z');
  const nextRank = RANK_LADDER[currentIdx + 1];
  const trNext = nextRank ? getPromotionThreshold(nextRank) : 0;
  const trCurrent = getPromotionThreshold(currentUser.rank || 'Z');
  const progressPercent = nextRank ? Math.min(100, (currentUser.monthlyScore / trNext) * 100) : 100;

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', color: 'white' }}>
      <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}><ArrowLeft size={20} color="#6366f1" /></div>
            <span className={styles.logoText}>Back to Hub</span>
         </Link>
         
         <div style={{ marginTop: '30px', padding: '10px' }}>
            <div className={clsx("glass-card", styles.userProfileSummary)} style={{ padding: '20px', border: '1px solid #6366f1' }}>
               <div className={styles.avatar} style={{ width: '64px', height: '64px', fontSize: '1.8rem', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>{currentUser.anonymousName[0]}</div>
               <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '900', fontSize: '1.3rem' }}>{currentUser.anonymousName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6366f1', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} />
                    <span>RANK-{currentUser.rank} / LV.{(currentUser.skillLevel || 1.0).toFixed(1)}</span>
                  </div>
               </div>
            </div>

            <Link href="/kpi" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
               <Trophy size={18} color="#fbbf24" />
               <span style={{ fontSize: '0.85rem' }}>Global Analytics</span>
            </Link>
            
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>MONTHLY CAREER RESET</div>
               <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>22 Days Remaining</div>
               <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: '70%', height: '100%', background: '#6366f1' }} />
               </div>
            </div>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Network <span style={{ color: '#6366f1' }}>Career Stats</span></h1>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Analysis of your Z $\rightarrow$ A hierarchical progression for {currentUser.anonymousName}.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="glass-card" style={{ padding: '15px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Monthly Score (S_m)</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#6366f1' }}>{currentUser.monthlyScore.toFixed(1)}</span>
            </div>
            <div className="glass-card" style={{ padding: '15px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #10b981' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Lifetime S</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10b981' }}>{currentUser.evaluationScore?.toFixed(1)}</span>
            </div>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Rank Career Module */}
            <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '8rem', fontWeight: '900', color: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }}>{currentUser.rank}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <ArrowUpCircle color="#6366f1" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Hierarchical Ladder</h3>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Progress to Rank-{nextRank || 'MAX'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{currentUser.monthlyScore.toFixed(0)} / {trNext} S</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', boxShadow: '0 0 10px #6366f1' }} />
                    </div>
                    {progressPercent >= 100 ? (
                        <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <ShieldCheck size={12} /> PROMOTION ELIGIBLE (Waiting for Month End)
                        </div>
                    ) : (
                        <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                            {(trNext - currentUser.monthlyScore).toFixed(0)} score required to climb.
                        </div>
                    )}
                </div>

                {currentUser.graceMonths > 0 && (
                    <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', color: '#f59e0b', fontSize: '0.75rem', display: 'flex', alignItems: 'start', gap: '10px' }}>
                        <AlertTriangle size={16} />
                        <div>
                            <strong>SOFT DEMOTION ACTIVE</strong><br/>
                            Below threshold for 1 month. Failing next month will trigger rank decay to {RANK_LADDER[currentIdx-1]}.
                        </div>
                    </div>
                )}
            </div>

            {/* Persona Indicator */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Brain color="#a855f7" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Operational DNA</h3>
                </div>
                <div style={{ position: 'relative', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '40px' }}>
                    <div style={{ position: 'absolute', top: '-25px', left: '0', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>MAKER-MODE</div>
                    <div style={{ position: 'absolute', top: '-25px', right: '0', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>STRATEGIST-MODE</div>
                    <div style={{ position: 'absolute', left: '72%', top: '-6px', width: '20px', height: '20px', background: '#a855f7', borderRadius: '50%', boxShadow: '0 0 15px #a855f7' }} />
                </div>
                <p style={{ marginTop: '30px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.7' }}>
                   Rank-{currentUser.rank} status identifies you as a <b>Scaling Leader</b>. Your career trajectory is accelerated by high-difficulty contributions.
                </p>
            </div>

            {/* History Table */}
            <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <History color="#6366f1" />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Career Contribution Ledger</h3>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Algorithm S Impact History</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px' }}>Date</th>
                        <th style={{ padding: '12px' }}>Factor Wu</th>
                        <th style={{ padding: '12px' }}>Factor Q</th>
                        <th style={{ padding: '12px' }}>Factor Df</th>
                        <th style={{ padding: '12px' }}>Factor Sf</th>
                        <th style={{ padding: '12px' }}>Factor Rf</th>
                        <th style={{ padding: '12px', color: 'white', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Score S</th>
                        <th style={{ padding: '12px' }}>Impact on Career</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.75rem' }}>
                          <td style={{ padding: '12px', whiteSpace: 'nowrap', opacity: 0.5 }}>{new Date(tx.timestamp).toLocaleDateString()}</td>
                          <td style={{ padding: '12px', color: '#6366f1' }}>x{tx.wu?.toFixed(2)}</td>
                          <td style={{ padding: '12px', color: '#10b981' }}>x{tx.q?.toFixed(1)}</td>
                          <td style={{ padding: '12px' }}>x{tx.df?.toFixed(2)}</td>
                          <td style={{ padding: '12px', color: '#a855f7' }}>x{tx.sf?.toFixed(2)}</td>
                          <td style={{ padding: '12px', color: '#fbbf24' }}>x{tx.rf?.toFixed(2)}</td>
                          <td style={{ padding: '12px', fontWeight: '900', color: '#6366f1', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                            {tx.finalScore?.toFixed(1)}
                          </td>
                          <td style={{ padding: '12px', color: '#10b981' }}>+{( (tx.finalScore/trNext)*100 ).toFixed(2)}% toward Rank-{nextRank}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}

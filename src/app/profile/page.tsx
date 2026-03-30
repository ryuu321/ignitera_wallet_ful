"use client"

import React, { useState, useEffect } from 'react';
import { 
  User, ArrowLeft, Award, Zap, History, Brain, TrendingUp, LayoutDashboard, X, Calculator, ShieldCheck, Trophy, ArrowUpCircle, AlertTriangle, Info, ChevronRight, BarChart3, Activity, Briefcase, Settings, CheckCircle2, PlusCircle
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
  const [masterSkills, setMasterSkills] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Rank Constants
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

  const fetchData = async () => {
    try {
      const savedUserId = localStorage.getItem('demo-user-id');
      const [uRes, sRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/skills')
      ]);
      const uData = await uRes.json();
      const sData = await sRes.json();
      let user = uData[0];
      if (savedUserId) user = uData.find((u: any) => u.id === savedUserId) || user;
      
      const txRes = await fetch('/api/kpi'); 
      const kpiData = await txRes.json();
      const myTx = kpiData.transactions?.filter((tx: any) => tx.toUserId === user?.id) || [];
      
      setCurrentUser(user);
      setHistory(myTx);
      setMasterSkills(sData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateProfile = async (updates: any) => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const toggleSkill = (skill: string) => {
    const currentSkills = JSON.parse(currentUser.skills || '[]');
    const nextSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s: string) => s !== skill)
      : [...currentSkills, skill];
    handleUpdateProfile({ skills: JSON.stringify(nextSkills) });
  };

  if (loading || !currentUser) {
     return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: '#6366f1' }}>Syncing Neural Profile DNA...</div>;
  }

  const currentIdx = RANK_LADDER.indexOf(currentUser.rank || 'Z');
  const nextRank = RANK_LADDER[currentIdx + 1];
  const trNext = nextRank ? getPromotionThreshold(nextRank) : 0;
  const progressPercent = nextRank ? Math.min(100, (currentUser.monthlyScore / trNext) * 100) : 100;
  const rankBonus = getRankCorrection(currentUser.rank);
  const mrCurrent = Math.round(getPromotionThreshold(currentUser.rank || 'Z') * 0.7);
  const userSkills = JSON.parse(currentUser.skills || '[]');

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', color: 'white', minHeight: '100vh' }}>
      <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}><ArrowLeft size={14} color="#6366f1" /></div>
            <span className={styles.logoText}>Back to Hub</span>
         </Link>
         
         <nav className={styles.navMenu} style={{ marginTop: '20px', padding: '0 10px' }}>
             <Link href="/" className={styles.navItem}><LayoutDashboard size={18} /> <span>Overview</span></Link>
             <Link href="/marketplace" className={styles.navItem}><Briefcase size={18} /> <span>Market</span></Link>
             <Link href="/kpi" className={styles.navItem}><BarChart3 size={18} /> <span>Analytics</span></Link>
             <Link href="/profile" className={clsx(styles.navItem, styles.navItemActive)}><User size={18} /> <span>Profile DNA</span></Link>
             <Link href="/settings" className={styles.navItem}><Settings size={18} /> <span>Settings</span></Link>
             <Link href="/algorithm" className={styles.navItem} style={{ marginTop: '10px' }}>
                <Calculator size={18} color="#6366f1" /> <span style={{ opacity: 0.6 }}>Evaluation Docs</span>
             </Link>
         </nav>

         <div style={{ marginTop: '20px', padding: '10px' }}>
            <div className={clsx("glass-card", styles.userProfileSummary)} style={{ padding: '24px', border: '1px solid #6366f1' }}>
               <div className={styles.avatar} style={{ width: '48px', height: '48px', fontSize: '1.4rem', background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)' }}>{currentUser.anonymousName[0]}</div>
               <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>{currentUser.anonymousName}</div>
                  <div style={{ fontSize: '0.65rem', color: '#6366f1', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 'bold' }}>
                    <ShieldCheck size={12} />
                    <span>RANK-{currentUser.rank} / {currentUser.role}</span>
                  </div>
               </div>
            </div>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-1.5px' }}>Neural <span style={{ color: '#6366f1' }}>Profile DNA</span></h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: '1rem', marginTop: '4px' }}>Behavioral traits and hierarchical standing matrix.</p>
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
            {/* Rank Layer */}
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

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                         <div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>CURRENT_TIER</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Level {currentUser.rank} / Z-A</div>
                         </div>
                         <div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>RANK_BONUS (Rr)</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbbf24' }}>x{rankBonus.toFixed(3)}</div>
                         </div>
                    </div>
                    {showDetail && (
                        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>PROMOTION (Tr)</div>
                                <div style={{ fontWeight: 'bold', color: '#6366f1' }}>{trNext} PTS</div>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>MAINTAIN (Mr)</div>
                                <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>{mrCurrent} PTS</div>
                            </div>
                        </div>
                    )}
                    <div style={{ marginTop: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Next: Rank {nextRank || '-'}</span>
                            <span style={{ fontWeight: 'bold' }}>{currentUser.monthlyScore.toFixed(0)} / {trNext} PTS</span>
                        </div>
                        <div className={styles.progressBarWrapper} style={{ height: '8px' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                className={styles.progressBar} 
                                style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Skill DNA Layer (Registration) */}
            <div className="glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Brain color="#a855f7" size={24} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Skill DNA Registration</h3>
                    </div>
                    <div className={styles.badge} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>Sf Optimizing</div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Mastery Baseline (Skill Level)</span>
                        <span style={{ fontWeight: '900', color: '#a855f7' }}>{currentUser.skillLevel.toFixed(2)} EMA</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="5.0" step="0.1" 
                      value={currentUser.skillLevel}
                      disabled={saving}
                      onChange={(e) => handleUpdateProfile({ skillLevel: parseFloat(e.target.value) })}
                      style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}
                    />
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '8px', lineHeight: '1.5' }}>
                        Sets your baseline competency. **Sf (Skill Factor)** bonus is triggered when you complete missions with <code>req_skill &gt; baseline</code>.
                    </p>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px', fontWeight: 'bold' }}>Active Skill Nodes</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '5px' }}>
                    {masterSkills.map(s => {
                        const isOwned = userSkills.includes(s.name);
                        return (
                            <button
                                key={s.id}
                                disabled={saving}
                                onClick={() => toggleSkill(s.name)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 12px', border: '1px solid',
                                    borderColor: isOwned ? '#a855f7' : 'rgba(255,255,255,0.1)',
                                    background: isOwned ? 'rgba(168, 85, 247, 0.1)' : 'none',
                                    color: isOwned ? 'white' : 'rgba(255,255,255,0.4)',
                                    borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isOwned ? <CheckCircle2 size={12} /> : <PlusCircle size={12} />}
                                {s.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Audit History (Small) */}
            <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <History color="#6366f1" size={24} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Recent Flux Audit</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                    {history.slice(0, 4).map((tx: any) => (
                        <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%' }} />
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Transaction Audit</div>
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Final S: {tx.finalScore.toFixed(1)}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: '900', color: '#6366f1' }}>+{tx.finalScore.toFixed(1)} S</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}

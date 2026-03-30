"use client"

import React, { useState, useEffect } from 'react';
import { 
  User, ArrowLeft, Award, Zap, History, Brain, TrendingUp, LayoutDashboard, X, Calculator, ShieldCheck, Trophy, ArrowUpCircle, AlertTriangle, Info, ChevronRight, BarChart3, Activity, Briefcase, Settings, CheckCircle2, PlusCircle, Star, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';

const GRADES = {
  GRAY: { color: '#94a3b8', label: 'Basic', bg: 'rgba(148, 163, 184, 0.1)' },
  BRONZE: { color: '#cd7f32', label: 'Bronze', bg: 'rgba(205, 127, 50, 0.1)' },
  SILVER: { color: '#c0c0c0', label: 'Silver', bg: 'rgba(192, 192, 192, 0.1)' },
  GOLD: { color: '#ffd700', label: 'Gold', bg: 'rgba(255, 215, 0, 0.1)' }
};

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [masterSkills, setMasterSkills] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedSkillNode, setSelectedSkillNode] = useState<string | null>(null);

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

  const handleCreateNewSkill = async () => {
    if (!newSkillName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSkillName.trim() }),
      });
      if (res.ok) {
        const newSkill = await res.json();
        setMasterSkills(prev => [...prev, newSkill]);
        setNewSkillName('');
        // Auto select for grade
        setSelectedSkillNode(newSkill.name);
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const setSkillGrade = (skillName: string, grade: string) => {
    let currentSkills = [];
    try {
        currentSkills = JSON.parse(currentUser.skills || '[]');
    } catch(e) { currentSkills = []; }
    
    // Normalize to objects if legacy
    if (currentSkills.length > 0 && typeof currentSkills[0] === 'string') {
        currentSkills = currentSkills.map((s: string) => ({ name: s, grade: 'GRAY' }));
    }

    const exists = currentSkills.find((s: any) => s.name === skillName);
    let nextSkills;
    if (exists) {
        if (grade === 'NONE') {
            nextSkills = currentSkills.filter((s: any) => s.name !== skillName);
        } else {
            nextSkills = currentSkills.map((s: any) => s.name === skillName ? { ...s, grade } : s);
        }
    } else if (grade !== 'NONE') {
        nextSkills = [...currentSkills, { name: skillName, grade }];
    } else {
        nextSkills = currentSkills;
    }
    
    handleUpdateProfile({ skills: JSON.stringify(nextSkills) });
    setSelectedSkillNode(null);
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
  
  let userSkills = [];
  try {
      userSkills = JSON.parse(currentUser.skills || '[]');
  } catch(e) { userSkills = []; }
  
  // Legacy migration check
  if (userSkills.length > 0 && typeof userSkills[0] === 'string') {
      userSkills = userSkills.map((s: string) => ({ name: s, grade: 'GRAY' }));
  }

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
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-1.5px' }}>Neural <span style={{ color: '#6366f1' }}>Profile DNA</span></h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: '1rem', marginTop: '4px' }}>Hierarchical standing & Grade-based expertise matrix.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
             <div className="glass-card" style={{ padding: '20px 30px', border: '1px solid #10b981' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Lifetime S</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '950', color: '#10b981' }}>{currentUser.totalScore?.toFixed(1)}</div>
             </div>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '28px' }}>
            {/* Competitive Rank Section */}
            <div className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '10rem', fontWeight: '950', color: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }}>{currentUser.rank}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                    <ArrowUpCircle color="#6366f1" size={24} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Competitive Rank</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                         <div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>CURRENT_TIER</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Level {currentUser.rank}</div>
                         </div>
                         <div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>RANK_BONUS</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbbf24' }}>x{rankBonus.toFixed(3)}</div>
                         </div>
                </div>
                <div style={{ marginTop: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Promotion Efficiency</span>
                        <span style={{ fontWeight: 'bold' }}>{currentUser.monthlyScore.toFixed(0)} / {trNext} PTS</span>
                    </div>
                    <div className={styles.progressBarWrapper} style={{ height: '8px' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
                    </div>
                </div>
            </div>

            {/* Graded Skill DNA registration */}
            <div className="glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Brain color="#a855f7" size={24} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Graded Expertise</h3>
                    </div>
                    <div className={styles.badge} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>Mastery Sync</div>
                </div>

                {/* Create New Skill Link */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <input 
                      type="text" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="Add missing talent..."
                      style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '0.8rem', outline: 'none' }}
                    />
                    <button onClick={handleCreateNewSkill} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#a855f7', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}><Plus size={20} /></button>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '15px', letterSpacing: '1px', fontWeight: 'bold' }}>Neural Skill Map</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {masterSkills.map(s => {
                        const userSkill = userSkills.find((us: any) => us.name === s.name);
                        const isOwned = !!userSkill;
                        const gradeInfo = isOwned ? (GRADES as any)[userSkill.grade] : null;
                        const isSelected = selectedSkillNode === s.name;

                        return (
                            <div key={s.id} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setSelectedSkillNode(isSelected ? null : s.name)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '6px 14px', border: '1px solid',
                                        borderColor: isOwned ? (gradeInfo?.color || '#a855f7') : 'rgba(255,255,255,0.05)',
                                        background: isOwned ? (gradeInfo?.bg || 'rgba(168, 85, 247, 0.1)') : 'rgba(255,255,255,0.01)',
                                        color: isOwned ? 'white' : 'rgba(255,255,255,0.3)',
                                        borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem',
                                        transition: 'all 0.2s', fontWeight: isOwned ? '800' : 'normal'
                                    }}
                                >
                                    {isOwned && <Star size={10} fill={gradeInfo?.color} color={gradeInfo?.color} />}
                                    {s.name}
                                </button>

                                <AnimatePresence>
                                {isSelected && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} 
                                        style={{ position: 'absolute', top: '100%', left: '0', zIndex: 10, marginTop: '10px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px', width: '220px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                    >
                                        <div style={{ width: '100%', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>SET PROFICIENCY GRADE</div>
                                        {Object.entries(GRADES).map(([key, config]) => (
                                            <button key={key} onClick={() => setSkillGrade(s.name, key)} style={{ background: config.bg, color: config.color, border: '1px solid', borderColor: config.color, fontSize: '0.65rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{config.label}</button>
                                        ))}
                                        <button onClick={() => setSkillGrade(s.name, 'NONE')} style={{ background: 'rgba(255,50,50,0.1)', color: '#ff4444', border: '1px solid #ff4444', fontSize: '0.65rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>REMOVE</button>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}

"use client"

import React, { useState, useEffect } from 'react';
import { 
  User, ArrowLeft, Award, Zap, History, Brain, TrendingUp, LayoutDashboard, X, Calculator, ShieldCheck, Trophy, ArrowUpCircle, AlertTriangle, Info, ChevronRight, BarChart3, Activity, Briefcase, Settings, CheckCircle2, PlusCircle, Star, Plus, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';
import { getRankColor } from '@/lib/colors';

const GRADES: any = {
  GRAY: { color: '#94a3b8', label: 'Basic (自己申告)', bg: 'rgba(148, 163, 184, 0.1)', selectable: true },
  BRONZE: { color: '#cd7f32', label: 'Bronze (システム認定)', bg: 'rgba(205, 127, 50, 0.1)', selectable: false, note: 'タスクの初回完了時に自動付与されます' },
  SILVER: { color: '#c0c0c0', label: 'Silver (熟練者)', bg: 'rgba(192, 192, 192, 0.1)', selectable: true, note: '実績に基づく手動認定が必要です' },
  GOLD: { color: '#ffd700', label: 'Gold (プロフェッショナル)', bg: 'rgba(255, 215, 0, 0.1)', selectable: true, note: '資格や確固たる証拠が必要です' }
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
        setSkillGrade(newSkill.name, 'GRAY');
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

  if (loading || !currentUser) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: '#6366f1' }}>プロフィール DNA を同期中...</div>;

  const currentIdx = RANK_LADDER.indexOf(currentUser.rank || 'Z');
  const nextRank = RANK_LADDER[currentIdx + 1];
  const trNext = nextRank ? getPromotionThreshold(nextRank) : 0;
  const progressPercent = nextRank ? Math.min(100, (currentUser.monthlyScore / trNext) * 100) : 100;
  const rankBonus = getRankCorrection(currentUser.rank);
  
  let userSkills = [];
  try {
      userSkills = JSON.parse(currentUser.skills || '[]');
  } catch(e) { userSkills = []; }
  
  if (userSkills.length > 0 && typeof userSkills[0] === 'string') {
      userSkills = userSkills.map((s: string) => ({ name: s, grade: 'GRAY' }));
  }

  const rankColor = getRankColor(currentUser.rank);

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', color: 'white', minHeight: '100vh', '--primary': rankColor } as any}>
      <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon} style={{ background: rankColor }}><Zap size={14} color="white" /></div>
            <span className={styles.logoText}>Ignitera <span style={{ color: rankColor }}>OS</span></span>
         </Link>
         
         <nav className={styles.navMenu}>
             <Link href="/" className={styles.navItem}><LayoutDashboard size={18} /> <span>概要</span></Link>
             <Link href="/marketplace" className={styles.navItem}><Briefcase size={18} /> <span>マーケットプレイス</span></Link>
             <Link href="/kpi" className={styles.navItem}><BarChart3 size={18} /> <span>アナリティクス</span></Link>
             <Link href="/profile" className={clsx(styles.navItem, styles.navItemActive)}><User size={18} /> <span>プロフィール DNA</span></Link>
             <Link href="/settings" className={styles.navItem}><Settings size={18} /> <span>設定</span></Link>
             <Link href="/algorithm" className={styles.navItem} style={{ marginTop: '10px', opacity: 0.8 }}>
                <Calculator size={18} color={rankColor} /> <span style={{ fontSize: '0.85rem' }}>アルゴリズム解説</span>
             </Link>
         </nav>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-1.5px' }}>ニューラル・<span style={{ color: rankColor }}>プロフィール DNA</span></h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: '1rem', marginTop: '4px' }}>現在の階級: {currentUser.rank} / 専門スキル・マトリクス</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
             <div className="glass-card" style={{ padding: '20px 30px', border: `1px solid ${rankColor}30` }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>生涯累計効率評価</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '950', color: rankColor }}>{currentUser.totalScore?.toFixed(1)} S</div>
             </div>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '28px' }}>
            <div className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden', borderBottom: `4px solid ${rankColor}` }}>
                <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '10rem', fontWeight: '950', color: `${rankColor}10`, pointerEvents: 'none' }}>{currentUser.rank}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                    <ArrowUpCircle color={rankColor} size={24} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>競争ランク</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                         <div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>現在の階層</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Level {currentUser.rank} / OS_{currentUser.rank}</div>
                         </div>
                         <div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>ランク補正 (Rr)</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbbf24' }}>x{rankBonus.toFixed(3)}</div>
                         </div>
                </div>
                <div style={{ marginTop: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>昇格までの進捗 {progressPercent.toFixed(0)}%</span>
                        <span style={{ fontWeight: 'bold' }}>{currentUser.monthlyScore.toFixed(0)} / {trNext} PTS</span>
                    </div>
                    <div className={styles.progressBarWrapper} style={{ height: '8px' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ width: `${progressPercent}%`, height: '100%', background: rankColor }} />
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '32px', borderLeft: `4px solid ${rankColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Brain color={rankColor} size={24} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>スキル DNA セット</h3>
                    </div>
                    <div className={styles.badge} style={{ background: `${rankColor}20`, color: rankColor }}>セルフ・マネジメント</div>
                </div>
                
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '25px', lineHeight: '1.5' }}>
                   Grayは自己申告、Bronzeはシステム自動認定です。熟練者(Silver/Gold)への昇格は実績に基づく手動審査が必要です。
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <input type="text" value={newSkillName} onChange={(e)=>setNewSkillName(e.target.value)} placeholder="新しい専門スキルを登録..." style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '0.85rem', outline: 'none' }} />
                    <button onClick={handleCreateNewSkill} style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: rankColor, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Plus size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {masterSkills.map(s => {
                        const userSkill = userSkills.find((us: any) => us.name === s.name);
                        const isOwned = !!userSkill;
                        const gradeInfo = isOwned ? (GRADES as any)[userSkill.grade] : null;
                        const isSelected = selectedSkillNode === s.name;

                        return (
                            <div key={s.id} style={{ position: 'relative' }}>
                                <button onClick={() => setSelectedSkillNode(isSelected ? null : s.name)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid', borderColor: isOwned ? (gradeInfo?.color || rankColor) : 'rgba(255,255,255,0.05)', background: isOwned ? (gradeInfo?.bg || `${rankColor}10`) : 'rgba(255,255,255,0.01)', color: isOwned ? 'white' : 'rgba(255,255,255,0.3)', borderRadius: '25px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s', fontWeight: isOwned ? '900' : 'normal' }}>
                                    {isOwned && <Star size={10} fill={gradeInfo?.color} color={gradeInfo?.color} />}
                                    {s.name}
                                </button>
                                <AnimatePresence>
                                {isSelected && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} style={{ position: 'absolute', top: '100%', left: '0', zIndex: 10, marginTop: '10px', background: '#0a0a14', border: `1px solid ${rankColor}30`, borderRadius: '15px', padding: '15px', width: '300px', boxShadow: '0 15px 35px rgba(0,0,0,0.7)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>習熟度グレードを選択</div>
                                            {Object.entries(GRADES).map(([key, config]: any) => (
                                                <button key={key} disabled={!config.selectable} onClick={() => setSkillGrade(s.name, key)} style={{ background: config.selectable ? config.bg : 'rgba(255,255,255,0.02)', color: config.selectable ? config.color : 'rgba(255,255,255,0.1)', border: '1px solid', borderColor: config.selectable ? config.color : 'rgba(255,255,255,0.1)', fontSize: '0.7rem', padding: '10px', borderRadius: '8px', cursor: config.selectable ? 'pointer' : 'not-allowed', fontWeight: 'bold', textAlign: 'left' }}>
                                                    {config.label}
                                                    {config.note && <div style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 'normal' }}>{config.note}</div>}
                                                </button>
                                            ))}
                                            <button onClick={() => setSkillGrade(s.name, 'NONE')} style={{ background: 'rgba(255,50,50,0.1)', color: '#ff4444', border: '1px solid #ff4444', fontSize: '0.7rem', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>このスキルを解除</button>
                                        </div>
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

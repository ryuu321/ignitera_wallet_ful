"use client"

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Zap, Briefcase, User, Calculator, ChevronDown, ChevronUp, Clock, Target, Layers, Cpu, Brain, ShieldCheck, Activity, Award, LayoutDashboard, Settings, Info, Search, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import styles from '../page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';
import { getRankColor } from '@/lib/colors';
import { RANK_LADDER } from '@/lib/rank';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function KPIPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'personal'>('company');
  const [data, setData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        const [kRes, uRes] = await Promise.all([
            fetch('/api/kpi'),
            fetch('/api/users')
        ]);
        const kData = await kRes.json();
        const uData = await uRes.json();
        
        setData(kData);
        setUsers(uData);
        
        const savedId = localStorage.getItem('demo-user-id');
        const user = savedId ? uData.find((u: any) => u.id === savedId) : uData[0];
        setCurrentUser(user || uData[0]);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchKPIData();
  }, []);

  const handleUserChange = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('demo-user-id', id);
    }
  };

  if (loading || !data || !currentUser) return <div style={{ height: '100vh', background: '#050511', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>組織知能を同期中...</div>;

  const rankColor = getRankColor(currentUser.rank);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: 'rgba(17, 24, 39, 0.9)', 
        padding: 12, titleColor: rankColor
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: 'rgba(255, 255, 255, 0.4)' } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.4)' } }
    }
  };

  const personalTxs = (data.transactions || []).filter((tx: any) => tx.toUserId === currentUser.id);
  
  const currentSkillLevel = currentUser.skillLevel || 1.0;
  const currentRankIndex = RANK_LADDER.indexOf(currentUser.rank || 'Z');
  const currentRr = 1.0 + (currentRankIndex * 0.1);

  const pAvg = personalTxs.length > 0 ? {
    wu: personalTxs.reduce((a:any,b:any)=>a+b.wu,0)/personalTxs.length,
    wd: personalTxs.reduce((a:any,b:any)=>a+b.wd,0)/personalTxs.length,
    q: personalTxs.reduce((a:any,b:any)=>a+b.q,0)/personalTxs.length,
    aa: personalTxs.reduce((a:any,b:any)=>a+b.aa,0)/personalTxs.length,
    df: personalTxs.reduce((a:any,b:any)=>a+b.df,0)/personalTxs.length,
    eb: personalTxs.reduce((a:any,b:any)=>a+(b.eb || 1),0)/personalTxs.length,
    ac: personalTxs.reduce((a:any,b:any)=>a+b.ac,0)/personalTxs.length,
    pc: personalTxs.reduce((a:any,b:any)=>a+b.pc,0)/personalTxs.length,
  } : data.avgFactors;

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', minHeight: '100vh', color: 'white', '--primary': rankColor } as any}>
       <aside className={styles.sidebar}>
          <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
             <div className={styles.logoIcon} style={{ background: rankColor }}><Zap size={14} color="white" /></div>
             <span className={styles.logoText}>Ignitera <span style={{ color: rankColor }}>OS</span></span>
          </Link>
          <nav className={styles.navMenu}>
             <Link href="/" className={styles.navItem}><LayoutDashboard size={18} /> <span>概要</span></Link>
             <Link href="/marketplace" className={styles.navItem}><Briefcase size={18} /> <span>マーケット</span></Link>
             <Link href="/kpi" className={clsx(styles.navItem, styles.navItemActive)}><BarChart3 size={18} /> <span>アナリティクス</span></Link>
             <Link href="/profile" className={styles.navItem}><User size={18} /> <span>プロフィール DNA</span></Link>
             <Link href="/settings" className={styles.navItem}><Settings size={18} /> <span>設定</span></Link>
          </nav>
          <div style={{ flex: 1 }} />
          <div style={{ padding: '20px', margin: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>デモ・オペレータ切替</div>
             <select value={currentUser.id} onChange={(e) => handleUserChange(e.target.value)} style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.85rem' }}>
               {users.map(u => <option key={u.id} value={u.id} style={{ background: '#111' }}>{u.anonymousName}</option>)}
             </select>
          </div>
       </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-2px' }}>システム・<span style={{ color: rankColor }}>インテリジェンス</span></h1>
            <nav style={{ display: 'flex', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginTop: '24px' }}>
                <TabItem active={activeTab === 'company'} onClick={() => setActiveTab('company')} text="全社分析" color={rankColor} />
                <TabItem active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} text="個人分析" color={rankColor} />
            </nav>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'personal' && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="personal" style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '32px 0' }}>
                
                <section style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                   <div className="glass-card" style={{ padding: '32px' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>個人パフォーマンス因子 (平均/アセット)</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                         <div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', fontWeight: '950', letterSpacing: '1px' }}>キャリア資産 (蓄積系)</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                               <FactorInfo label="Sf (スキルDNA)" value={currentSkillLevel} color="#6366f1" isCumulative />
                               <FactorInfo label="Rr (ランク補正)" value={currentRr} color="#fbbf24" isCumulative />
                               <FactorInfo label="Aa (活動指標)" value={pAvg.aa} color="#a855f7" isCumulative />
                               <FactorInfo label="Wd (分散指数)" value={pAvg.wd} color="#22d3ee" isCumulative />
                               <FactorInfo label="Ac (耐癒着性)" value={pAvg.ac} color="#fbbf24" isCumulative />
                            </div>
                         </div>
                         <div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', fontWeight: '950', letterSpacing: '1px' }}>実行パフォーマンス (変動系)</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                               <FactorInfo label="Q (平均質)" value={pAvg.q} color="#10b981" />
                               <FactorInfo label="Eb (平均効率)" value={pAvg.eb} color="#22d3ee" />
                               <FactorInfo label="Wu (独自性)" value={pAvg.wu} color={rankColor} />
                               <FactorInfo label="Df (難易度)" value={pAvg.df} color="#ec4899" />
                               <FactorInfo label="Pc (役職期待)" value={pAvg.pc} color="#a855f7" />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="glass-card" style={{ padding: '32px', height: '420px', display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>直近スコア推移</h3>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <Line data={{
                           labels: personalTxs.slice(-10).map((tx: any) => new Date(tx.timestamp).toLocaleDateString()),
                           datasets: [{ label: 'Score S', data: personalTxs.slice(-10).map((tx: any) => tx.finalScore), borderColor: rankColor, backgroundColor: `${rankColor}20`, fill: true, tension: 0.4 }]
                        }} options={chartOptions} />
                      </div>
                   </div>
                </section>

                <div className="glass-card" style={{ padding: '32px' }}>
                   <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: '950' }}>あなたのミッション履歴</h3>
                   <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', marginBottom: '24px' }}>行をタップすると、アルゴリズムの厳密な算出変数を可視化します。</p>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {personalTxs.map((tx: any) => (
                        <div key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                          <div 
                            onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                            style={{ 
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                              padding: '24px', cursor: 'pointer', background: expandedTx === tx.id ? 'rgba(255,255,255,0.02)' : 'transparent',
                              borderRadius: '12px', transition: '0.2s'
                            }}
                          >
                             <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', width: '90px' }}>{new Date(tx.timestamp).toLocaleDateString()}</div>
                                <div style={{ fontWeight: '900', fontSize: '1rem', width: '80px' }}>₲{tx.amount}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ fontSize: '0.8rem', padding: '6px 14px', background: `${rankColor}20`, color: rankColor, borderRadius: '8px', fontWeight: '950', border: `1px solid ${rankColor}30` }}>
                                        S: {tx.finalScore.toFixed(1)}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <Badge label={`Wu ${tx.wu.toFixed(1)}`} color={rankColor} />
                                        <Badge label={`Q ${tx.q.toFixed(1)}`} color="#10b981" />
                                        <Badge label={`Eb ${(tx.eb || 1).toFixed(1)}`} color="#22d3ee" />
                                        <Badge label={`Df ${tx.df.toFixed(1)}`} color="#ec4899" />
                                    </div>
                                </div>
                             </div>
                             {expandedTx === tx.id ? <ChevronUp size={16} opacity={0.5} /> : <ChevronDown size={16} opacity={0.5} />}
                          </div>

                          <AnimatePresence>
                            {expandedTx === tx.id && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                 <div style={{ padding: '0 32px 40px 144px' }}>
                                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '48px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                                           <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${rankColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                              <Terminal size={20} color={rankColor} />
                                           </div>
                                           <div>
                                              <h4 style={{ fontSize: '1.1rem', fontWeight: '950' }}>Audit Protocol: Algorithm-S v2.0 <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: '10px' }}>[HASH: {tx.id.substring(0,8)}]</span></h4>
                                           </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            <DetailSection 
                                                title="1. [Wu] Uniqueness Factor (独自性)" 
                                                formula="1 + max(0, 5 - log2(n_30d)) / 10" 
                                                variables={{ n_30d: tx.rawFrequency || '24 (AVG)' }}
                                                value={tx.wu} 
                                                color={rankColor} 
                                            />
                                            <DetailSection 
                                                title="2. [Wd] Distribution Factor (分散性)" 
                                                formula="1.0 - (max_share^2 * 0.2)" 
                                                variables={{ max_share: tx.rawMaxShare || '0.15' }}
                                                value={tx.wd} 
                                                color="#22d3ee" 
                                            />
                                            <DetailSection 
                                                title="3. [Pc] Expectation Multiplier (役職期待)" 
                                                formula="1.0 + RoleBonus" 
                                                variables={{ role_type: 'GENERAL' }}
                                                value={tx.pc} 
                                                color="#a855f7" 
                                            />
                                            <DetailSection 
                                                title="4. [Q] Quality Index (品質指数)" 
                                                formula="Evaluator Score (0.1 - 1.5)" 
                                                variables={{ rating_input: tx.q }}
                                                value={tx.q} 
                                                color="#10b981" 
                                            />
                                            <DetailSection 
                                                title="5. [Df] Task Difficulty (タスク難易度)" 
                                                formula="1.0 + (n_o*0.1) + (n_b*0.1) + (s_req/10)" 
                                                variables={{ n_o: tx.rawOutputs || 1, n_b: tx.rawBranches || 0, s_req: tx.rawRequiredSkill || 1.0 }}
                                                value={tx.df} 
                                                color="#ec4899" 
                                            />
                                            <DetailSection 
                                                title="6. [Sf] Skill Mastery (スキル習熟)" 
                                                formula="EMA_Skill_Level" 
                                                variables={{ current_ema: tx.sf }}
                                                value={tx.sf} 
                                                color="#6366f1" 
                                            />
                                            <DetailSection 
                                                title="7. [Eb] Execution Efficiency (実行効率)" 
                                                formula="1.0 + max(0, (expected - actual) / expected)" 
                                                variables={{ expected_h: tx.rawExpectedHours || 1.0, actual_h: tx.rawActualHours ? tx.rawActualHours.toFixed(2) : 'N/A' }}
                                                value={tx.eb || 1} 
                                                color="#10b981" 
                                            />
                                            <DetailSection 
                                                title="8. [Rr] Rank Correction (ランク補正)" 
                                                formula="1.0 + (rank_idx * 0.1)" 
                                                variables={{ rank_ladder_pos: RANK_LADDER.indexOf(currentUser.rank) }}
                                                value={tx.rr} 
                                                color="#fbbf24" 
                                            />
                                        </div>

                                        <div style={{ marginTop: '50px', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: `1px solid ${rankColor}30` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                                <h5 style={{ fontSize: '0.8rem', fontWeight: '950', color: rankColor, letterSpacing: '2px' }}>FINAL SETTLEMENT FORMULA</h5>
                                                <div style={{ fontSize: '1.8rem', fontWeight: '950' }}>{tx.finalScore.toFixed(3)} <span style={{ fontSize: '0.8rem', color: rankColor }}>S-POINTS</span></div>
                                            </div>
                                            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.8', wordBreak: 'break-all' }}>
                                                {tx.amount} (C) x {tx.wu} (Wu) x {tx.wd} (Wd) x {tx.pc} (Pc) x {tx.q} (Q) x {tx.ac} (Ac) x {tx.aa} (Aa) x ({tx.df} (Df) + {tx.sf} (Sf)) x {tx.eb || 1} (Eb) x {tx.rr} (Rr)
                                            </div>
                                        </div>
                                    </div>
                                 </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                   </div>
                </div>
            </motion.section>
          )}

          {activeTab === 'company' && (
             <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="company" style={{ padding: '32px 0' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                    <div className="glass-card" style={{ padding: '32px', height: '420px', display: 'flex', flexDirection: 'column' }}>
                       <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>役職別リソース分配 (₲)</h3>
                       <div style={{ flex: 1, position: 'relative' }}><Bar data={{ labels: data.roleLabels, datasets: [{ data: data.roleVolume, backgroundColor: [rankColor, '#a855f7', '#22d3ee', '#10b981'], borderRadius: 12 }] }} options={chartOptions} /></div>
                    </div>
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>全社平均評価因子</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {Object.entries(data.avgFactors || {}).map(([k, v]: any) => <FactorInfo key={k} label={k.toUpperCase()} value={v} color={rankColor} />)}
                        </div>
                    </div>
                 </div>
             </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function DetailSection({ title, formula, variables, value, color }: any) {
    return (
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '24px' }}>
            <div style={{ flex: 1 }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: '950', color, marginBottom: '8px' }}>{title}</h5>
                <div style={{ display: 'flex', gap: '15px', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                   <span>FORMULA: {formula}</span>
                </div>
            </div>
            <div style={{ width: '400px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(variables).map(([k, v]: any) => (
                        <div key={k} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.65rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: '5px' }}>{k}=</span>
                            <span style={{ fontWeight: 'bold' }}>{v}</span>
                        </div>
                    ))}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: '950', color, width: '80px', textAlign: 'right' }}>x{value.toFixed(2)}</div>
            </div>
        </div>
    );
}

function TabItem({ active, onClick, text, color }: any) {
    return (
        <button onClick={onClick} style={{ height: '50px', background: 'none', border: 'none', color: active ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '1.1rem', fontWeight: '950', cursor: 'pointer', position: 'relative', transition: '0.3s' }}>
            {text}
            {active && <motion.div layoutId="kpi-tab" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '3px', background: color, boxShadow: `0 0 20px ${color}` }} />}
        </button>
    );
}

function FactorInfo({ label, value, color, isCumulative = false }: any) {
  return (
    <div style={{ padding: '15px', background: isCumulative ? `${color}10` : 'rgba(255,255,255,0.02)', borderRadius: '12px', border: isCumulative ? `1px solid ${color}40` : `1px solid ${color}15` }}>
      <div style={{ fontSize: '0.65rem', color: isCumulative ? 'white' : 'rgba(255,255,255,0.4)', marginBottom: '5px', fontWeight: '900' }}>{label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: '950', color: color }}>x{value.toFixed(2)}</div>
    </div>
  );
}

function Badge({ label, color }: { label: string, color: string }) {
    return (
        <span style={{ fontSize: '0.65rem', padding: '4px 10px', borderRadius: '6px', background: `${color}15`, color: color, fontWeight: 'bold', border: `1px solid ${color}30` }}>
            {label}
        </span>
    );
}

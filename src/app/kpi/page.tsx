"use client"

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Zap, Briefcase, User, Calculator, ChevronDown, ChevronUp, Clock, Target, Layers, Cpu, Brain, ShieldCheck, Activity, Award
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
        borderColor: 'rgba(255, 255, 255, 0.1)', 
        borderWidth: 1, padding: 12, titleColor: rankColor
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: 'rgba(255, 255, 255, 0.4)' } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.4)', autoSkip: true, maxTicksLimit: 7 } }
    }
  };

  // --- Company Data ---
  const companyBarData = {
    labels: data.roleLabels || ['ADMIN', 'PLAYER', 'MANAGER', 'LEADER'],
    datasets: [{
      label: '流通量 (₲)',
      data: data.roleVolume || [0, 0, 0, 0],
      backgroundColor: [rankColor, '#a855f7', '#22d3ee', '#10b981'],
      borderRadius: 8
    }]
  };

  const companyAvg = data.avgFactors || {
    wu: 1, wd: 1, pc: 1, q: 1, ac: 1, aa: 1, df: 1, sf: 1, eb: 1, rr: 1
  };

  // --- Personal Data ---
  const personalTxs = (data.transactions || []).filter((tx: any) => tx.toUserId === currentUser.id);
  
  // Accumulated Factors (Individual Mastery)
  const currentSkillLevel = currentUser.skillLevel || 1.0;
  const currentRankIndex = RANK_LADDER.indexOf(currentUser.rank || 'Z');
  const currentRr = 1.0 + (currentRankIndex * 0.1); // Logical approximation of Rr

  // Fluctuating Factors (Averages)
  const personalAvg = personalTxs.length > 0 ? {
    wu: personalTxs.reduce((a:any,b:any)=>a+b.wu,0)/personalTxs.length,
    wd: personalTxs.reduce((a:any,b:any)=>a+b.wd,0)/personalTxs.length,
    q: personalTxs.reduce((a:any,b:any)=>a+b.q,0)/personalTxs.length,
    aa: personalTxs.reduce((a:any,b:any)=>a+b.aa,0)/personalTxs.length,
    df: personalTxs.reduce((a:any,b:any)=>a+b.df,0)/personalTxs.length,
    eb: personalTxs.reduce((a:any,b:any)=>a+(b.eb || 1),0)/personalTxs.length,
    ac: personalTxs.reduce((a:any,b:any)=>a+b.ac,0)/personalTxs.length,
  } : companyAvg;

  const personalLineData = {
    labels: personalTxs.slice(-10).map((tx: any) => new Date(tx.timestamp).toLocaleDateString()),
    datasets: [{
        label: '取得スコア (S)',
        data: personalTxs.slice(-10).map((tx: any) => tx.finalScore),
        borderColor: rankColor,
        backgroundColor: `${rankColor}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 4
    }]
  };

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
             <Link href="/algorithm" className={styles.navItem} style={{ marginTop: '10px', opacity: 0.8 }}>
                <Calculator size={18} color={rankColor} /> <span style={{ fontSize: '0.85rem' }}>アルゴリズム解説</span>
             </Link>
          </nav>

          <div style={{ flex: 1 }} />
          
          <div style={{ padding: '20px', margin: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px', letterSpacing: '1px' }}>デモ・オペレーター切替</div>
             <select 
               value={currentUser.id} 
               onChange={(e) => handleUserChange(e.target.value)}
               style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: '900' }}
             >
               {users.map(u => <option key={u.id} value={u.id} style={{ background: '#111' }}>{u.anonymousName} (ランク-{u.rank})</option>)}
             </select>
          </div>
       </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-2px' }}>システム・<span style={{ color: rankColor }}>インテリジェンス</span></h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>{activeTab === 'company' ? '組織全体におけるニューラル・キャリア・エコシステムの深層分析。' : '個人の行動因子とキャリア成長軌跡の多角的な解析。'}</p>
          </div>
          <nav style={{ display: 'flex', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginTop: '24px' }}>
            <TabItem active={activeTab === 'company'} onClick={() => setActiveTab('company')} text="全社分析" color={rankColor} />
            <TabItem active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} text="個人分析" color={rankColor} />
          </nav>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'company' ? (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="company">
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '32px', padding: '32px 0' }}>
                  <div className="glass-card" style={{ padding: '32px', height: '420px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '900' }}>役職別リソース分配状況 (₲)</h3>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Bar data={companyBarData} options={chartOptions} />
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '900' }}>全社平均アルゴリズム因子 (Matrix-S)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <FactorInfo label="Wu (独自性)" value={companyAvg.wu} color={rankColor} />
                      <FactorInfo label="Wd (分散性)" value={companyAvg.wd} color="#22d3ee" />
                      <FactorInfo label="Q (クオリティ)" value={companyAvg.q} color="#10b981" />
                      <FactorInfo label="Aa (活動指標)" value={companyAvg.aa} color="#a855f7" />
                      <FactorInfo label="Df (難易度)" value={companyAvg.df} color="#ec4899" />
                      <FactorInfo label="Sf (スキル習熟)" value={companyAvg.sf} color="#6366f1" />
                      <FactorInfo label="Eb (効率性)" value={companyAvg.eb} color="#10b981" />
                      <FactorInfo label="Rr (ランク補正)" value={companyAvg.rr} color="#fbbf24" />
                    </div>
                  </div>
                </section>
            </motion.section>
          ) : (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="personal" style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '32px 0' }}>
                <section style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                   <div className="glass-card" style={{ padding: '32px' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>個人パフォーマンス因子</h3>
                      
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '12px', letterSpacing: '1.5px', fontWeight: '900' }}>蓄積系因子 (個人の資質/資産)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                           <FactorInfo label="Sf (スキル資産)" value={currentSkillLevel} color="#6366f1" isCumulative />
                           <FactorInfo label="Rr (ランク資産)" value={currentRr} color="#fbbf24" isCumulative />
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '12px', letterSpacing: '1.5px', fontWeight: '900' }}>変動系因子 (平均パフォーマンス)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                           <FactorInfo label="Q (平均質)" value={personalAvg.q} color="#10b981" />
                           <FactorInfo label="Eb (平均効率)" value={personalAvg.eb} color="#22d3ee" />
                           <FactorInfo label="Wu (平均独自性)" value={personalAvg.wu} color={rankColor} />
                           <FactorInfo label="Df (平均難易度)" value={personalAvg.df} color="#ec4899" />
                        </div>
                      </div>
                   </div>

                   <div className="glass-card" style={{ padding: '32px', height: '420px', display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>直近 10 件のスコア推移</h3>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <Line data={personalLineData} options={chartOptions} />
                      </div>
                   </div>
                </section>

                <div className="glass-card" style={{ padding: '32px' }}>
                   <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: '950' }}>あなたのミッション履歴</h3>
                   <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', marginBottom: '24px' }}>行をタップすると、アルゴリズムによる評価因子の詳細を確認できます。</p>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {personalTxs.map((tx: any) => (
                        <div key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <div 
                            onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                            style={{ 
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                              padding: '24px', cursor: 'pointer', background: expandedTx === tx.id ? 'rgba(255,255,255,0.02)' : 'transparent',
                              borderRadius: '12px', transition: '0.2s'
                            }}
                          >
                             <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', width: '100px' }}>{new Date(tx.timestamp).toLocaleDateString()}</div>
                                <div style={{ fontWeight: '900', fontSize: '1rem' }}>₲{tx.amount}</div>
                                <div style={{ fontSize: '0.75rem', padding: '4px 12px', background: `${rankColor}15`, color: rankColor, borderRadius: '6px', fontWeight: 'bold' }}>S: {tx.finalScore.toFixed(1)}</div>
                             </div>
                             {expandedTx === tx.id ? <ChevronUp size={18} opacity={0.3} /> : <ChevronDown size={18} opacity={0.3} />}
                          </div>

                          <AnimatePresence>
                            {expandedTx === tx.id && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                              >
                                 <div style={{ padding: '0 24px 32px 144px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
                                    <MiniFactor label="Wu (独自)" value={tx.wu} color={rankColor} />
                                    <MiniFactor label="Wd (分散)" value={tx.wd} color="#22d3ee" />
                                    <MiniFactor label="Pc (役職)" value={tx.pc} color="#a855f7" />
                                    <MiniFactor label="Q (質)" value={tx.q} color="#10b981" />
                                    <MiniFactor label="Ac (癒着)" value={tx.ac} color="#fbbf24" />
                                    <MiniFactor label="Aa (活動)" value={tx.aa} color={rankColor} />
                                    <MiniFactor label="Df (難易)" value={tx.df} color="#ec4899" />
                                    <MiniFactor label="Sf (能書)" value={tx.sf} color="#6366f1" />
                                    <MiniFactor label="Eb (効率)" value={tx.eb || 1} color="#10b981" />
                                    <MiniFactor label="Rr (階層)" value={tx.rr} color="#fbbf24" />
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
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabItem({ active, onClick, text, color }: any) {
    return (
        <button onClick={onClick} style={{ height: '50px', background: 'none', border: 'none', color: active ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '1.05rem', fontWeight: '950', cursor: 'pointer', position: 'relative', transition: '0.3s', letterSpacing: '-0.5px' }}>
            {text}
            {active && <motion.div layoutId="kpi-tab" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '3px', background: color, boxShadow: `0 0 15px ${color}` }} />}
        </button>
    );
}

function FactorInfo({ label, value, color, isCumulative = false }: any) {
  return (
    <div style={{ padding: '15px', background: isCumulative ? `${color}08` : 'rgba(255,255,255,0.02)', borderRadius: '12px', border: isCumulative ? `1px solid ${color}30` : `1px solid ${color}10` }}>
      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>{label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: color }}>x{value.toFixed(2)}</div>
    </div>
  );
}

function MiniFactor({ label, value, color }: any) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: `1px solid ${color}15` }}>
      <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: '900', color: color }}>x{value.toFixed(2)}</div>
    </div>
  );
}

function Badge({ label, color }: { label: string, color: string }) {
    return (
        <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', background: `${color}15`, color: color, fontWeight: 'bold', border: `1px solid ${color}30` }}>
            {label}
        </span>
    );
}

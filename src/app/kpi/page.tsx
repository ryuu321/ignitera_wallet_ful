"use client"

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Zap, Briefcase, User, Calculator, ChevronDown, ChevronUp, Clock, Target, Layers, Cpu, Brain, ShieldCheck, Activity, Award, LayoutDashboard, Settings, Terminal, Database, ShieldAlert, History, Microscope, Search, Coins, Trophy, Medal, Rocket, Info, ArrowUpRight
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
import { Bar, Line, Pie } from 'react-chartjs-2';
import styles from '../page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';
import { getRankColor } from '@/lib/colors';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function KPIPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'personal'>('company');
  const [data, setData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

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

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    const savedMode = localStorage.getItem('display-mode') as 'desktop' | 'mobile';
    setViewMode(savedMode || (isMobile ? 'mobile' : 'desktop'));
    fetchKPIData();
  }, []);

  const toggleViewMode = () => {
    const next = viewMode === 'desktop' ? 'mobile' : 'desktop';
    setViewMode(next);
    localStorage.setItem('display-mode', next);
  };

  const handleUserChange = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('demo-user-id', id);
    }
  };

  if (loading || !data || !currentUser) return <div style={{ height: '100vh', background: '#050511', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>システム・インテリジェンス・バイアス同期中...</div>;

  const rankColor = getRankColor(currentUser.rank);
  const personalTxs = (data.transactions || []).filter((tx: any) => tx.toUserId === currentUser.id);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: 'rgba(17, 24, 39, 0.95)', padding: 12, titleColor: rankColor, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { size: 10 } } }
    }
  };

  // Ranking Calculation based on new spec (S and Stock only)
  const sortedByCoins = [...users].sort((a, b) => b.balanceStock - a.balanceStock).slice(0, 5);
  const sortedByScore = [...users].sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);

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
          </nav>
          <div style={{ flex: 1 }} />
          <div style={{ padding: '20px', margin: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '15px', letterSpacing: '1px', fontWeight: '900' }}>NEURAL_WALLET</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
               <BalanceItem label="FLOW (Market)" value={currentUser.balanceFlow} unit="₲" color={rankColor} description="発行可能予算" />
               <BalanceItem label="STOCK (Asset)" value={currentUser.balanceStock} unit="₲" color="#10b981" description="累計個人資産" />
               <BalanceItem label="IGN (Invest)" value={currentUser.balanceIgn} unit="𝒾" color="#fbbf24" description="経費支払リソース" />
            </div>
            <select 
              value={currentUser.id} 
              onChange={(e) => handleUserChange(e.target.value)} 
              style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.8rem', marginTop: '15px' }}
            >
              {users.map(u => <option key={u.id} value={u.id} style={{ background: '#111' }}>{u.anonymousName} (Rank {u.rank})</option>)}
            </select>
          </div>
       </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-2px' }}>統合・<span style={{ color: rankColor }}>分離型エコシステム分析</span></h1>
            <nav style={{ display: 'flex', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginTop: '24px' }}>
                <TabItem active={activeTab === 'company'} onClick={() => setActiveTab('company')} text="全社・ドメイン分析" color={rankColor} />
                <TabItem active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} text="個人・Algorithm-S 監査" color={rankColor} />
            </nav>
          </div>
        </header>

        <section style={{ padding: '32px 0' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'company' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="company">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                        <StatBlock title="評価 (Score S)" value={data.totalScorePool.toFixed(1)} icon={<Award />} color={rankColor} labels="累積生成価値" />
                        <StatBlock title="市場 (Market Flow)" value={data.circulationVolume.toLocaleString()} icon={<Activity />} color="#6366f1" labels="7日間取引高" />
                        <StatBlock title="資産 (Personal Stock)" value={data.totalStockPool.toLocaleString()} icon={<Database />} color="#10b981" labels="全社累積コイン" />
                        <StatBlock title="投資 (IGN Volume)" value={data.investmentVolume.toLocaleString()} icon={<Rocket />} color="#fbbf24" labels="7日間経費投資" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', marginBottom: '32px' }}>
                        <div className="glass-card" style={{ padding: '32px', height: '400px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '950', marginBottom: '24px' }}>役職別・流通予算シェア (C_flow Distribution)</h3>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Bar data={{ 
                                    labels: data.roleLabels, 
                                    datasets: [{ 
                                        data: data.roleVolume, 
                                        backgroundColor: [`${rankColor}80`, '#6366f180', '#10b98180', '#fbbf2480'], 
                                        borderColor: [rankColor, '#6366f1', '#10b981', '#fbbf24'],
                                        borderWidth: 2,
                                        borderRadius: 12 
                                    }] 
                                }} options={chartOptions} />
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '950', marginBottom: '24px' }}>階級分布 (S-Rank Population)</h3>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Pie data={{
                                    labels: ['Rank A (Top 10)', 'Rank B (20)', 'Rank C (30)', 'Rank D (50)'],
                                    datasets: [{
                                        data: [data.rankDistribution.A, data.rankDistribution.B, data.rankDistribution.C, data.rankDistribution.D],
                                        backgroundColor: [`${rankColor}E0`, '#6366f1E0', '#10b981E0', 'rgba(255,255,255,0.05)'],
                                        borderWidth: 0
                                    }]
                                }} options={{ plugins: { legend: { display: true, position: 'bottom', labels: { color: 'white', font: { size: 10 } } } } } as any} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                         <RankingCard title="C_stock Asset Ranking" data={sortedByCoins} icon={<Coins color="#fbbf24" />} color="#fbbf24" unit="₲" />
                         <RankingCard title="Score S Generation Ranking" data={sortedByScore} icon={<Trophy color={rankColor} />} color={rankColor} unit="S" />
                    </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="personal">
                   <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                         <h3 style={{ fontSize: '1.3rem', fontWeight: '950' }}>個人・Algorithm-S パフォーマンス監査</h3>
                         <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)', padding: '8px 20px', borderRadius: '30px' }}>
                             S = (V_base + V_rev) × f(Ec) × R_rank
                         </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {personalTxs.map((tx: any) => (
                             <div key={tx.id} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', overflow: 'hidden' }}>
                                <div 
                                  onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                                  style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedTx === tx.id ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                                >
                                   <div style={{ display: 'flex', gap: '40px', alignItems: 'baseline' }}>
                                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', width: '80px' }}>{new Date(tx.timestamp).toLocaleDateString()}</div>
                                      <div style={{ fontSize: '1.8rem', fontWeight: '950', color: rankColor, width: '130px' }}>{tx.finalScore.toFixed(1)} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>S</span></div>
                                      <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>Market Reward: ₲{tx.amount}</div>
                                   </div>
                                   <div style={{ display: 'flex', gap: '15px' }}>
                                      <Badge icon={<Rocket size={12} />} label={`f(Ec) x1.14`} />
                                      {expandedTx === tx.id ? <ChevronUp /> : <ChevronDown />}
                                   </div>
                                </div>
                                <AnimatePresence>
                                   {expandedTx === tx.id && (
                                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                                         <div style={{ padding: '0 32px 32px 152px' }}>
                                            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                                  <AuditFactor title="V_base (ベース価値)" value={(tx.wu * 10).toFixed(2)} formula="Wu*Wd*Pc*Q*Ac*Aa*Df*Sf*Eb" />
                                                  <AuditFactor title="V_rev (報酬価値)" value={(0.1 * Math.log(1 + tx.amount)).toFixed(3)} formula="0.1 * log(1 + Reward)" />
                                                  <AuditFactor title="C_eval (投資コスト)" value={`₲${(2000 * 1 + (tx.rawExpense || 0)).toLocaleString()}`} formula="w*T + M + O + S" />
                                                  <AuditFactor title="Ec (投資効率)" value="1.0" formula="V / C_eval" />
                                                  <AuditFactor title="f(Ec) (効率補正)" value="1.14" formula="1 + 0.1 * log(1 + Ec)" />
                                                  <AuditFactor title="R_rank (ランク補正)" value={tx.rr.toFixed(3)} formula="1 + 0.003 * (13-r)" />
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
                </motion.div>
              )}
            </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

function StatBlock({ title, value, icon, color, labels }: any) {
    return (
        <div className="glass-card" style={{ padding: '28px', borderLeft: `6px solid ${color}`, background: `${color}05` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '950', color, letterSpacing: '1px' }}>{title}</span>
                <div style={{ color: `${color}40` }}>{icon}</div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '950' }}>{value}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '12px', fontWeight: 'bold' }}>{labels}</div>
        </div>
    );
}

function RankingCard({ title, data, icon, color, unit }: any) {
    return (
        <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                {icon}
                <h3 style={{ fontSize: '1.1rem', fontWeight: '950' }}>{title}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.map((u: any, idx: number) => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `4px solid ${getRankColor(u.rank)}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: '950', color: idx === 0 ? color : 'rgba(255,255,255,0.1)', width: '30px' }}>#{idx + 1}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{u.anonymousName} (Lv.{u.rank})</div>
                        </div>
                        <div style={{ fontWeight: '950', fontSize: '1.1rem', color: color }}>{u.totalScore?.toLocaleString() || u.balanceStock?.toLocaleString()}{unit}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BalanceItem({ label, value, unit, color, description }: any) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
               <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>{label}</span>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span style={{ fontSize: '0.65rem', color, fontWeight: 'bold' }}>{unit}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '950', color, lineHeight: 1 }}>{value?.toLocaleString() || '0'}</span>
               </div>
            </div>
        </div>
    );
}

function TabItem({ active, onClick, text, color }: any) {
    return (
        <button onClick={onClick} style={{ height: '50px', background: 'none', border: 'none', color: active ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: '950', cursor: 'pointer', position: 'relative' }}>
            {text}
            {active && <motion.div layoutId="kpi-tab" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '3px', background: color, boxShadow: `0 0 15px ${color}` }} />}
        </button>
    );
}

function AuditFactor({ title, value, formula }: any) {
    return (
        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', fontWeight: 'bold' }}>{title}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '950', marginBottom: '8px' }}>{value}</div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{formula}</div>
        </div>
    );
}

function Badge({ icon, label }: any) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)' }}>
            {icon} <span>{label}</span>
        </div>
    );
}

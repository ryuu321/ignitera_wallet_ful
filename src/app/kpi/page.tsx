"use client"

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  ShieldAlert,
  Target,
  Zap,
  Award,
  Activity,
  History,
  LayoutDashboard,
  Settings,
  Briefcase,
  User,
  Calculator,
  PieChart,
  LineChart,
  ChevronRight
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
  
  const personalAvg = personalTxs.length > 0 ? {
    wu: personalTxs.reduce((a:any,b:any)=>a+b.wu,0)/personalTxs.length,
    wd: personalTxs.reduce((a:any,b:any)=>a+b.wd,0)/personalTxs.length,
    pc: personalTxs.reduce((a:any,b:any)=>a+b.pc,0)/personalTxs.length,
    q: personalTxs.reduce((a:any,b:any)=>a+b.q,0)/personalTxs.length,
    aa: personalTxs.reduce((a:any,b:any)=>a+b.aa,0)/personalTxs.length,
    df: personalTxs.reduce((a:any,b:any)=>a+b.df,0)/personalTxs.length,
    eb: personalTxs.reduce((a:any,b:any)=>a+b.eb,0)/personalTxs.length,
    rr: personalTxs.reduce((a:any,b:any)=>a+b.rr,0)/personalTxs.length,
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
        pointBackgroundColor: rankColor,
        pointBorderWidth: 2,
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
               style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.85rem' }}
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
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="glass-card" style={{ padding: '15px 25px', display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${rankColor}30` }}>
                <TrendingUp size={20} color={rankColor} />
                <div>
                   <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{activeTab === 'company' ? '組織全体の成長率' : '個人のパフォーマンス偏差'}</div>
                   <div style={{ fontWeight: 'bold' }}>{activeTab === 'company' ? '+24.8%' : '+12.5%'} の改善</div>
                </div>
             </div>
          </div>
        </header>

        <nav style={{ display: 'flex', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px' }}>
           <TabItem active={activeTab === 'company'} onClick={() => setActiveTab('company')} text="全社分析" color={rankColor} />
           <TabItem active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} text="個人分析" color={rankColor} />
        </nav>

        <AnimatePresence mode="wait">
          {activeTab === 'company' ? (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="company">
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '32px' }}>
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
                      <FactorInfo label="Pc (役職係数)" value={companyAvg.pc} color="#a855f7" />
                      <FactorInfo label="Q (クオリティ)" value={companyAvg.q} color="#10b981" />
                      <FactorInfo label="Ac (耐癒着性)" value={companyAvg.ac} color="#fbbf24" />
                      <FactorInfo label="Aa (活動指標)" value={companyAvg.aa} color={rankColor} />
                      <FactorInfo label="Df (難易度)" value={companyAvg.df} color="#ec4899" />
                      <FactorInfo label="Sf (スキル習熟)" value={companyAvg.sf} color="#6366f1" />
                    </div>
                  </div>
                </section>

                <div className="glass-card" style={{ padding: '32px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '900' }}>深層監査: 全社資産ログ</h3>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Total: {data.transactions?.length || 0} Records</div>
                   </div>
                   <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                            <th style={{ padding: '15px' }}>監査日時</th>
                            <th>対象者</th>
                            <th>基準額 (C)</th>
                            <th>最終評価 (S)</th>
                            <th>主要因子マトリクス</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.transactions || []).map((tx: any) => (
                            <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                              <td style={{ padding: '15px', color: 'rgba(255,255,255,0.4)' }}>{new Date(tx.timestamp).toLocaleDateString()}</td>
                              <td style={{ fontWeight: 'bold' }}>{tx.toUser?.anonymousName}</td>
                              <td style={{ opacity: 0.6 }}>₲{tx.amount}</td>
                              <td style={{ fontWeight: '900', color: rankColor }}>{tx.finalScore.toFixed(1)} S</td>
                              <td>
                                 <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                     <Badge label={`独 ${tx.wu}`} color={rankColor} />
                                     <Badge label={`質 ${tx.q}`} color="#10b981" />
                                     <Badge label={`効 ${tx.eb || 1}`} color="#10b981" />
                                     <Badge label={`難 ${tx.df}`} color="#ec4899" />
                                 </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
            </motion.section>
          ) : (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="personal" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <section style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                   <div className="glass-card" style={{ padding: '32px' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '900' }}>あなたのパフォーマンス因子</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <FactorInfo label="個人 Wu (独自性)" value={personalAvg.wu} color={rankColor} />
                        <FactorInfo label="個人 Q (質)" value={personalAvg.q} color="#10b981" />
                        <FactorInfo label="個人 Aa (活動)" value={personalAvg.aa} color="#a855f7" />
                        <FactorInfo label="個人 Eb (効率)" value={personalAvg.eb} color="#22d3ee" />
                      </div>
                      <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>個人ランク補正 (Rr)</div>
                         <div style={{ fontSize: '1.8rem', fontWeight: '950', color: rankColor }}>x{personalAvg.rr.toFixed(2)}</div>
                      </div>
                   </div>

                   <div className="glass-card" style={{ padding: '32px', height: '420px', display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '900' }}>直近 10 件のスコア推移</h3>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <Line data={personalLineData} options={chartOptions} />
                      </div>
                   </div>
                </section>

                <div className="glass-card" style={{ padding: '32px' }}>
                   <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '900' }}>あなたのミッション履歴</h3>
                   <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                            <th style={{ padding: '15px' }}>日時</th>
                            <th>取得 ₲</th>
                            <th>評価 S</th>
                            <th>パフォーマンス詳細 (Q / Eb / Df)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {personalTxs.map((tx: any) => (
                            <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                              <td style={{ padding: '15px', color: 'rgba(255,255,255,0.4)' }}>{new Date(tx.timestamp).toLocaleDateString()}</td>
                              <td style={{ fontWeight: 'bold' }}>₲{tx.amount}</td>
                              <td style={{ fontWeight: '900', color: rankColor }}>{tx.finalScore.toFixed(1)} S</td>
                              <td>
                                 <div style={{ display: 'flex', gap: '8px' }}>
                                     <Badge label={`質 x${tx.q.toFixed(2)}`} color="#10b981" />
                                     <Badge label={`効 x${(tx.eb || 1).toFixed(2)}`} color="#22d3ee" />
                                     <Badge label={`難 x${tx.df.toFixed(2)}`} color="#ec4899" />
                                 </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
        <button onClick={onClick} style={{ height: '50px', background: 'none', border: 'none', color: active ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: '900', cursor: 'pointer', position: 'relative', transition: '0.3s' }}>
            {text}
            {active && <motion.div layoutId="kpi-tab" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '3px', background: color, boxShadow: `0 0 10px ${color}` }} />}
        </button>
    );
}

function FactorInfo({ label, value, color }: any) {
  return (
    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${color}10` }}>
      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>{label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: color }}>x{value.toFixed(2)}</div>
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

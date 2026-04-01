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
  PieChart
} from 'lucide-react';
import { motion } from 'framer-motion';
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
      x: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.4)' } }
    }
  };

  const barData = {
    labels: data.roleLabels || ['ADMIN', 'PLAYER', 'MANAGER', 'LEADER'],
    datasets: [{
      label: '流通量 (₲)',
      data: data.roleVolume || [0, 0, 0, 0],
      backgroundColor: [rankColor, '#a855f7', '#22d3ee', '#10b981'],
      borderRadius: 8
    }]
  };

  const avg = data.avgFactors || {
    wu: 1, wd: 1, pc: 1, q: 1, ac: 1, aa: 1, df: 1, sf: 1, eb: 1, rr: 1
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
             <Link href="/marketplace" className={styles.navItem}><Briefcase size={18} /> <span>マーケットプレイス</span></Link>
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
            <h1 style={{ fontSize: '2.4rem', fontWeight: '950', letterSpacing: '-1.5px' }}>システム・<span style={{ color: rankColor }}>インテリジェンス</span></h1>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>組織全体におけるニューラル・キャリア・エコシステムの深層分析。</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
             <div className="glass-card" style={{ padding: '15px 25px', display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${rankColor}30` }}>
                <TrendingUp size={20} color={rankColor} />
                <div>
                   <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>組織全体の成長率</div>
                   <div style={{ fontWeight: 'bold' }}>+24.8% の改善</div>
                </div>
             </div>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px' }}>
          <div className="glass-card" style={{ padding: '32px', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', fontWeight: 'bold' }}>役職別リソース分配状況 (₲)</h3>
            <div style={{ flex: 1, position: 'relative' }}>
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>

          <div className="glass-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', fontWeight: 'bold' }}>アルゴリズム S 評価マトリクス (全社平均)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FactorInfo label="Wu (独自性)" value={avg.wu} color={rankColor} />
              <FactorInfo label="Wd (分散性)" value={avg.wd} color="#22d3ee" />
              <FactorInfo label="Pc (役職係数)" value={avg.pc} color="#a855f7" />
              <FactorInfo label="Q (クオリティ)" value={avg.q} color="#10b981" />
              <FactorInfo label="Ac (耐癒着性)" value={avg.ac} color="#fbbf24" />
              <FactorInfo label="Aa (活動指標)" value={avg.aa} color={rankColor} />
              <FactorInfo label="Df (難易度)" value={avg.df} color="#ec4899" />
              <FactorInfo label="Sf (スキル習熟)" value={avg.sf} color="#6366f1" />
              <FactorInfo label="Eb (効率性)" value={avg.eb} color="#10b981" />
              <FactorInfo label="Rr (ランク補正)" value={avg.rr} color="#fbbf24" />
            </div>
          </div>
        </section>

        <div className="glass-card" style={{ padding: '32px' }}>
           <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', fontWeight: 'bold' }}>深層監査: 階層的資産台帳</h3>
           <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                    <th style={{ padding: '15px' }}>監査日時</th>
                    <th>対象者 (User DNA)</th>
                    <th>基準額 (C)</th>
                    <th>最終評価 (S)</th>
                    <th>計算マトリクス (監査因子)</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.transactions || []).map((tx: any) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', verticalAlign: 'middle' }}>
                      <td style={{ padding: '15px', color: 'rgba(255,255,255,0.4)' }}>{new Date(tx.timestamp).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 'bold' }}>{tx.toUser?.anonymousName}</td>
                      <td style={{ opacity: 0.6 }}>₲{tx.amount}</td>
                      <td style={{ fontWeight: '900', color: rankColor }}>{tx.finalScore.toFixed(1)} S</td>
                      <td>
                         <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                             <Badge label={`独 ${tx.wu}`} color={rankColor} />
                             <Badge label={`分 ${tx.wd}`} color="#22d3ee" />
                             <Badge label={`役 ${tx.pc}`} color="#a855f7" />
                             <Badge label={`質 ${tx.q}`} color="#10b981" />
                             <Badge label={`防 ${tx.ac}`} color="#6366f1" />
                             <Badge label={`難 ${tx.df}`} color="#ec4899" />
                             <Badge label={`階 ${tx.rr}`} color="#fbbf24" />
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
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

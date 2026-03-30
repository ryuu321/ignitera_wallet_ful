"use client"

import React from 'react';
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
  User
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

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function KPIPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/kpi')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: 'rgba(17, 24, 39, 0.9)', 
        borderColor: 'rgba(255, 255, 255, 0.1)', 
        borderWidth: 1, padding: 12, titleColor: '#6366f1'
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: 'rgba(255, 255, 255, 0.4)' } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.4)' } }
    }
  };

  if (loading || !data) return <div style={{ height: '100vh', background: '#050511', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Synchronizing Organizational Intelligence...</div>;

  const barData = {
    labels: data.roleLabels || ['ADMIN', 'PLAYER', 'MANAGER', 'LEADER'],
    datasets: [{
      label: 'Volume (₲)',
      data: data.roleVolume || [0, 0, 0, 0],
      backgroundColor: ['#6366f1', '#a855f7', '#22d3ee', '#10b981'],
      borderRadius: 8
    }]
  };

  const avg = data.avgFactors || {
    wu: 1, wd: 1, pc: 1, q: 1, ac: 1, aa: 1, df: 1, sf: 1, eb: 1, rr: 1
  };

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', minHeight: '100vh', color: 'white' }}>
       <aside className={styles.sidebar}>
          <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
             <div className={styles.logoIcon}><ArrowLeft size={14} color="#6366f1" /></div>
             <span className={styles.logoText}>Back to Hub</span>
          </Link>
          
          <nav className={styles.navMenu} style={{ marginTop: '20px', padding: '0 10px' }}>
             <Link href="/" className={styles.navItem}><LayoutDashboard size={18} /> <span>Overview</span></Link>
             <Link href="/marketplace" className={styles.navItem}><Briefcase size={18} /> <span>Market</span></Link>
             <Link href="/kpi" className={clsx(styles.navItem, styles.navItemActive)}><BarChart3 size={18} /> <span>Analytics</span></Link>
             <Link href="/profile" className={styles.navItem}><User size={18} /> <span>Profile</span></Link>
             <Link href="/settings" className={styles.navItem}><Settings size={18} /> <span>Settings</span></Link>
          </nav>

          <div style={{ padding: '20px' }}>
             <div style={{ padding: '15px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '8px' }}>
                    <ShieldAlert size={14} />
                    <span>Audit Online</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>Algorithm S v2.0 Integrated</p>
             </div>
          </div>
       </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Algorithm <span style={{ color: '#6366f1' }}>Audit</span></h1>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Multi-layer hierarchical performance analytics</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div className="glass-card" style={{ padding: '12px 15px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Collusion (Ac)</span>
                <span style={{ display: 'block', fontSize: '1rem', fontWeight: '800', color: (avg.ac || 1) > 0.9 ? '#10b981' : '#f59e0b' }}>{(avg.ac || 1).toFixed(2)}</span>
            </div>
            <div className="glass-card" style={{ padding: '12px 15px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Uniqueness (Wu)</span>
                <span style={{ display: 'block', fontSize: '1rem', fontWeight: '800', color: '#6366f1' }}>{(avg.wu || 1).toFixed(2)}</span>
            </div>
            <div className="glass-card" style={{ padding: '12px 15px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Payload (Df)</span>
                <span style={{ display: 'block', fontSize: '1rem', fontWeight: '800' }}>{(avg.df || 1).toFixed(2)}</span>
            </div>
            <div className="glass-card" style={{ padding: '12px 15px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Rank Corr (Rr)</span>
                <span style={{ display: 'block', fontSize: '1rem', fontWeight: '800', color: '#fbbf24' }}>{(avg.rr || 1).toFixed(3)}</span>
            </div>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px', minHeight: '350px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <BarChart3 size={14} color="#6366f1" /> Capital Flux by Authority
                </h3>
                <div style={{ height: '250px' }}><Bar options={chartOptions} data={barData} /></div>
            </div>

            <div className="glass-card" style={{ padding: '24px', minHeight: '350px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Users size={14} color="#a855f7" /> Performance Tier Distribution
                </h3>
                <div style={{ height: '250px' }}>
                    <Pie data={{
                        labels: ['S-Tier (90+)', 'A-Tier (80-90)', 'B-Tier (70-80)', 'C-Tier (<70)'],
                        datasets: [{
                            data: data.qualityDistribution || [0, 0, 0, 0],
                            backgroundColor: ['#6366f1', '#a855f7', '#22d3ee', '#334155'],
                            borderWidth: 0
                        }]
                    }} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 10 } } } } }} />
                </div>
            </div>

          {/* SYSTEM WIDE AUDIT LOG - RESTORED C (BASE) */}
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity color="#6366f1" size={20} /> Hierarchical Asset Ledger
                </h3>
                <div style={{ fontSize: '0.65rem', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'rgba(255,255,255,0.4)' }}>
                    Displaying last 50 transactions • Audit v2.0
                </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <th style={{ padding: '15px' }}>Subject</th>
                    <th style={{ padding: '15px', color: '#6366f1' }}>C (Base)</th>
                    <th style={{ padding: '15px' }}>Wu</th>
                    <th style={{ padding: '15px' }}>Wd</th>
                    <th style={{ padding: '15px' }}>Pc</th>
                    <th style={{ padding: '15px' }}>Q</th>
                    <th style={{ padding: '15px' }}>Ac</th>
                    <th style={{ padding: '15px' }}>Aa</th>
                    <th style={{ padding: '15px' }}>Df</th>
                    <th style={{ padding: '15px' }}>Sf</th>
                    <th style={{ padding: '15px' }}>Eb</th>
                    <th style={{ padding: '15px', color: '#fbbf24' }}>Rr</th>
                    <th style={{ padding: '15px', color: 'white', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>S-Result</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions?.length > 0 ? data.transactions.map((tx: any) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.75rem' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '900' }}>{tx.toUser?.anonymousName}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{tx.toUser?.role}</div>
                      </td>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{tx.amount.toFixed(0)} ₲</td>
                      <td style={{ padding: '15px', color: '#6366f1' }}>{tx.wu?.toFixed(2)}</td>
                      <td style={{ padding: '15px', opacity: 0.5 }}>{tx.wd?.toFixed(2)}</td>
                      <td style={{ padding: '15px', opacity: 0.8 }}>{tx.pc?.toFixed(2)}</td>
                      <td style={{ padding: '15px', color: '#10b981' }}>{tx.q?.toFixed(1)}</td>
                      <td style={{ padding: '15px', color: tx.ac < 0.9 ? '#f59e0b' : 'inherit' }}>{tx.ac?.toFixed(2)}</td>
                      <td style={{ padding: '15px', color: '#22d3ee' }}>{tx.aa?.toFixed(2)}</td>
                      <td style={{ padding: '15px' }}>{tx.df?.toFixed(2)}</td>
                      <td style={{ padding: '15px', color: '#a855f7' }}>{tx.sf?.toFixed(2)}</td>
                      <td style={{ padding: '15px' }}>{tx.eb?.toFixed(2)}</td>
                      <td style={{ padding: '15px', color: '#fbbf24', fontWeight: 'bold' }}>{tx.rr?.toFixed(3)}</td>
                      <td style={{ padding: '15px', fontWeight: '950', color: '#6366f1', borderLeft: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
                        {tx.finalScore?.toFixed(1)}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={13} style={{ padding: '40px', textAlign: 'center', opacity: 0.3 }}>No neural flux recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FACTOR KEY */}
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            <div>
                <h4 style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}><Target size={16}/> Base Capital (C)</h4>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                    **C (Base Amount)** represents the agreed mission reward. All other factors act as multipliers on this core value.
                </p>
            </div>
            <div>
                <h4 style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}><Award size={16}/> Rank Correction (Rr)</h4>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                    Competitive multiplier: `1 + 0.003 * (13 - r)`. Highest ranks receive a compound boost in the A-D hierarchy.
                </p>
            </div>
            <div>
                <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}><ShieldAlert size={16}/> Collusion Shield (Ac)</h4>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                    Triggered when reciprocity or pricing anomalies exceed neural thresholds. Suppression scores safeguard the ecosystem.
                </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

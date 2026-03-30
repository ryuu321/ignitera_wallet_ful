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
  Award
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

  const avg = data.avgFactors || {};

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', minHeight: '100vh', color: 'white' }}>
       <aside className={styles.sidebar}>
          <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
             <div className={styles.logoIcon}><ArrowLeft size={20} color="#6366f1" /></div>
             <span className={styles.logoText}>Back to Hub</span>
          </Link>
          <div style={{ padding: '20px' }}>
             <div style={{ padding: '15px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '8px' }}>
                    <ShieldAlert size={14} />
                    <span>Audit Active</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>Algorithm S Final Ver. Online</p>
             </div>
          </div>
       </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Analytics <span style={{ color: '#6366f1' }}>Intelligence</span></h1>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Real-time multi-dimensional evaluation monitoring v2.0</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {/* Row 1 */}
            <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>ANTI-COLLUSION (Ac)</span>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '800', color: avg.ac > 0.9 ? '#10b981' : '#f59e0b' }}>{avg.ac.toFixed(2)}</span>
            </div>
            <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>UNIQUENESS (Wu)</span>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '800', color: '#6366f1' }}>{avg.wu.toFixed(2)}</span>
            </div>
            <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>D-FACTOR (Df)</span>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '800' }}>{avg.df.toFixed(2)}</span>
            </div>
            {/* Row 2 */}
            <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>ACTIVITY (Aa)</span>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '800', color: '#22d3ee' }}>{avg.aa.toFixed(2)}</span>
            </div>
            <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>CHALLENGE (Sf)</span>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '800', color: '#a855f7' }}>{avg.sf.toFixed(2)}</span>
            </div>
            <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>RANK (Rf)</span>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '800', color: '#fbbf24' }}>{avg.rf.toFixed(2)}</span>
            </div>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px', minHeight: '350px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Volume Distribution by Role</h3>
                <div style={{ height: '250px' }}><Bar options={chartOptions} data={barData} /></div>
            </div>

            <div className="glass-card" style={{ padding: '24px', minHeight: '350px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Earning Tier Density</h3>
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

          {/* SYSTEM WIDE AUDIT LOG */}
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Algorithm S Real-time Audit Log</h3>
                <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>Displaying last 50 transactions</span>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', textAlign: 'left', textTransform: 'uppercase' }}>
                    <th style={{ padding: '15px' }}>To</th>
                    <th style={{ padding: '15px' }}>C (Net)</th>
                    <th style={{ padding: '15px' }}>Wu</th>
                    <th style={{ padding: '15px' }}>Wd</th>
                    <th style={{ padding: '15px' }}>Pc</th>
                    <th style={{ padding: '15px' }}>Q</th>
                    <th style={{ padding: '15px' }}>Ac</th>
                    <th style={{ padding: '15px' }}>Aa</th>
                    <th style={{ padding: '15px' }}>Df</th>
                    <th style={{ padding: '15px' }}>Sf</th>
                    <th style={{ padding: '15px' }}>Eb</th>
                    <th style={{ padding: '15px' }}>Rf</th>
                    <th style={{ padding: '15px', color: 'white', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Final S</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions?.map((tx: any) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.75rem' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 'bold' }}>{tx.toUser?.anonymousName}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{tx.toUser?.role}</div>
                      </td>
                      <td style={{ padding: '15px' }}>{tx.amount.toFixed(0)} ₲</td>
                      <td style={{ padding: '15px', color: '#6366f1' }}>{tx.wu?.toFixed(2)}</td>
                      <td style={{ padding: '15px', opacity: 0.5 }}>{tx.wd?.toFixed(2)}</td>
                      <td style={{ padding: '15px', opacity: 0.8 }}>{tx.pc?.toFixed(2)}</td>
                      <td style={{ padding: '15px', color: '#10b981' }}>{tx.q?.toFixed(1)}</td>
                      <td style={{ padding: '15px', color: tx.ac < 0.9 ? '#f59e0b' : 'inherit' }}>{tx.ac?.toFixed(2)}</td>
                      <td style={{ padding: '15px', color: '#22d3ee' }}>{tx.aa?.toFixed(2)}</td>
                      <td style={{ padding: '15px' }}>{tx.df?.toFixed(2)}</td>
                      <td style={{ padding: '15px', color: '#a855f7' }}>{tx.sf?.toFixed(2)}</td>
                      <td style={{ padding: '15px' }}>{tx.eb?.toFixed(2)}</td>
                      <td style={{ padding: '15px', color: '#fbbf24' }}>{tx.rf?.toFixed(2)}</td>
                      <td style={{ padding: '15px', fontWeight: '900', color: '#6366f1', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        {tx.finalScore?.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* EXPLANATION CARDS */}
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            <div>
                <h4 style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><Target size={18}/> Df & Sf</h4>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                    **D-Factor** normalizes objective task payload. **Skill-Factor** rewards users attempting tasks above their current EMA mastery.
                </p>
            </div>
            <div>
                <h4 style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><Award size={18}/> R-Factor</h4>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                    A 90-day persistence multiplier. High-rank users (top percentiles) gain a 10% boost; low contributors see a 10% decay.
                </p>
            </div>
            <div>
                <h4 style={{ color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><Zap size={18}/> Load Balancers</h4>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                    **Aa** measures relative output vs system peer average. **Wd** prevents network fragmentation by limiting single-source reliance.
                </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

"use client"

import React from 'react';
import { 
  BarChart3, 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  ShieldAlert,
  Download
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

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

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
        borderWidth: 1, 
        padding: 12,
        titleColor: '#6366f1'
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: 'rgba(255, 255, 255, 0.4)' } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.4)' } }
    }
  };

  const barData = {
    labels: ['Dev', 'Prod', 'UX', 'QA', 'HR'],
    datasets: [{
      label: 'Volume (₲)',
      data: [12000, 19000, 3000, 5000, 2000],
      backgroundColor: ['#6366f1', '#a855f7', '#22d3ee', '#10b981', '#f59e0b'],
      borderRadius: 8
    }]
  };

  if (loading || !data) return <div style={{ height: '100vh', background: '#050511', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Connecting to Audit Hub...</div>;

  return (
    <div className={styles.dashboardContainer}>
       <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}>
              <ArrowLeft size={20} color="var(--primary)" />
            </div>
            <span className={styles.logoText}>Back to Home</span>
         </Link>
         
         <div style={{ marginTop: '20px', padding: '0 10px' }}>
            <div style={{ padding: '12px', background: 'rgba(255, 0, 0, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 0, 0, 0.1)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4444', fontWeight: '700', fontSize: '0.8rem', marginBottom: '8px' }}>
                    <ShieldAlert size={14} />
                    <span>Audit Status</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>No anomalies detected in the last 24 hours.</p>
            </div>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader}>
          <div>
            <h1>KPI <span className="gradient-text">Intelligence</span></h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>Real-time audit and circulation analytics for the marketplace.</p>
          </div>
          <button className="neon-button" style={{ display: 'flex', gap: '8px', opacity: 0.8 }}>
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px', minHeight: '400px' }}>
                <h3 style={{ marginBottom: '20px' }}>Volume by Department</h3>
                <div style={{ height: '300px' }}>
                    <Bar options={chartOptions} data={barData} />
                </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', minHeight: '400px' }}>
                <h3 style={{ marginBottom: '20px' }}>Coin Circulation Velocity</h3>
                <div style={{ height: '300px' }}>
                    <Line 
                        options={chartOptions} 
                        data={{
                            labels: ['W1', 'W2', 'W3', 'W4'],
                            datasets: [{
                                label: 'Velocity',
                                data: [65, 59, 80, 81],
                                borderColor: '#6366f1',
                                tension: 0.4,
                                fill: true,
                                backgroundColor: 'rgba(99, 102, 241, 0.1)'
                            }]
                        }} 
                    />
                </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', minHeight: '300px' }}>
                <h3 style={{ marginBottom: '20px' }}>Dispersion Score (Wd)</h3>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--success)' }}>{data.dispersion || '0.84'}</span>
                    <p style={{ color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px' }}>Target: 0.75+</p>
                </div>
                <div style={{ marginTop: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                        <span>Network Density</span>
                        <span>High</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${(data.dispersion || 0.84)*100}%`, background: 'var(--success)', borderRadius: '2px' }} />
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', minHeight: '300px' }}>
                <h3 style={{ marginBottom: '20px' }}>Quality Distribution</h3>
                <div style={{ height: '200px' }}>
                    <Pie 
                        data={{
                            labels: ['S Tier', 'A Tier', 'B Tier', 'C Tier'],
                            datasets: [{
                                data: data.qualityDistribution || [15, 45, 30, 10],
                                backgroundColor: ['#6366f1', '#a855f7', '#22d3ee', '#10b981'],
                                borderWidth: 0
                            }]
                        }}
                        options={{ maintainAspectRatio: false }}
                    />
                </div>
            </div>

          {/* Evaluation History */}
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '32px' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.4rem' }}>Evaluation Insights (Algorithm S breakdown)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>Date</th>
                    <th style={{ padding: '15px' }}>To (Player)</th>
                    <th style={{ padding: '15px' }}>Amount (C)</th>
                    <th style={{ padding: '15px' }}>Wu</th>
                    <th style={{ padding: '15px' }}>Wd</th>
                    <th style={{ padding: '15px' }}>Q</th>
                    <th style={{ padding: '15px' }}>Final Score (S)</th>
                    <th style={{ padding: '15px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions?.map((tx: any) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '15px' }}>{new Date(tx.timestamp).toLocaleDateString()}</td>
                      <td style={{ padding: '15px' }}>{tx.toUser?.anonymousName || 'Player'}</td>
                      <td style={{ padding: '15px' }}>{tx.amount} ₲</td>
                      <td style={{ padding: '15px', color: 'var(--primary)' }}>x{tx.wu.toFixed(2)}</td>
                      <td style={{ padding: '15px', color: 'var(--secondary)' }}>x{tx.wd.toFixed(2)}</td>
                      <td style={{ padding: '15px', color: 'var(--success)' }}>x{tx.q.toFixed(1)}</td>
                      <td style={{ padding: '15px', fontWeight: '800' }}>{tx.finalScore.toFixed(1)}</td>
                      <td style={{ padding: '15px' }}><span className={styles.badge} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>PAID</span></td>
                    </tr>
                  ))}
                  {!data.transactions?.length && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.2)' }}>No transaction data found in neural records.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

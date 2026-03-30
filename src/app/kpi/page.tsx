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
      y: { 
        grid: { color: 'rgba(255, 255, 255, 0.03)' }, 
        ticks: { color: 'rgba(255, 255, 255, 0.4)' },
        title: {
          display: true,
          text: 'Amount (₲)',
          color: 'rgba(255, 255, 255, 0.3)',
          font: { size: 10 }
        }
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: 'rgba(255, 255, 255, 0.4)' },
        title: {
          display: true,
          text: 'Category / Timeline',
          color: 'rgba(255, 255, 255, 0.3)',
          font: { size: 10 }
        }
      }
    }
  };



  if (loading || !data) return <div style={{ height: '100vh', background: '#050511', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Connecting to Audit Hub...</div>;

  const barData = {
    labels: data.roleLabels || ['ADMIN', 'PLAYER', 'MANAGER', 'LEADER'],
    datasets: [{
      label: 'Volume (₲)',
      data: data.roleVolume || [0, 0, 0, 0],
      backgroundColor: ['#6366f1', '#a855f7', '#22d3ee', '#10b981'],
      borderRadius: 8
    }]
  };

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
            <h1>Analytics <span className="gradient-text">Intelligence</span></h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>System-wide behavioral metrics and network health monitoring.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="glass-card" style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Network Hygiene (Ac)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: (data.avgAc || 1) > 0.9 ? 'var(--success)' : 'var(--warning)' }}>{(data.avgAc || 0).toFixed(2)}</span>
            </div>
            <div className="glass-card" style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Skill Scarcity (Wu)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{(data.avgWu || 0).toFixed(2)}</span>
            </div>
            <div className="glass-card" style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Efficiency (Eb)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent)' }}>+{(data.avgEb || 0).toFixed(2)}</span>
            </div>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px', minHeight: '400px' }}>
                <h3 style={{ marginBottom: '20px' }}>System Resource Distribution</h3>
                <div style={{ height: '300px' }}>
                    <Bar options={chartOptions} data={barData} />
                </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', minHeight: '400px' }}>
                <h3 style={{ marginBottom: '20px' }}>Coin Velocity Trend</h3>
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

          {/* Evaluation History */}
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '32px' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.4rem' }}>System-Wide Audit Log (Algorithm S)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>Timestamp</th>
                    <th style={{ padding: '15px' }}>From / To</th>
                    <th style={{ padding: '15px' }}>C (Base)</th>
                    <th style={{ padding: '15px' }}>Pc</th>
                    <th style={{ padding: '15px' }}>Wu</th>
                    <th style={{ padding: '15px' }}>Eb</th>
                    <th style={{ padding: '15px' }}>Q</th>
                    <th style={{ padding: '15px' }}>Wd</th>
                    <th style={{ padding: '15px' }}>Ac</th>
                    <th style={{ padding: '15px', color: 'white' }}>Final (S)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions?.map((tx: any) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '15px', whiteSpace: 'nowrap' }}>{new Date(tx.timestamp).toLocaleDateString()}</td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{tx.fromUser?.anonymousName}</div>
                        <div style={{ fontWeight: 'bold' }}>{tx.toUser?.anonymousName}</div>
                      </td>
                      <td style={{ padding: '15px' }}>{tx.amount} ₲</td>
                      <td style={{ padding: '15px' }}>x{(tx.pc || 1).toFixed(1)}</td>
                      <td style={{ padding: '15px', color: 'var(--primary)' }}>x{(tx.wu || 1).toFixed(2)}</td>
                      <td style={{ padding: '15px', color: 'var(--accent)' }}>+{(tx.eb || 0).toFixed(2)}</td>
                      <td style={{ padding: '15px', color: 'var(--success)' }}>x{(tx.q || 1).toFixed(1)}</td>
                      <td style={{ padding: '15px', opacity: 0.5 }}>{(tx.wd || 1).toFixed(2)}</td>
                      <td style={{ padding: '15px', color: (tx.ac || 1) < 0.9 ? 'var(--warning)' : 'inherit' }}>{(tx.ac || 1).toFixed(2)}</td>
                      <td style={{ padding: '15px', fontWeight: '800', color: 'white' }}>{(tx.finalScore || 0).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Algorithm Explanation */}
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '32px', background: 'rgba(99, 102, 241, 0.03)' }}>
            <h3 style={{ marginBottom: '20px' }}>Algorithm S Compliance Standards</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '5px' }}>Wu (Uniqueness)</strong>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>1 + 0.5 * (1 - percentile). Evaluates market rarity of the skill at the time of completion using a 30-day frequency distribution.</p>
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '5px' }}>Eb (Efficiency Bonus)</strong>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Calculated as 0.5 * (hexp/hact - 1). Rewards speed while maintaining quality. Range: -0.1 to +0.2.</p>
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--success)', display: 'block', marginBottom: '5px' }}>Ac (Anti-Collusion)</strong>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Fraud Score F = 0.4r + 0.4c + 0.2p. Penalizes recurrent pair trading, closed loops, and price anomalies.</p>
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>Wd (Distribution)</strong>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>1 - 0.3 * rd. Ensures network health by limiting single-requester dependency on the assignee side.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

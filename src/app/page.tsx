"use client"

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  ArrowUpRight, 
  Users, 
  ShieldAlert, 
  Activity, 
  LayoutDashboard, 
  Briefcase, 
  BarChart3, 
  Settings,
  User,
  ChevronRight,
  History,
  Plus,
  Award,
  Crown,
  Calculator
} from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, tRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/tasks')
        ]);
        const uData = await uRes.json();
        const tData = await tRes.json();
        
        const savedUserId = localStorage.getItem('demo-user-id');
        let targetUser = uData[0];
        if (savedUserId) {
          const found = uData.find((u: any) => u.id === savedUserId);
          if (found) targetUser = found;
        }
        setCurrentUser(targetUser);
        setUsers(uData);
        setTasks(tData);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUserChange = (id: string) => {
    const found = users.find(u => u.id === id);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('demo-user-id', id);
    }
  };

  if (loading) {
     return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: '#6366f1' }}>Connecting to Ignitera Network...</div>;
  }

  if (!currentUser) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050510', color: 'white', gap: '20px' }}>
        <h2>Core Inactive</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>No neural records found. Initialize database to begin.</p>
        <Link href="/settings" className="neon-button" style={{ textDecoration: 'none' }}>Go to Settings</Link>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', color: 'white' }}>
      <aside className={styles.sidebar}>
        <div className={styles.logoSection}>
          <div className={clsx(styles.logoIcon, "float")}>
            <Zap size={24} fill="#6366f1" color="#6366f1" />
          </div>
          <span className={styles.logoText}>Ignitera Hub</span>
        </div>

        <nav className={styles.navMenu}>
          <button 
            className={clsx(styles.navItem, activeTab === 'dashboard' && styles.navItemActive)}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </button>
          <Link href="/marketplace" className={styles.navItem}>
            <Briefcase size={20} />
            <span>Marketplace</span>
          </Link>
          <Link href="/kpi" className={styles.navItem}>
            <BarChart3 size={20} />
            <span>Analytics</span>
          </Link>
          <Link href="/profile" className={styles.navItem}>
            <User size={20} />
            <span>Profile DNA</span>
          </Link>
          <Link href="/settings" className={styles.navItem}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <Link href="/algorithm" className={styles.navItem} style={{ marginTop: '10px', opacity: 0.8 }}>
            <Calculator size={20} color="#6366f1" />
            <span style={{ fontSize: '0.85rem' }}>Evaluation Docs</span>
          </Link>
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ padding: '20px', margin: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px', letterSpacing: '1px' }}>DEMO_OPERATOR</div>
            <select 
              value={currentUser.id} 
              onChange={(e) => handleUserChange(e.target.value)}
              style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}
            >
              {users.map(u => <option key={u.id} value={u.id} style={{ background: '#111' }}>{u.anonymousName} (RANK-{u.rank})</option>)}
            </select>
        </div>

        <div className={styles.userProfileSummary} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
          <div className={styles.avatar} style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>{currentUser.anonymousName[0]}</div>
          <div className={styles.pInfo}>
            <span className={styles.pName} style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{currentUser.anonymousName}</span>
            <span className={styles.pRole} style={{ color: '#fed7aa', fontSize: '0.7rem' }}>RANK-{currentUser.rank} / {currentUser.role}</span>
          </div>
        </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '950', letterSpacing: '-1px' }}>Welcome, <span style={{ color: '#6366f1' }}>{currentUser.anonymousName}</span></h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: '0.95rem' }}>Organizational flux monitoring for the current fiscal cycle.</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.balancePill} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 'bold' }}>Flow: {(currentUser?.balanceFlow || 0).toLocaleString()} ₲</span>
              <div style={{ width: '1px', height: '15px', background: 'rgba(255,255,255,0.1)', margin: '0 15px' }} />
              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>Stock: {(currentUser?.balanceStock || 0).toLocaleString()} ₲</span>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.statsRow}>
              <StatCard 
                title="Career Rank" 
                value={`RANK-${currentUser.rank}`} 
                icon={<Crown size={24} color="#fbbf24" />} 
                trend="TOP 12%" 
                label="Competition Ladder" 
              />
              <StatCard 
                title="Algorithm S Score" 
                value={currentUser.totalScore?.toFixed(1) || '0.0'} 
                icon={<Target size={24} color="#6366f1" />} 
                trend="±0.4" 
                label="Integrated Performance" 
              />
              <StatCard 
                title="Skill Mastery (Sf)" 
                value={currentUser.skillLevel?.toFixed(2) || '1.00'} 
                icon={<Activity size={24} color="#a855f7" />} 
                trend="EMA Opt" 
                label="Mastery Factor" 
              />
              <StatCard 
                title="Grace Window" 
                value={`${currentUser.graceMonths}M`} 
                icon={<ShieldAlert size={24} color="#f59e0b" />} 
                label="Demotion Shield" 
              />
            </div>

            <div className={styles.lowerGrid}>
              <div className={clsx("glass-card", styles.activeTasks)}>
                <div className={styles.cardHeader}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900' }}>Flux Marketplace</h3>
                  <Link href="/marketplace" className={styles.textBtn} style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: 'bold' }}>View All →</Link>
                </div>
                <div className={styles.taskList} style={{ marginTop: '20px' }}>
                  {tasks.slice(0, 4).map((t) => (
                    <div key={t.id} className={styles.taskItem} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '16px 0' }}>
                      <div className={clsx(styles.statusDot, t.status === 'OPEN' ? styles.statusDotOpen : styles.statusDotInProgress)} />
                      <div className={styles.taskInfo}>
                        <span className={styles.taskTitle} style={{ fontWeight: 'bold' }}>{t.title}</span>
                        <span className={styles.taskBy} style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Requested by {t.requester?.anonymousName}</span>
                      </div>
                      <div className={styles.taskReward} style={{ color: '#6366f1', fontWeight: '900' }}>
                        {t.baseReward} ₲
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && <p style={{ padding: '20px', textAlign: 'center', opacity: 0.3 }}>No active fluctuations found.</p>}
                </div>
              </div>

              <div className={clsx("glass-card", styles.kpiPreview)}>
                <div className={styles.cardHeader}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900' }}>Capital Persistence</h3>
                  <div className={clsx(styles.badge, styles.pulse)} style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>Live Neural Link</div>
                </div>
                <div style={{ marginTop: '30px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '950' }}>{currentUser.totalScore?.toFixed(1)} <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>PTS S</span></div>
                    <div style={{ marginTop: '15px', height: '80px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                         {[40, 70, 45, 90, 65, 80, 50].map((v, i) => (
                             <div key={i} style={{ flex: 1, background: i === 5 ? '#6366f1' : 'rgba(255,255,255,0.05)', height: `${v}%`, borderRadius: '2px' }} />
                         ))}
                    </div>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                        <div>
                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>R_RANK BONUS</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fbbf24' }}>Active (x1.04)</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>AUDIT STATUS</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981' }}>PASS (Ac=1.0)</div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend, label }: any) {
  return (
    <div className={clsx("glass-card", styles.statCard)} style={{ padding: '24px' }}>
      <div className={styles.statHeader} style={{ marginBottom: '20px' }}>
        <span className={styles.statLabel} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{title}</span>
        <div className={styles.statIconWrapper} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px' }}>{icon}</div>
      </div>
      <div className={styles.statBody} style={{ marginBottom: '10px' }}>
        <span className={styles.statValue} style={{ fontSize: '1.8rem', fontWeight: '950' }}>{value}</span>
        {trend && (
          <span className={styles.statTrend} style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '10px' }}>
            <ArrowUpRight size={14} />
            {trend}
          </span>
        )}
      </div>
      <div className={styles.statFooter} style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{label}</div>
    </div>
  );
}

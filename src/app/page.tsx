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
  Plus
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
        
        // Try to recover user from localStorage for demo persistence
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

  const stats = {
    completionRate: 85,
    dispersion: 0.78,
    circulation: [40, 60, 45, 90, 100, 80, 110]
  };

  if (loading) {
     return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: 'var(--primary)' }}>Connecting to Secure Database...</div>;
  }

  if (!currentUser) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050510', color: 'white', gap: '20px' }}>
        <h2>System Inactive</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>No user records found. Please initialize the database to start the marketplace.</p>
        <Link href="/settings" className="neon-button" style={{ textDecoration: 'none' }}>Go to Settings</Link>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoSection}>
          <div className={clsx(styles.logoIcon, "float")}>
            <Zap size={24} fill="var(--primary)" color="var(--primary)" />
          </div>
          <span className={styles.logoText}>Ignitera Wallet</span>
        </div>

        <nav className={styles.navMenu}>
          <button 
            className={clsx(styles.navItem, activeTab === 'dashboard' && styles.navItemActive)}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
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
            <span>Profile</span>
          </Link>
          <Link href="/settings" className={styles.navItem}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ padding: '20px', margin: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>DEMO USER</div>
            <select 
              value={currentUser.id} 
              onChange={(e) => handleUserChange(e.target.value)}
              style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.85rem' }}
            >
              {users.map(u => <option key={u.id} value={u.id} style={{ background: '#111' }}>{u.anonymousName} ({u.role})</option>)}
            </select>
        </div>

        <div className={styles.userProfileSummary}>
          <div className={styles.avatar}>{currentUser.anonymousName[0]}</div>
          <div className={styles.pInfo}>
            <span className={styles.pName}>{currentUser.anonymousName}</span>
            <span className={styles.pRole}>{currentUser.role}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader}>
          <div>
            <h1>Welcome back, <span className="gradient-text">{currentUser.anonymousName}</span></h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>Your internal marketplace overview for March 2026.</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.balancePill}>
              <span className={styles.flowPill}>Flow: {(currentUser?.balanceFlow || 0).toLocaleString()} ₲</span>
              <span className={styles.stockPill}>Stock: {(currentUser?.balanceStock || 0).toLocaleString()} ₲</span>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Stats Overview */}
            <div className={styles.statsRow}>
              <StatCard 
                title="Evaluation Score" 
                value={currentUser.evaluationScore?.toFixed(2) || '0.00'} 
                icon={<Target size={24} color="var(--primary)" />} 
                trend="+2.4" 
                label="Score S" 
              />
              <StatCard 
                title="Task Completion" 
                value={`${stats.completionRate}%`} 
                icon={<Activity size={24} color="var(--success)" />} 
                trend="+5.1" 
                label="Company Avg" 
              />
              <StatCard 
                title="Coin Circulation" 
                value="2,450 ₲" 
                icon={<TrendingUp size={24} color="var(--accent)" />} 
                trend="+12%" 
                label="Weekly Volume" 
              />
              <StatCard 
                title="Network Dispersion" 
                value={stats.dispersion.toFixed(2)} 
                icon={<Users size={24} color="var(--secondary)" />} 
                label="Index Wd" 
              />
            </div>

            {/* Markets and Analytics Split */}
            <div className={styles.lowerGrid}>
              <div className={clsx("glass-card", styles.activeTasks)}>
                <div className={styles.cardHeader}>
                  <h3>Recent Market Tasks</h3>
                  <Link href="/marketplace" className={styles.textBtn} style={{ textDecoration: 'none' }}>Explore</Link>
                </div>
                <div className={styles.taskList}>
                  {tasks.slice(0, 5).map((t) => (
                    <div key={t.id} className={styles.taskItem}>
                      <div className={clsx(styles.statusDot, t.status === 'OPEN' ? styles.statusDotOpen : styles.statusDotInProgress)} />
                      <div className={styles.taskInfo}>
                        <span className={styles.taskTitle}>{t.title}</span>
                        <span className={styles.taskBy}>by {t.requester?.anonymousName || 'Unknown'}</span>
                      </div>
                      <div className={styles.taskReward}>
                        {t.baseReward} ₲
                      </div>
                      <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
                    </div>
                  ))}
                  {tasks.length === 0 && <p style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No tasks found. Visit the Marketplace to begin.</p>}
                </div>
              </div>

              <div className={styles.balanceCard}>
                <div className={styles.balanceInfo}>
                    <span className={styles.balanceLabel}>Balance Flow (Monthly)</span>
                    <div className={styles.balanceValue}>{(currentUser?.balanceFlow || 0).toLocaleString()} ₲</div>
                </div>
              </div>
              
              <div className={styles.balanceCard}>
                <div className={styles.balanceInfo}>
                    <span className={styles.balanceLabel}>Balance Stock (Earning)</span>
                    <div className={styles.balanceValue}>{(currentUser?.balanceStock || 0).toLocaleString()} ₲</div>
                </div>
              </div>

              <div className={clsx("glass-card", styles.kpiPreview)}>
                <div className={styles.cardHeader}>
                  <h3>Circulation Activity (₲)</h3>
                  <div className={clsx(styles.badge, styles.pulse)}>Live</div>
                </div>
                <div className={styles.chartPlaceholder}>
                  <div style={{ position: 'absolute', top: '10px', left: '-20px', transform: 'rotate(-90deg)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>Volume</div>
                  <div className={styles.bars}>
                    {stats.circulation.map((v, i) => (
                      <div key={i} className={styles.bar} style={{ height: `${(v/120)*100}%` }} />
                    ))}
                  </div>
                  <div className={styles.chartLabels}>
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                    <ShieldAlert size={16} />
                    <span>Collusion detected: 0.0%</span>
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
    <div className={clsx("glass-card", styles.statCard)}>
      <div className={styles.statHeader}>
        <span className={styles.statLabel}>{title}</span>
        <div className={styles.statIconWrapper}>{icon}</div>
      </div>
      <div className={styles.statBody}>
        <span className={styles.statValue}>{value}</span>
        {trend && (
          <span className={styles.statTrend}>
            <ArrowUpRight size={14} />
            {trend}
          </span>
        )}
      </div>
      <div className={styles.statFooter}>{label}</div>
    </div>
  );
}

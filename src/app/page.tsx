"use client"

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  BarChart3, 
  User, 
  Settings, 
  Search, 
  Bell, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Zap,
  Target,
  History,
  Award,
  Crown,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';
import { getRankColor } from '@/lib/colors';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uRes = await fetch('/api/users');
        const data = await uRes.json();
        setUsers(data);
        
        const savedId = localStorage.getItem('demo-user-id');
        const user = savedId ? data.find((u: any) => u.id === savedId) : data[0];
        setCurrentUser(user || data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUserChange = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('demo-user-id', id);
    }
  };

  if (loading || !currentUser) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: '#6366f1' }}>Synchronizing Neural Core...</div>;
  }

  const rankColor = getRankColor(currentUser.rank);

  return (
    <div 
      className={styles.dashboardContainer} 
      style={{ 
        '--primary': rankColor,
        background: `radial-gradient(circle at 0% 0%, ${rankColor}10, transparent 40%), #050511` 
      } as React.CSSProperties}
    >
      <aside className={styles.sidebar}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon} style={{ background: rankColor }}><Zap size={14} color="white" /></div>
          <span className={styles.logoText}>Ignitera <span style={{ color: rankColor }}>OS</span></span>
        </div>

        <nav className={styles.navMenu}>
          <Link href="/" className={clsx(styles.navItem, styles.navItemActive)}>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </Link>
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
            <Calculator size={20} color={rankColor} />
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
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader}>
          <div className={styles.headerTitle}>
            <h1>Career <span style={{ color: rankColor }}>Nexus</span></h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Hierarchical status: {currentUser.rank} / Competitive Layer</p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.searchBar}>
              <Search size={18} />
              <input type="text" placeholder="Scan protocols..." />
            </div>
            <div className={styles.iconBtn}><Bell size={20} /></div>
            <div className={styles.avatarBorder} style={{ borderColor: rankColor }}>
               <div className={styles.avatar} style={{ background: `linear-gradient(135deg, ${rankColor}, #000)` }}>{currentUser.anonymousName[0]}</div>
            </div>
          </div>
        </header>

        <div className={styles.statsGrid}>
          <StatCard 
            title="Flow Balance" 
            value={`${currentUser.balanceFlow} ₲`} 
            trend="+12% Volatility" 
            icon={<Zap size={20} color={rankColor} />}
            color={rankColor}
            desc="Monthly allocation for strategic emission."
          />
          <StatCard 
            title="Stock Value" 
            value={`${currentUser.balanceStock?.toFixed(1)} ₲`} 
            trend="Settled Asset" 
            icon={<Target size={20} color="#10b981" />} 
            color="#10b981"
            desc="Liquidated performance rewards."
          />
          <StatCard 
            title="Algorithm S Score" 
            value={`${currentUser.totalScore?.toFixed(1) || '0.0'}`} 
            trend={`Rank: ${currentUser.rank}`} 
            icon={<Award size={20} color="#fbbf24" />} 
            color="#fbbf24"
            desc="Normalized multi-factor evaluation."
          />
        </div>

        <section className={styles.contentSection}>
          <div className={styles.mainContent}>
            <div className={styles.sectionHeader}>
               <h2>Mission Feed</h2>
               <div className={styles.filterTabs}>
                  <button className={styles.filterTabActive}>Recent</button>
                  <button className={styles.filterTab}>High Reward</button>
               </div>
            </div>
            
            <div className={styles.missionList}>
               <MissionItem title="Neural Network Optimization" reward="500" complexity="D_f: 1.2" time="2h rem" color={rankColor} />
               <MissionItem title="Market Liquidity Rebalance" reward="320" complexity="D_f: 0.85" time="5h rem" color="#10b981" />
               <MissionItem title="Strategic Growth Audit" reward="850" complexity="D_f: 1.45" time="1d rem" color="#a855f7" />
            </div>
          </div>

          <aside className={styles.rightPanel}>
             <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', border: `1px solid ${rankColor}30` }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: rankColor }}>Career Trajectory</h3>
                <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                   <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>Current Monthly Rank Progress</div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      <span>Rank {currentUser.rank}</span>
                      <span style={{ color: rankColor }}>{currentUser.monthlyScore?.toFixed(0)} PTS</span>
                   </div>
                   <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min(100, (currentUser.monthlyScore/1000)*100)}%` }} 
                        style={{ height: '100%', background: rankColor }} 
                      />
                   </div>
                </div>
             </div>

             <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '15px' }}>Rapid Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <QuickAction icon={<Briefcase size={16} />} text="Browse Marketplace" link="/marketplace" />
                   <QuickAction icon={<User size={16} />} text="Update Profile DNA" link="/profile" />
                   <QuickAction icon={<History size={16} />} text="Ledger History" link="/kpi" />
                </div>
             </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, trend, icon, color, desc }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card" 
      style={{ padding: '24px', border: `1px solid ${color}20`, borderBottom: `3px solid ${color}` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ padding: '10px', background: `${color}15`, borderRadius: '10px' }}>{icon}</div>
        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: color }}>{trend}</div>
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: '950', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{title}</div>
      <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '12px', lineHeight: '1.4', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
          {desc}
      </p>
    </motion.div>
  );
}

function MissionItem({ title, reward, complexity, time, color }: any) {
  return (
    <div className={styles.missionItem}>
       <div className={styles.missionIcon} style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
          <Activity size={18} color={color} />
       </div>
       <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{title}</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{complexity} • {time}</div>
       </div>
       <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '900', color: color }}>{reward} ₲</div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>EST PAYOUT</div>
       </div>
    </div>
  );
}

function QuickAction({ icon, text, link }: any) {
  return (
    <Link href={link} style={{ textDecoration: 'none' }}>
      <button className={styles.quickActionBtn}>
         {icon}
         <span>{text}</span>
      </button>
    </Link>
  );
}

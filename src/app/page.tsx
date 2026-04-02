"use client"

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Briefcase, BarChart3, User, Settings, Search, Bell, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Plus, CheckCircle2, Clock, Zap, Target, History, Award, Crown, Calculator, ChevronRight, Sparkles, Filter, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';
import { getRankColor } from '@/lib/colors';
import { RANK_LADDER, getPromotionThreshold } from '@/lib/rank';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'market' | 'wallet'>('home');

  useEffect(() => {
    // Detect mobile initial state
    const isMobile = window.innerWidth < 1024;
    const savedMode = localStorage.getItem('display-mode') as 'desktop' | 'mobile';
    setViewMode(savedMode || (isMobile ? 'mobile' : 'desktop'));

    const fetchData = async () => {
      try {
        const [uRes, tRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/tasks')
        ]);
        const uData = await uRes.json();
        const tData = await tRes.json();
        
        setUsers(uData);
        setTasks(tData);
        
        const savedId = localStorage.getItem('demo-user-id');
        const user = savedId ? uData.find((u: any) => u.id === savedId) : uData[0];
        setCurrentUser(user || uData[0]);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();

    const handleResize = () => {
       if (!localStorage.getItem('display-mode')) {
          setViewMode(window.innerWidth < 1024 ? 'mobile' : 'desktop');
       }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  if (loading || !currentUser) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: '#6366f1' }}>Ignitera OS 同期中...</div>;
  }

  const rankColor = getRankColor(currentUser.rank);

  // Mobile Lite Layout
  if (viewMode === 'mobile') {
    return (
      <div style={{ background: '#05050e', minHeight: '100vh', color: 'white', padding: '20px 20px 100px 20px', fontFamily: 'inherit' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: rankColor, padding: '8px', borderRadius: '10px' }}><Zap size={18} color="white" /></div>
                <span style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '-1px' }}>Ignitera <span style={{ color: rankColor }}>OS</span></span>
             </div>
             <button onClick={toggleViewMode} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '900' }}>
                GO_DESKTOP
             </button>
          </header>

          <div style={{ marginBottom: '30px' }}>
             <h2 style={{ fontSize: '1.8rem', fontWeight: '950', letterSpacing: '-1.5px', marginBottom: '4px' }}>Hi, {currentUser.anonymousName}</h2>
             <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>R-{currentUser.rank} / Neural Node {currentUser.id.slice(0,4)}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div className="glass-card" style={{ padding: '24px', background: `linear-gradient(135deg, ${rankColor}20, transparent)`, border: `1px solid ${rankColor}30`, borderRadius: '24px' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', letterSpacing: '1px', fontWeight: '900' }}>TOTAL_S_SCORE</div>
                <div style={{ fontSize: '2.8rem', fontWeight: '950', color: rankColor }}>{currentUser.totalScore?.toFixed(1)}</div>
                <div style={{ marginTop: '15px', display: 'flex', gap: '8px' }}>
                   <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem' }}>Rank: {currentUser.rank}</div>
                   <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem' }}>Next: {getPromotionThreshold(RANK_LADDER[RANK_LADDER.indexOf(currentUser.rank)+1] || 'S')}</div>
                </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="glass-card" style={{ padding: '20px', borderRadius: '24px' }}>
                   <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>FLOW</div>
                   <div style={{ fontSize: '1.4rem', fontWeight: '900' }}>₲{currentUser.balanceFlow}</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', borderRadius: '24px' }}>
                   <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>STOCK</div>
                   <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10b981' }}>₲{currentUser.balanceStock?.toFixed(0)}</div>
                </div>
             </div>

             <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(251, 191, 36, 0.3)', background: 'rgba(251, 191, 36, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: '900', letterSpacing: '1px' }}>IGN_WALLET</div>
                    <Link href="/expenses" style={{ textDecoration: 'none', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>履歴を表示</Link>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '950', color: '#fbbf24', marginBottom: '20px' }}>𝒾 {currentUser.balanceIgn?.toLocaleString() || '0'}</div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                   <button 
                     onClick={async () => {
                        const amount = prompt('IGN に換金する Stock 額:', '10');
                        if (amount) {
                           const res = await fetch('/api/exchange/stock-to-ign', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ userId: currentUser.id, amount }) });
                           if (res.ok) window.location.reload();
                        }
                     }}
                     style={{ flex: 1, padding: '14px', background: '#fbbf24', color: 'black', border: 'none', borderRadius: '14px', fontSize: '0.8rem', fontWeight: '900' }}>
                     換金する
                   </button>
                   <button 
                     onClick={async () => {
                        const amount = prompt('使用する額:', '5');
                        if (amount) {
                           const desc = prompt('用途:', 'アメニティ利用');
                           const res = await fetch('/api/expenses', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ userId: currentUser.id, amount, category: 'GENERAL', description: desc }) });
                           if (res.ok) window.location.reload();
                        }
                     }}
                     style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', fontSize: '0.8rem', fontWeight: '900' }}>
                     支払う
                   </button>
                </div>
             </div>
          </div>

          <div style={{ marginTop: '40px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '950', fontSize: '1rem' }}>クイック・ミッション</span>
                <Link href="/marketplace" style={{ color: rankColor, fontSize: '0.8rem', textDecoration: 'none' }}>すべて表示</Link>
             </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 {tasks.filter(t => t.status === 'OPEN' && t.requesterId !== currentUser.id).slice(0, 3).map(task => (
                    <MissionTile 
                       key={task.id} 
                       title={task.title} 
                       reward={task.baseReward} 
                       complexity={task.requiredSkill || '1.0'} 
                       time={`${task.expectedHours}h`} 
                       color={getRankColor(task.requester?.rank || 'Z')} 
                       urgency="OPEN" 
                       onClick={() => location.href='/marketplace'}
                    />
                 ))}
                 {tasks.filter(t => t.status === 'OPEN' && t.requesterId !== currentUser.id).length === 0 && (
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>
                       現在、募集中のミッションはありません。
                    </div>
                 )}
              </div>
          </div>

          {/* Bottom Nav */}
          <nav style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', height: '70px', background: 'rgba(20,20,25,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '25px', display: 'flex', padding: '0 10px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 1000 }}>
             <button onClick={() => location.href='/'} style={{ flex: 1, background: 'none', border: 'none', color: '#6366f1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <LayoutDashboard size={20} />
                <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>HOME</span>
             </button>
             <button onClick={() => location.href='/marketplace'} style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Briefcase size={20} />
                <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>MARKET</span>
             </button>
             <button onClick={() => alert('支払いQR読取(未実装)')} style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Zap size={20} />
                <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>PAY</span>
             </button>
             <button onClick={() => location.href='/profile'} style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <User size={20} />
                <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>DNA</span>
             </button>
          </nav>
      </div>
    );
  }

  // Desktop Layout (Existing)
  return (
    <div 
      className={styles.dashboardContainer} 
      style={{ 
        '--primary': rankColor,
        background: `radial-gradient(circle at 100% 0%, ${rankColor}15, transparent 50%), #05050e` 
      } as React.CSSProperties}
    >
      <aside className={styles.sidebar}>
        <div className={styles.logoSection} style={{ marginBottom: '40px' }}>
          <div className={styles.logoIcon} style={{ background: rankColor, boxShadow: `0 0 20px ${rankColor}40` }}><Zap size={14} color="white" /></div>
          <span className={styles.logoText} style={{ fontSize: '1.4rem', letterSpacing: '-1px' }}>Ignitera <span style={{ color: rankColor }}>OS</span></span>
        </div>

        <nav className={styles.navMenu}>
          <NavItem icon={<LayoutDashboard size={20} />} text="概要" active href="/" />
          <NavItem icon={<Briefcase size={20} />} text="マーケット" href="/marketplace" />
          <NavItem icon={<BarChart3 size={20} />} text="アナリティクス" href="/kpi" />
          <NavItem icon={<User size={20} />} text="プロフィール DNA" href="/profile" />
          <NavItem icon={<Settings size={20} />} text="設定" href="/settings" />
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />
          <NavItem icon={<Calculator size={20} color={rankColor} />} text="アルゴリズム解説" href="/algorithm" small />
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ padding: '20px', margin: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '15px', letterSpacing: '1px', fontWeight: '900' }}>NEURAL_WALLET</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
               <BalanceItem label="FLOW" value={currentUser.balanceFlow} unit="₲" color={rankColor} description="今月の発行可能予算" />
               <BalanceItem label="STOCK" value={currentUser.balanceStock} unit="₲" color="#10b981" description="生涯蓄積・業務投資資産" />
               <BalanceItem label="IGN" value={currentUser.balanceIgn} unit="𝒾" color="#fbbf24" description="社内アメニティ・経費用" />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button 
                    onClick={async () => {
                        const amount = prompt('IGN に換金する Stock の額を入力してください (1:1 換金):', '10');
                        if (amount && !isNaN(parseFloat(amount))) {
                            const res = await fetch('/api/exchange/stock-to-ign', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: currentUser.id, amount })
                            });
                            if (res.ok) { window.location.reload(); alert('IGN への換金が完了しました。'); }
                            else { const err = await res.json(); alert(`エラー: ${err.error}`); }
                        }
                    }}
                    style={{ flex: 1, padding: '10px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '10px', color: '#fbbf24', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    IGN換金
                </button>
                <button 
                    onClick={async () => {
                        const amount = prompt('IGN を使用する額を入力してください:', '5');
                        if (amount && !isNaN(parseFloat(amount))) {
                            const desc = prompt('使用用途を入力してください (例: カフェラテ, 席料):', 'アメニティ利用');
                            const res = await fetch('/api/expenses', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: currentUser.id, amount, category: 'GENERAL', description: desc })
                            });
                            if (res.ok) { window.location.reload(); alert('IGN の支払いが完了しました。'); }
                            else { const err = await res.json(); alert(`エラー: ${err.error}`); }
                        }
                    }}
                    style={{ flex: 1, padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    IGN支払
                </button>
            </div>

            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>デモ・オペレーター切替</div>
            <select 
              value={currentUser.id} 
              onChange={(e) => handleUserChange(e.target.value)}
              style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' }}
            >
              {users.map(u => <option key={u.id} value={u.id} style={{ background: '#0a0a0f' }}>{u.anonymousName} (Rank {u.rank})</option>)}
            </select>
            <button 
                onClick={async () => {
                    if (confirm('システム時間（月）を進めますか？発行残高のリセット等が行われます。')) {
                        const res = await fetch('/api/simulate/next-month', { method: 'POST' });
                        if (res.ok) { window.location.reload(); alert('翌月のシミュレーションが完了しました。'); }
                    }
                }}
                style={{ width: '100%', padding: '10px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '8px', color: '#6366f1', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>
                <History size={12} style={{ marginRight: '6px' }} /> 月を進める (Simulation)
             </button>
        </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '40px' }}>
          <div className={styles.headerTitle}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
               <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '8px' }}>
                 ようこそ、<span style={{ color: rankColor }}>{currentUser.anonymousName}</span>
               </h1>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={styles.badge} style={{ background: `${rankColor}20`, color: rankColor, border: `1px solid ${rankColor}40` }}>
                    階級: {currentUser.rank} セクター
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>すべてのプロトコルは正常に同期されています。</div>
                  <button onClick={toggleViewMode} style={{ marginLeft: '20px', background: 'none', border: `1px solid ${rankColor}40`, color: rankColor, padding: '4px 12px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '900', cursor: 'pointer' }}>
                     SWITCH_TO_MOBILE
                  </button>
               </div>
            </motion.div>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.searchBar} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px' }}>
              <Search size={18} color="rgba(255,255,255,0.4)" />
              <input type="text" placeholder="グローバル検索..." style={{ color: 'white' }} />
            </div>
            <div className={styles.iconBtn} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}><Bell size={20} /></div>
            <div className={styles.avatarBorder} style={{ borderColor: rankColor, padding: '3px' }}>
               <div className={styles.avatar} style={{ background: `linear-gradient(135deg, ${rankColor}, #000)`, fontWeight: '900' }}>{currentUser.anonymousName[0]}</div>
            </div>
          </div>
        </header>

        <div className={styles.statsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px', marginBottom: '48px' }}>
          <StatCard 
            title="発行可能残高 (Flow)" 
            value={`${currentUser.balanceFlow} ₲`} 
            trend="+12%" trendUp
            icon={<Zap size={24} color={rankColor} />}
            color={rankColor}
            delay={0.1}
          />
          <StatCard 
            title="確定報酬資産 (Stock)" 
            value={`${currentUser.balanceStock?.toFixed(1)} ₲`} 
            trend="Settled" trendUp={false}
            icon={<Target size={24} color="#10b981" />} 
            color="#10b981"
            delay={0.2}
          />
          <StatCard 
            title="アルゴリズム S 評価スコア" 
            value={`${currentUser.totalScore?.toFixed(1) || '0.0'}`} 
            trend={`R-${currentUser.rank}`} trendUp={true}
            icon={<Award size={24} color="#fbbf24" />} 
            color="#fbbf24"
            delay={0.3}
          />
        </div>

        <section className={styles.contentSection}>
          <div className={styles.mainContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
               <h2 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.5px' }}>ミッション・ボード</h2>
               <div style={{ display: 'flex', gap: '8px' }}>
                  <button className={styles.filterTabActive} style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '10px' }}>すべてを見る</button>
                  <button className={styles.filterTab} style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '10px' }}>優先案件</button>
               </div>
            </div>
            
            <div className={styles.missionList} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <MissionTile title="成長基盤のオーディット" reward="850" complexity="1.45" time="残り 1d" color="#a855f7" urgency="LOW" />
               <MissionTile title="エージェント・プロトコル改善" reward="410" complexity="1.1" time="残り 3h" color="#ec4899" urgency="MID" />
            </div>
          </div>

          <aside className={styles.rightPanel} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
             <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
               className="glass-card" style={{ padding: '28px', border: `1px solid ${rankColor}30`, position: 'relative', overflow: 'hidden' }}
             >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: `linear-gradient(90deg, ${rankColor}, transparent)` }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: '900', display: 'flex', justifyContent: 'space-between' }}>
                   <span>キャリア軌道</span>
                   <Sparkles size={16} color={rankColor} />
                </h3>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)' }}>
                   <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '1px' }}>現在のランク進捗</div>
                   {(() => {
                      const currentIdx = RANK_LADDER.indexOf(currentUser.rank || 'Z');
                      const nextRank = RANK_LADDER[currentIdx + 1];
                      const threshold = nextRank ? getPromotionThreshold(nextRank) : 1000;
                      const progress = Math.min(100, (currentUser.monthlyScore / threshold) * 100);
                      
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                             <span style={{ fontSize: '1.8rem', fontWeight: '950', lineHeight: 1 }}>{currentUser.rank}</span>
                             <span style={{ fontSize: '1.1rem', fontWeight: '900', color: rankColor }}>{currentUser.monthlyScore?.toFixed(0)} <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>/ {threshold} PTS</span></span>
                          </div>
                          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', overflow: 'hidden' }}>
                             <motion.div 
                               initial={{ width: 0 }} animate={{ width: `${progress}%` }} 
                               style={{ height: '100%', background: `linear-gradient(90deg, ${rankColor}, ${rankColor}80)`, boxShadow: `0 0 10px ${rankColor}40` }} 
                             />
                          </div>
                        </>
                      );
                   })()}
                   <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                      次期昇格予測: 4月20日前後
                   </div>
                </div>
                <button style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'none', border: `1px solid ${rankColor}20`, color: rankColor, borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                   詳細なキャリアパスを見る
                </button>
             </motion.div>

             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: '900' }}>クイック・コマンド</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <ActionLink icon={<Briefcase size={16} />} text="案件を探索する" sub="マーケットプレイスへ" href="/marketplace" />
                   <ActionLink icon={<User size={16} />} text="個人DNAを更新" sub="スキル・マトリクス" href="/profile" />
                   <ActionLink icon={<History size={16} />} text="トランザクション" sub="評価ログと監査履歴" href="/kpi" />
                </div>
             </motion.div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, text, active, href, small }: any) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <button className={clsx(styles.navItem, active && styles.navItemActive)} style={small ? { opacity: 0.7, padding: '10px 16px' } : {}}>
         {icon}
         <span style={small ? { fontSize: '0.85rem' } : {}}>{text}</span>
         {active && <motion.div layoutId="nav-active" style={{ position: 'absolute', right: 0, width: '4px', height: '20px', background: 'var(--primary)', borderRadius: '4px' }} />}
      </button>
    </Link>
  );
}

function StatCard({ title, value, trend, trendUp, icon, color, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="glass-card" 
      style={{ padding: '32px', border: `1px solid ${color}20`, background: `linear-gradient(135deg, ${color}05, transparent)`, borderBottom: `4px solid ${color}` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ padding: '14px', background: `${color}15`, borderRadius: '14px', border: `1px solid ${color}20` }}>{icon}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '900', color: trendUp ? '#10b981' : 'rgba(255,255,255,0.4)' }}>
           {trendUp && <ArrowUpRight size={14} />} {trend}
        </div>
      </div>
      <div style={{ fontSize: '2.4rem', fontWeight: '950', letterSpacing: '-1.5px', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>{title}</div>
    </motion.div>
  );
}

function MissionTile({ title, reward, complexity, time, color, urgency, onClick }: any) {
  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.03)' }}
      style={{ display: 'flex', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}
    >
       <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '20px' }}>
          <Activity size={20} color={color} />
       </div>
       <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '900', fontSize: '1rem', letterSpacing: '-0.2px' }}>{title}</div>
          <div style={{ display: 'flex', gap: '15px', marginTop: '4px' }}>
             <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>負荷: x{complexity}</span>
             <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>期限: {time}</span>
             <span style={{ fontSize: '0.7rem', color: urgency === 'OPEN' ? color : urgency === 'HIGH' ? '#ef4444' : urgency === 'MID' ? '#f59e0b' : '#3b82f6', fontWeight: '900' }}>{urgency}</span>
          </div>
       </div>
       <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ fontWeight: '950', fontSize: '1.25rem', color: color }}>{reward} ₲</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Potential</div>
          </div>
          <ChevronRight size={20} color="rgba(255,255,255,0.1)" />
       </div>
    </motion.div>
  );
}

function ActionLink({ icon, text, sub, href }: any) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <button 
        style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', cursor: 'pointer', textAlign: 'left' }}
        className="action-tile-hover"
      >
         <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>{icon}</div>
         <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{text}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
         </div>
         <ArrowUpRight size={16} color="rgba(255,255,255,0.2)" />
         <style jsx>{`
            .action-tile-hover:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }
         `}</style>
      </button>
    </Link>
  );
}

function BalanceItem({ label, value, unit, color, description }: any) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
               <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: '900' }}>{label}</span>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span style={{ fontSize: '0.65rem', color, fontWeight: 'bold' }}>{unit}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '950', color, lineHeight: 1 }}>{value?.toLocaleString() || '0'}</span>
               </div>
            </div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)' }}>{description}</div>
        </div>
    );
}


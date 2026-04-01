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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uRes = await fetch('/api/users');
        const data = await uRes.json();
        setUsers(data);
        
        const savedId = localStorage.getItem('demo-user-id');
        const user = savedId ? data.find((u: any) => u.id === savedId) : data[0];
        setCurrentUser(user || data[0]);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
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
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: '#6366f1' }}>Ignitera OS 同期中...</div>;
  }

  const rankColor = getRankColor(currentUser.rank);

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
               <MissionTile title="ニューラル・ネットワークの最適化" reward="500" complexity="1.2" time="残り 2h" color={rankColor} urgency="HIGH" />
               <MissionTile title="マーケット・リバランス" reward="320" complexity="0.85" time="残り 5h" color="#10b981" urgency="MID" />
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

function MissionTile({ title, reward, complexity, time, color, urgency }: any) {
  return (
    <motion.div 
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
             <span style={{ fontSize: '0.7rem', color: urgency === 'HIGH' ? '#ef4444' : urgency === 'MID' ? '#f59e0b' : '#3b82f6', fontWeight: '900' }}>{urgency}</span>
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


"use client"

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Zap, Briefcase, User, Calculator, ChevronDown, ChevronUp, Clock, Target, Layers, Cpu, Brain, ShieldCheck, Activity, Award, LayoutDashboard, Settings, Terminal, Database, ShieldAlert, History, Microscope, Search, Coins, Trophy, Medal, Rocket, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Bar, Line } from 'react-chartjs-2';
import styles from '../page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';
import { getRankColor } from '@/lib/colors';
import { RANK_LADDER } from '@/lib/rank';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function KPIPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'personal'>('company');
  const [data, setData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

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

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    const savedMode = localStorage.getItem('display-mode') as 'desktop' | 'mobile';
    setViewMode(savedMode || (isMobile ? 'mobile' : 'desktop'));
    fetchKPIData();
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

  if (loading || !data || !currentUser) return <div style={{ height: '100vh', background: '#050511', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>組織知能を同期中...</div>;

  const rankColor = getRankColor(currentUser.rank);
  const personalTxs = (data.transactions || []).filter((tx: any) => tx.toUserId === currentUser.id);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: 'rgba(17, 24, 39, 0.95)', padding: 12, titleColor: rankColor, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { size: 10 } } }
    }
  };

  // Ranking Calculation
  const sortedByCoins = [...users].sort((a, b) => b.balanceStock - a.balanceStock).slice(0, 5);
  const sortedByScore = [...users].sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', minHeight: '100vh', color: 'white', '--primary': rankColor } as any}>
       <aside className={styles.sidebar}>
          <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
             <div className={styles.logoIcon} style={{ background: rankColor }}><Zap size={14} color="white" /></div>
             <span className={styles.logoText}>Ignitera <span style={{ color: rankColor }}>OS</span></span>
          </Link>
          <nav className={styles.navMenu}>
             <Link href="/" className={styles.navItem}><LayoutDashboard size={18} /> <span>概要</span></Link>
             <Link href="/marketplace" className={styles.navItem}><Briefcase size={18} /> <span>マーケット</span></Link>
             <Link href="/kpi" className={clsx(styles.navItem, styles.navItemActive)}><BarChart3 size={18} /> <span>アナリティクス</span></Link>
             <Link href="/profile" className={styles.navItem}><User size={18} /> <span>プロフィール DNA</span></Link>
          </nav>
          <div style={{ flex: 1 }} />
          <div style={{ padding: '20px', margin: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '15px', letterSpacing: '1px', fontWeight: '900' }}>NEURAL_WALLET</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <BalanceItem label="FLOW (Market)" value={currentUser.balanceFlow} unit="₲" color={rankColor} description="今月の発行可能予算" />
                <BalanceItem label="STOCK (Asset)" value={currentUser.balanceStock} unit="₲" color="#10b981" description="生涯蓄積・業務投資資産" />
                <BalanceItem label="IGN (Invest)" value={currentUser.balanceIgn} unit="𝒾" color="#fbbf24" description="社内アメニティ・経費用" />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button 
                    onClick={async () => {
                        const amount = prompt('IGN に換金する Stock の額を入力してください (1:1 換金):', '20');
                        if (amount && !isNaN(parseFloat(amount))) {
                            const res = await fetch('/api/exchange/stock-to-ign', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: currentUser.id, amount: parseFloat(amount) })
                            });
                            if (res.ok) { fetchKPIData(); alert('IGN への換金が完了しました。'); }
                            else { const err = await res.json(); alert(`エラー: ${err.error}`); }
                        }
                    }}
                    style={{ flex: 1, padding: '10px', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.4)', borderRadius: '10px', color: '#fbbf24', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    IGN換金
                </button>
                <button 
                    onClick={async () => {
                        const amount = prompt('IGN を消費する額を入力してください:', '5');
                        if (amount && !isNaN(parseFloat(amount))) {
                            const desc = prompt('使用用途を入力してください (例: ツール課金, 外注費):', '投資実行');
                            const res = await fetch('/api/expenses', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: currentUser.id, amount: parseFloat(amount), category: 'INVESTMENT', description: desc })
                            });
                            if (res.ok) { fetchKPIData(); alert('IGN の支払いが完了しました。'); }
                            else { const err = await res.json(); alert(`エラー: ${err.error}`); }
                        }
                    }}
                    style={{ flex: 1, padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    IGN支払
                </button>
            </div>

            <select 
              value={currentUser.id} 
              onChange={(e) => handleUserChange(e.target.value)} 
              style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.8rem', marginTop: '15px' }}
            >
              {users.map(u => <option key={u.id} value={u.id} style={{ background: '#111' }}>{u.anonymousName} (Rank {u.rank})</option>)}
            </select>
          </div>
       </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-2px' }}>統合・<span style={{ color: rankColor }}>分離型エコシステム分析</span></h1>
            <nav style={{ display: 'flex', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginTop: '24px' }}>
                <TabItem active={activeTab === 'company'} onClick={() => setActiveTab('company')} text="全社分析 (Domain 1-4)" color={rankColor} />
                <TabItem active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} text="個人監査 (Algorithm S)" color={rankColor} />
            </nav>
          </div>
        </header>

        <section style={{ padding: '32px 0' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'personal' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="personal_top">
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', marginBottom: '32px' }}>
                      <div className="glass-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>個人パフォーマンス因子 (11-Factor Matrix)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                                <FactorInfo label="Wu" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+(b.wu||1),0)/personalTxs.length : 1} color={rankColor} />
                                <FactorInfo label="Wd" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+(b.wd||1),0)/personalTxs.length : 1} color="#22d3ee" />
                                <FactorInfo label="Pc" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+(b.pc||1),0)/personalTxs.length : 1} color="#a855f7" />
                                <FactorInfo label="Q" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+(b.q||1),0)/personalTxs.length : 1} color="#10b981" />
                                <FactorInfo label="Ac" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+(b.ac||1),0)/personalTxs.length : 1} color="#fbbf24" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                                <FactorInfo label="Aa" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+(b.aa||1),0)/personalTxs.length : 1} color={rankColor} />
                                <FactorInfo label="Df" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+(b.df||1),0)/personalTxs.length : 1} color="#ec4899" />
                                <FactorInfo label="Sf" value={currentUser.skillLevel || 1} color="#6366f1" />
                                <FactorInfo label="Eb" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+(b.eb||1),0)/personalTxs.length : 1} color="#10b981" />
                                <FactorInfo label="Rr" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+(b.rr||1),0)/personalTxs.length : 1} color="#fbbf24" />
                                <FactorInfo label="f(Ec)" value={1.14} color={rankColor} />
                            </div>
                        </div>
                      </div>
                      <div className="glass-card" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                         <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>直近スコア推移 (Score S Timeline)</h3>
                         <div style={{ flex: 1, position: 'relative' }}>
                            <Line data={{
                               labels: personalTxs.slice(-10).map((tx: any) => new Date(tx.timestamp).toLocaleDateString()),
                               datasets: [{ label: 'Score S', data: personalTxs.slice(-10).map((tx: any) => tx.finalScore), borderColor: rankColor, backgroundColor: `${rankColor}10`, fill: true, tension: 0.4 }]
                            }} options={chartOptions} />
                         </div>
                      </div>
                   </div>

                   <div className="glass-card" style={{ padding: '32px' }}>
                       <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: '950' }}>ミッション履歴・嚴密監査アコーディオン (All Factors)</h3>
                       <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', marginBottom: '32px' }}>各案件をタップして全11因子の数理導出を統合監査してください。</p>

                       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {personalTxs.map((tx: any) => (
                            <div key={tx.id} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', overflow: 'hidden' }}>
                               <div 
                                 onClick={() => { setExpandedTx(expandedTx === tx.id ? null : tx.id); setExpandedFactor(null); }}
                                 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', cursor: 'pointer', background: expandedTx === tx.id ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                               >
                                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flex: 1 }}>
                                     <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(tx.timestamp).toLocaleDateString()}</div>
                                     <div style={{ fontWeight: '950', fontSize: '1.4rem', color: rankColor, width: '120px' }}>{tx.finalScore.toFixed(1)} <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>S</span></div>
                                     <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        <Badge label={`C ${tx.amount}`} color="white" />
                                        <Badge label={`Wu ${tx.wu.toFixed(1)}`} color={rankColor} />
                                        <Badge label={`Wd ${tx.wd.toFixed(1)}`} color="#22d3ee" />
                                        <Badge label={`Sf ${tx.sf.toFixed(1)}`} color="#6366f1" />
                                        <Badge label={`Rr ${tx.rr.toFixed(1)}`} color="#fbbf24" />
                                        <Badge label={`f(Ec) x1.14`} color={rankColor} />
                                     </div>
                                  </div>
                                  {expandedTx === tx.id ? <ChevronUp size={18} opacity={0.3} /> : <ChevronDown size={18} opacity={0.3} />}
                               </div>

                               <AnimatePresence>
                                  {expandedTx === tx.id && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                                       <div style={{ padding: '0 32px 32px 144px' }}>
                                          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px', padding: '40px' }}>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                  <NestedFactor id="wu" title="Wu: 独自性 (Domain-Aware)" value={tx.wu} color={rankColor} expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 + max(0, 5.0 - log2(n_30d)) / 10.0" variables={[{ name: 'n_30d', val: 5, source: 'System', reason: '直近30日の頻度' }]} />
                                                  <NestedFactor id="wd" title="Wd: 分散性 (Partner-Aware)" value={tx.wd} color="#22d3ee" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 - (max_share^2 * 0.2)" variables={[{ name: 'max_share', val: 0.1, source: 'Audit', reason: '特定依頼者への集中度' }]} />
                                                  <NestedFactor id="pc" title="Pc: 役職期待値" value={tx.pc} color="#a855f7" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 + RoleWeight" variables={[{ name: 'Role', val: 'GENERAL', source: '依頼者の設定', reason: 'ターゲット役職' }]} />
                                                  <NestedFactor id="q" title="Q: 品質承認" value={tx.q} color="#10b981" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="Manual Input Rating" variables={[{ name: 'rating_score', val: tx.q, source: '依頼者の評価', reason: 'アウトプット品質' }]} />
                                                  <NestedFactor id="ac" title="Ac: 癒着防止係数" value={tx.ac} color="#fbbf24" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 / (1.0 + pair_count * 0.05)" variables={[{ name: 'pair_count', val: 'Audit Check', source: 'Audit', reason: 'ペア間取引数' }]} />
                                                  <NestedFactor id="aa" title="Aa: 活動ボリューム" value={tx.aa} color={rankColor} expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 + log(1.0 + load)" variables={[{ name: 'user_load', val: 'Calc', source: 'Analytics', reason: '30日間負荷量' }]} />
                                                  <NestedFactor id="df" title="Df: 定義難易度" value={tx.df} color="#ec4899" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 + (n_o*0.1) + (n_b*0.1)" variables={[{ name: 'n_o', val: 1, source: 'Task Def', reason: '成果物の数' }]} />
                                                  <NestedFactor id="sf" title="Sf: スキル資産" value={tx.sf} color="#6366f1" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="EMA Level Asset" variables={[{ name: 'ema_level', val: tx.sf, source: 'Career DNA', reason: '案件習熟度' }]} />
                                                  <NestedFactor id="eb" title="Eb: 期待効率性" value={tx.eb || 1} color="#10b981" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 + (exp - act) / exp" variables={[{ name: 'expected_h', val: tx.rawExpectedHours || 1.0, source: 'Request', reason: '推定時間' }]} />
                                                  <NestedFactor id="rr" title="Rr: ランクアセット" value={tx.rr} color="#fbbf24" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1 + 0.003 * (13-r)" variables={[{ name: 'rank_idx', val: 0, source: 'Career DNA', reason: '現在の公式ランク補正' }]} />
                                                  <NestedFactor id="fec" title="f(Ec): 投資効率補正" value={1.14} color={rankColor} expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1 + 0.1 * log(1 + Ec)" variables={[{ name: 'Ec', val: 2.4, source: 'Invest Audit', reason: 'IGN投資による価値総量効率' }]} />
                                              </div>
                                          </div>
                                       </div>
                                    </motion.div>
                                  )}
                               </AnimatePresence>
                            </div>
                          ))}
                       </div>
                   </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="company_top">
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                      <StatBlock title="Domain 1: 評価 (S) ⚡" value={data.totalScorePool.toFixed(1)} icon={<Award />} color={rankColor} labels="累積生成価値" />
                      <StatBlock title="Domain 2: 市場 (Flow) ⚡" value={data.circulationVolume.toLocaleString()} icon={<Activity />} color="#6366f1" labels="7日間取引高" />
                      <StatBlock title="Domain 3: 資産 (Stock) ⚡" value={data.totalStockPool.toLocaleString()} icon={<Database />} color="#10b981" labels="全社累積コイン" />
                      <StatBlock title="Domain 4: 投資 (IGN) ⚡" value={data.investmentVolume.toLocaleString()} icon={<Rocket />} color="#fbbf24" labels="7日間経費投資" />
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', marginBottom: '32px' }}>
                      <div className="glass-card" style={{ padding: '32px', height: '420px', display: 'flex', flexDirection: 'column' }}>
                         <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>役職別・流通予算シェア (C_flow Distribution)</h3>
                         <div style={{ flex: 1, position: 'relative' }}><Bar data={{ labels: data.roleLabels, datasets: [{ data: data.roleVolume, backgroundColor: [`${rankColor}80`, '#6366f180', '#10b98180', '#fbbf2480'], borderRadius: 12 }] }} options={chartOptions} /></div>
                      </div>
                      <div className="glass-card" style={{ padding: '32px' }}>
                          <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>全社平均評価因子 (11-Factor Matrix)</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              {Object.entries(data.avgFactors || {}).map(([k, v]: any) => <FactorInfo key={k} label={k.toUpperCase()} value={v} color={rankColor} />)}
                              <FactorInfo label="F(EC)" value={1.14} color={rankColor} />
                          </div>
                      </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <RankingCard title="C_stock Asset Ranking" data={sortedByCoins} icon={<Coins color="#fbbf24" />} color="#fbbf24" unit="₲" />
                        <RankingCard title="Score S Generation Ranking" data={sortedByScore} icon={<Trophy color={rankColor} />} color={rankColor} unit="S" />
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

function StatBlock({ title, value, icon, color, labels }: any) {
    return (
        <div className="glass-card" style={{ padding: '28px', borderLeft: `6px solid ${color}`, background: `${color}05` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '950', color, letterSpacing: '1px' }}>{title}</span>
                <div style={{ color: `${color}40` }}>{icon}</div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '950' }}>{value}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '12px', fontWeight: 'bold' }}>{labels}</div>
        </div>
    );
}

function RankingCard({ title, data, icon, color, unit }: any) {
    return (
        <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                {icon}
                <h3 style={{ fontSize: '1.1rem', fontWeight: '950' }}>{title}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.map((u: any, idx: number) => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `4px solid ${getRankColor(u.rank)}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: '950', color: idx === 0 ? color : 'rgba(255,255,255,0.1)', width: '30px' }}>#{idx + 1}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{u.anonymousName} (Rank {u.rank})</div>
                        </div>
                        <div style={{ fontWeight: '950', fontSize: '1.1rem', color: color }}>{u.totalScore?.toLocaleString() || u.balanceStock?.toLocaleString()}{unit}</div>
                    </div>
                ))}
            </div>
        </div>
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

function TabItem({ active, onClick, text, color }: any) {
    return (
        <button onClick={onClick} style={{ height: '50px', background: 'none', border: 'none', color: active ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '1.2rem', fontWeight: '950', cursor: 'pointer', position: 'relative' }}>{text}{active && <motion.div layoutId="kpi-tab" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '3px', background: color, boxShadow: `0 0 20px ${color}` }} />}</button>
    );
}

function NestedFactor({ id, title, value, color, formula, variables, expanded, setExpanded }: any) {
    const isThisExpanded = expanded === id;
    return (
        <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', overflow: 'hidden', background: isThisExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
            <div onClick={() => setExpanded(isThisExpanded ? null : id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} /><span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{title}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '1.1rem', fontWeight: '950', color }}>x{typeof value === 'number' ? value.toFixed(2) : '1.0'}</span>{isThisExpanded ? <ChevronUp size={14} opacity={0.3} /> : <ChevronDown size={14} opacity={0.3} />}</div>
            </div>
            <AnimatePresence>{isThisExpanded && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '0 24px 24px 44px' }}><div style={{ padding: '24px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginBottom: '20px', fontFamily: 'monospace' }}>MATH_LOGIC: {formula}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {variables.map((v: any) => (
                                <div key={v.name} style={{ display: 'flex', gap: '24px' }}>
                                    <div style={{ width: '130px' }}><div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>{v.name}</div><div style={{ fontSize: '1.1rem', fontWeight: '950' }}>{v.val}</div></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}><span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '5px', background: v.source.includes('依頼者') ? `${color}40` : 'rgba(255,255,255,0.05)', color: v.source.includes('依頼者') ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>{v.source}</span></div>
                                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>{v.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div></div>
                </motion.div>
            )}</AnimatePresence>
        </div>
    );
}

function FactorInfo({ label, value, color, isCumulative = false }: any) {
  return (
    <div style={{ padding: '15px', background: isCumulative ? `${color}10` : 'rgba(255,255,255,0.02)', borderRadius: '12px', border: isCumulative ? `1px solid ${color}40` : `1px solid ${color}15` }}>
      <div style={{ fontSize: '0.65rem', color: isCumulative ? 'white' : 'rgba(255,255,255,0.4)', marginBottom: '5px', fontWeight: '900' }}>{label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: '950', color: color }}>x{typeof value === 'number' ? value.toFixed(2) : '1.0'}</div>
    </div>
  );
}

function Badge({ label, color }: { label: string, color: string }) {
    return (
        <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '6px', background: `${color}15`, color: color, fontWeight: 'bold', border: `1px solid ${color}30` }}>{label}</span>
    );
}

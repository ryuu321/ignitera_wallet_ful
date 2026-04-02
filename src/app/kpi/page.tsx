"use client"

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Zap, Briefcase, User, Calculator, ChevronDown, ChevronUp, Clock, Target, Layers, Cpu, Brain, ShieldCheck, Activity, Award, LayoutDashboard, Settings, Terminal, Database, ShieldAlert, History, Microscope, Search, Coins, Trophy, Medal
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

  // Mobile Lite Layout
  if (viewMode === 'mobile') {
    return (
      <div style={{ background: '#05050e', minHeight: '100vh', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ background: `${rankColor}15`, padding: '30px', borderRadius: '30px', border: `1px solid ${rankColor}30`, marginBottom: '30px' }}>
             <Microscope size={60} color={rankColor} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '950', marginBottom: '15px' }}>ANALYTICS_LOCKED</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', maxWidth: '300px', lineHeight: '1.6', marginBottom: '40px' }}>
             詳細なパフォーマンス監査と数理因子分析はデスクトップ版でのみ利用可能です。PCからアクセスしてください。
          </p>
          <button onClick={toggleViewMode} style={{ background: 'none', border: `1px solid ${rankColor}40`, color: rankColor, padding: '12px 24px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '900' }}>
             FORCE_DESKTOP_UI
          </button>

          {/* Bottom Nav */}
          <nav style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', height: '75px', background: 'rgba(20,20,25,0.9)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', display: 'flex', padding: '0 15px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', zIndex: 1000 }}>
             <button onClick={() => location.href='/'} style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <LayoutDashboard size={22} />
                <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>HOME</span>
             </button>
             <button onClick={() => location.href='/marketplace'} style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Briefcase size={22} />
                <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>MARKET</span>
             </button>
             <button onClick={() => alert('支払いQR読取(未実装)')} style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Zap size={22} />
                <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>PAY</span>
             </button>
             <button onClick={() => location.href='/profile'} style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <User size={22} />
                <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>DNA</span>
             </button>
          </nav>
      </div>
    );
  }

  // Desktop Layout
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
                            if (res.ok) { fetchKPIData(); alert('IGN への換金が完了しました。'); }
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
                            const desc = prompt('使用用途を入力してください:', 'アメニティ利用');
                            const res = await fetch('/api/expenses', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: currentUser.id, amount, category: 'GENERAL', description: desc })
                            });
                            if (res.ok) { fetchKPIData(); alert('IGN の支払いが完了しました。'); }
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
              style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.8rem', marginBottom: '15px' }}
            >
              {users.map(u => <option key={u.id} value={u.id} style={{ background: '#111' }}>{u.anonymousName} (ランク-{u.rank})</option>)}
            </select>
            <button 
                onClick={async () => {
                    if (confirm('システム時間（月）を進めますか？発行残高のリセット等が行われます。')) {
                        const res = await fetch('/api/simulate/next-month', { method: 'POST' });
                        if (res.ok) { fetchKPIData(); alert('翌月のシミュレーションが完了しました。'); }
                    }
                }}
                style={{ width: '100%', padding: '10px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '8px', color: '#6366f1', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>
                <History size={12} style={{ marginRight: '6px' }} /> 月を進める (Simulation)
             </button>
          </div>
       </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-2px' }}>システム・<span style={{ color: rankColor }}>インテリジェンス</span></h1>
            <nav style={{ display: 'flex', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginTop: '24px' }}>
                <TabItem active={activeTab === 'company'} onClick={() => setActiveTab('company')} text="全社分析" color={rankColor} />
                <TabItem active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} text="個人分析" color={rankColor} />
            </nav>
          </div>
        </header>

        <section style={{ padding: '32px 0' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'personal' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="personal_top">
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', marginBottom: '32px' }}>
                      <div className="glass-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>個人パフォーマンス因子 (平均/アセット)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', fontWeight: '950', letterSpacing: '1px' }}>キャリア資産 (蓄積系)</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <FactorInfo label="Sf (Skill DNA)" value={currentUser.skillLevel} color="#6366f1" isCumulative />
                                    <FactorInfo label="Rr (Rank Asset)" value={1.0 + (RANK_LADDER.indexOf(currentUser.rank)*0.1)} color="#fbbf24" isCumulative />
                                    <FactorInfo label="Aa (Activity Avg)" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+b.aa,0)/personalTxs.length : 1} color="#a855f7" isCumulative />
                                    <FactorInfo label="Wd (Diversity Avg)" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+b.wd,0)/personalTxs.length : 1} color="#22d3ee" isCumulative />
                                    <FactorInfo label="Ac (Integrity Avg)" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+b.ac,0)/personalTxs.length : 1} color="#fbbf24" isCumulative />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', fontWeight: '950', letterSpacing: '1px' }}>実行パフォーマンス (変動系)</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <FactorInfo label="Q (Quality Avg)" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+b.q,0)/personalTxs.length : 1} color="#10b981" />
                                    <FactorInfo label="Eb (Efficiency Avg)" value={personalTxs.length > 0 ? (personalTxs.reduce((a:any,b:any)=>a+(b.eb||1),0)/personalTxs.length) : 1} color="#22d3ee" />
                                    <FactorInfo label="Wu (Uniqueness Avg)" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+b.wu,0)/personalTxs.length : 1} color={rankColor} />
                                    <FactorInfo label="Df (Difficulty Avg)" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+b.df,0)/personalTxs.length : 1} color="#ec4899" />
                                    <FactorInfo label="Pc (Expectation Avg)" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+b.pc,0)/personalTxs.length : 1} color="#a855f7" />
                                </div>
                            </div>
                        </div>
                      </div>
                      <div className="glass-card" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                         <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>直近スコア推移 (Formula-S Timeline)</h3>
                         <div style={{ flex: 1, position: 'relative' }}>
                            <Line data={{
                               labels: personalTxs.slice(-10).map((tx: any) => new Date(tx.timestamp).toLocaleDateString()),
                               datasets: [{ label: 'Score S', data: personalTxs.slice(-10).map((tx: any) => tx.finalScore), borderColor: rankColor, backgroundColor: `${rankColor}10`, fill: true, tension: 0.4 }]
                            }} options={chartOptions} />
                         </div>
                      </div>
                   </div>

                   <div className="glass-card" style={{ padding: '32px' }}>
                       <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: '950' }}>ミッション履歴・嚴密監査アコーディオン</h3>
                       <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', marginBottom: '32px' }}>各案件をタップして全11因子の導出計算を解読してください。</p>

                       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {personalTxs.map((tx: any) => (
                            <div key={tx.id} style={{ border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px' }}>
                               <div 
                                 onClick={() => { setExpandedTx(expandedTx === tx.id ? null : tx.id); setExpandedFactor(null); }}
                                 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', cursor: 'pointer', background: expandedTx === tx.id ? 'rgba(255,255,255,0.03)' : 'transparent', borderRadius: '16px' }}
                               >
                                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flex: 1 }}>
                                     <div style={{ fontSize: '0.85rem', width: '80px', color: 'rgba(255,255,255,0.3)' }}>{new Date(tx.timestamp).toLocaleDateString()}</div>
                                     <div style={{ fontWeight: '950', fontSize: '1.2rem', color: rankColor, width: '120px' }}>S: {tx.finalScore.toFixed(1)}</div>
                                     <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        <Badge label={`C ${tx.amount}`} color="white" />
                                        <Badge label={`Wu ${tx.wu.toFixed(1)}`} color={rankColor} />
                                        <Badge label={`Wd ${tx.wd.toFixed(1)}`} color="#22d3ee" />
                                        <Badge label={`Pc ${tx.pc.toFixed(1)}`} color="#a855f7" />
                                        <Badge label={`Q ${tx.q.toFixed(1)}`} color="#10b981" />
                                        <Badge label={`Ac ${tx.ac.toFixed(1)}`} color="#fbbf24" />
                                        <Badge label={`Aa ${tx.aa.toFixed(1)}`} color={rankColor} />
                                        <Badge label={`Df ${tx.df.toFixed(1)}`} color="#ec4899" />
                                        <Badge label={`Sf ${tx.sf.toFixed(1)}`} color="#6366f1" />
                                        <Badge label={`Eb ${tx.eb.toFixed(1)}`} color="#10b981" />
                                        <Badge label={`Rr ${tx.rr.toFixed(1)}`} color="#fbbf24" />
                                     </div>
                                  </div>
                                  {expandedTx === tx.id ? <ChevronUp size={18} opacity={0.3} /> : <ChevronDown size={18} opacity={0.3} />}
                               </div>

                               <AnimatePresence>
                                  {expandedTx === tx.id && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                       <div style={{ padding: '0 24px 32px 144px' }}>
                                          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px' }}>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                  <NestedFactor id="wu" title="Wu: 独自性" value={tx.wu} color={rankColor} expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 + max(0, 5.0 - log2(n_30d)) / 10.0" variables={[{ name: 'n_30d', val: tx.rawFrequency || 1, source: 'System Registry', reason: '直近30日間の全社タスク頻度。', detailFormula: 'log2(req_count)' }]} />
                                                  <NestedFactor id="wd" title="Wd: 分散性" value={tx.wd} color="#22d3ee" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 - (max_share^2 * 0.2)" variables={[{ name: 'max_share', val: tx.rawMaxShare || '0.12', source: 'Ledger Audit', reason: `特定依頼者への集中度。`, detailFormula: 'partner_count / total_completed' }]} />
                                                  <NestedFactor id="pc" title="Pc: 役職期待" value={tx.pc} color="#a855f7" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 + RoleWeight" variables={[{ name: 'Role', val: 'GENERAL', source: '依頼者の設定', reason: 'ターゲット役職。' }]} />
                                                  <NestedFactor id="q" title="Q: 品質承認" value={tx.q} color="#10b981" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="Manual Input Rating" variables={[{ name: 'rating_score', val: tx.q, source: '依頼者の評価', reason: 'アウトプット品質。' }]} />
                                                  <NestedFactor id="ac" title="Ac: 癒着防止" value={tx.ac} color="#fbbf24" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 / (1.0 + same_partner_count * 0.05)" variables={[{ name: 'partner_count', val: 'Audit Check', source: 'System Audit', reason: '特定ペア間取引数。', detailFormula: 'tx_history.filter(pair).length' }]} />
                                                  <NestedFactor id="aa" title="Aa: 活動指標" value={tx.aa} color={rankColor} expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 + log(1.0 + load / avg_load)" variables={[{ name: 'user_load', val: 'Calc', source: 'System Analytics', reason: '30日間負荷量。', detailFormula: 'sum(df_i)' }]} />
                                                  <NestedFactor id="df" title="Df: 難易度" value={tx.df} color="#ec4899" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 + (n_o*0.1) + (n_b*0.1) + (s_req/10)" variables={[{ name: 'n_o', val: tx.rawOutputs || 1, source: '依頼者の設定', reason: '要求物の総数。' },{ name: 'n_b', val: tx.rawBranches || 0, source: '依頼者の設定', reason: '要件分岐。' },{ name: 's_req', val: tx.rawRequiredSkill || '1.0', source: '依頼者の設定', reason: '要求スキルレベル。' }]} />
                                                  <NestedFactor id="sf" title="Sf: スキル習熟" value={tx.sf} color="#6366f1" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="EMA_prev * 0.9 + Q_current * 0.1" variables={[{ name: 'ema_level', val: tx.sf, source: 'あなたのキャリア資産', reason: '累次ミッション習熟度。', detailFormula: 'EMA calculation' }]} />
                                                  <NestedFactor id="eb" title="Eb: 効率性" value={tx.eb || 1} color="#10b981" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 + max(0, (expected - actual) / expected)" variables={[{ name: 'expected_h', val: tx.rawExpectedHours || 1.0, source: '依頼者の設定', reason: '推定納期。' },{ name: 'actual_h', val: tx.rawActualHours || 'N/A', source: 'Performer Data', reason: '実働時間。', detailFormula: '(exp - act) / exp' }]} />
                                                  <NestedFactor id="rr" title="Rr: ランクアセット" value={tx.rr} color="#fbbf24" expanded={expandedFactor} setExpanded={setExpandedFactor} formula="1.0 + (current_rank_idx * 0.1)" variables={[{ name: 'rank_idx', val: RANK_LADDER.indexOf(currentUser.rank), source: 'あなたのキャリア資産', reason: 'ランク補正。' }]} />
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
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '32px' }}>
                      <div className="glass-card" style={{ padding: '32px', height: '420px', display: 'flex', flexDirection: 'column' }}>
                         <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>役職別リソース分配 (₲)</h3>
                         <div style={{ flex: 1, position: 'relative' }}><Bar data={{ labels: data.roleLabels, datasets: [{ data: data.roleVolume, backgroundColor: [rankColor, '#a855f7', '#22d3ee', '#10b981'], borderRadius: 12 }] }} options={chartOptions} /></div>
                      </div>
                      <div className="glass-card" style={{ padding: '32px' }}>
                          <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>全社平均評価因子 (Global Matrix)</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              {Object.entries(data.avgFactors || {}).map(([k, v]: any) => <FactorInfo key={k} label={k.toUpperCase()} value={v} color={rankColor} />)}
                          </div>
                      </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                <Coins size={20} color="#fbbf24" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '950' }}>ストックコイン・ランキング (₲)</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {sortedByCoins.map((u, idx) => (
                                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `4px solid ${getRankColor(u.rank)}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '950', color: idx === 0 ? '#fbbf24' : 'rgba(255,255,255,0.3)', width: '30px' }}>#{idx + 1}</div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{u.anonymousName}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>RANK-{u.rank}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: '950', fontSize: '1.1rem', color: '#fbbf24' }}>₲{u.balanceStock.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                <Trophy size={20} color={rankColor} />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '950' }}>累計 Sスコア・ランキング (S)</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {sortedByScore.map((u, idx) => (
                                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `4px solid ${getRankColor(u.rank)}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '950', color: idx === 0 ? rankColor : 'rgba(255,255,255,0.3)', width: '30px' }}>#{idx + 1}</div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{u.anonymousName}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>RANK-{u.rank}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: '950', fontSize: '1.1rem', color: rankColor }}>{u.totalScore.toFixed(1)} S</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
        </section>
      </main>
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

function NestedFactor({ id, title, value, color, formula, variables, expanded, setExpanded }: any) {
    const isThisExpanded = expanded === id;
    return (
        <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', overflow: 'hidden', background: isThisExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
            <div onClick={() => setExpanded(isThisExpanded ? null : id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} /><span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{title}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '1.1rem', fontWeight: '950', color }}>x{value.toFixed(2)}</span>{isThisExpanded ? <ChevronUp size={14} opacity={0.3} /> : <ChevronDown size={14} opacity={0.3} />}</div>
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
                                        {v.detailFormula && <div style={{ marginTop: '8px', fontSize: '0.65rem', color: color, fontFamily: 'monospace', opacity: 0.8 }}>Sub_Formula: {v.detailFormula}</div>}
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

function TabItem({ active, onClick, text, color }: any) {
    return (
        <button onClick={onClick} style={{ height: '50px', background: 'none', border: 'none', color: active ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '1.2rem', fontWeight: '950', cursor: 'pointer', position: 'relative' }}>{text}{active && <motion.div layoutId="kpi-tab" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '3px', background: color, boxShadow: `0 0 20px ${color}` }} />}</button>
    );
}

function FactorInfo({ label, value, color, isCumulative = false }: any) {
  return (
    <div style={{ padding: '15px', background: isCumulative ? `${color}10` : 'rgba(255,255,255,0.02)', borderRadius: '12px', border: isCumulative ? `1px solid ${color}40` : `1px solid ${color}15` }}>
      <div style={{ fontSize: '0.65rem', color: isCumulative ? 'white' : 'rgba(255,255,255,0.4)', marginBottom: '5px', fontWeight: '900' }}>{label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: '950', color: color }}>x{value?.toFixed(2) || '1.0'}</div>
    </div>
  );
}

function Badge({ label, color }: { label: string, color: string }) {
    return (
        <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '6px', background: `${color}15`, color: color, fontWeight: 'bold', border: `1px solid ${color}30` }}>{label}</span>
    );
}

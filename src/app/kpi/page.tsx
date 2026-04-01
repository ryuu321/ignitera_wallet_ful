"use client"

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Zap, Briefcase, User, Calculator, ChevronDown, ChevronUp, Clock, Target, Layers, Cpu, Brain, ShieldCheck, Activity, Award, LayoutDashboard, Settings, Terminal, Database, ShieldAlert, History, Microscope, Search
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

  useEffect(() => {
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
    fetchKPIData();
  }, []);

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
          <div style={{ padding: '20px', margin: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>デモ切替</div>
             <select value={currentUser.id} onChange={(e) => handleUserChange(e.target.value)} style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.85rem' }}>
               {users.map(u => <option key={u.id} value={u.id} style={{ background: '#111' }}>{u.anonymousName}</option>)}
             </select>
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
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="personal_top">
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', marginBottom: '32px' }}>
                      <div className="glass-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>個人マトリクス・アセット</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                           <FactorInfo label="Sf (Skill DNA)" value={currentUser.skillLevel} color="#6366f1" isCumulative />
                           <FactorInfo label="Rr (Rank Asset)" value={1.0 + (RANK_LADDER.indexOf(currentUser.rank)*0.1)} color="#fbbf24" isCumulative />
                           <FactorInfo label="Q (Quality Avg)" value={personalTxs.length > 0 ? personalTxs.reduce((a:any,b:any)=>a+b.q,0)/personalTxs.length : 1} color="#10b981" />
                           <FactorInfo label="Eb (Efficiency Avg)" value={personalTxs.length > 0 ? (personalTxs.reduce((a:any,b:any)=>a+(b.eb||1),0)/personalTxs.length) : 1} color="#22d3ee" />
                        </div>
                      </div>
                      <div className="glass-card" style={{ padding: '32px', height: '300px', display: 'flex', flexDirection: 'column' }}>
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
                       <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', marginBottom: '32px' }}>各案件をタップして深層因子を監査してください。2段階の構造により変数の導出理由を解読可能です。</p>

                       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {personalTxs.map((tx: any) => (
                            <div key={tx.id} style={{ border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px' }}>
                               <div 
                                 onClick={() => { setExpandedTx(expandedTx === tx.id ? null : tx.id); setExpandedFactor(null); }}
                                 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', cursor: 'pointer', background: expandedTx === tx.id ? 'rgba(255,255,255,0.03)' : 'transparent', borderRadius: '16px' }}
                               >
                                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flex: 1 }}>
                                     <div style={{ fontSize: '0.85rem', width: '80px', color: 'rgba(255,255,255,0.3)' }}>{new Date(tx.timestamp).toLocaleDateString()}</div>
                                     <div style={{ fontWeight: '950', fontSize: '1rem', width: '70px' }}>₲{tx.amount}</div>
                                     <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.9rem', padding: '6px 16px', background: `${rankColor}20`, color: rankColor, borderRadius: '10px', fontWeight: '950', border: `1px solid ${rankColor}30` }}>S: {tx.finalScore.toFixed(1)}</div>
                                        <div style={{ display: 'flex', gap: '6px', opacity: expandedTx === tx.id ? 0.3 : 1 }}>
                                           <Badge label={`Wu ${tx.wu.toFixed(1)}`} color={rankColor} />
                                           <Badge label={`Q ${tx.q.toFixed(1)}`} color="#10b981" />
                                           <Badge label={`Eb ${tx.eb.toFixed(1)}`} color="#22d3ee" />
                                           <Badge label={`Df ${tx.df.toFixed(1)}`} color="#ec4899" />
                                        </div>
                                     </div>
                                  </div>
                                  {expandedTx === tx.id ? <ChevronUp size={18} opacity={0.3} /> : <ChevronDown size={18} opacity={0.3} />}
                               </div>

                               <AnimatePresence>
                                  {expandedTx === tx.id && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                       <div style={{ padding: '0 32px 40px 144px' }}>
                                          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px' }}>
                                              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}><Terminal size={16} opacity={0.3} /> <span style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.3 }}>DEEP_AUDIT_TRACE</span></div>
                                              
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                  <NestedFactor 
                                                      id="wu" title="Wu: 独自性" value={tx.wu} color={rankColor} expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                      formula="1.0 + max(0, 5.0 - log2(n_30d)) / 10.0"
                                                      variables={[
                                                          { name: 'n_30d', val: tx.rawFrequency || 1, source: 'System Registry', reason: `直近30日間に全社で ${tx.rawFrequency || 1} 回発行されたミッション。希少価値が高いプロトコルほど係数がブーストされます。` }
                                                      ]}
                                                  />
                                                  <NestedFactor 
                                                      id="wd" title="Wd: 分散性 (依存度抑制)" value={tx.wd} color="#22d3ee" expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                      formula="1.0 - (max_share^2 * 0.2)"
                                                      variables={[
                                                          { name: 'max_share', val: tx.rawMaxShare || '0.12', source: 'Ledger Audit', reason: `現時点での特定依頼者への集中度。${((tx.rawMaxShare || 0.12)*100).toFixed(1)}% のタスクが同一の依頼者に依存しています。組織としての公平性を保つため、依存度が高いと負の補正が働きます。` }
                                                      ]}
                                                  />
                                                  <NestedFactor 
                                                      id="q" title="Q: 品質承認" value={tx.q} color="#10b981" expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                      formula="Rating Input (0.1 - 1.5)"
                                                      variables={[
                                                          { name: 'quality_score', val: tx.q, source: '依頼者の評価', reason: '「業務完了承認」の際に、依頼者がプロダクトのアウトプット品質を評価した確定値です。' }
                                                      ]}
                                                  />
                                                  <NestedFactor 
                                                      id="df" title="Df: 難易度" value={tx.df} color="#ec4899" expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                      formula="1.0 + (n_o*0.1) + (n_b*0.1) + (s_req/10)"
                                                      variables={[
                                                          { name: 'n_o (Outputs)', val: tx.rawOutputs || 1, source: '依頼者の設定', reason: '要求された提出物の数。' },
                                                          { name: 'n_b (Branches)', val: tx.rawBranches || 0, source: '依頼者の設定', reason: '要件分岐の複雑性（条件分岐数）。' },
                                                          { name: 's_req (Required Skill)', val: tx.rawRequiredSkill || '1.0', source: '依頼者の設定', reason: `依頼者がこのミッションに要求した DNA 到達基準 (Expertise Level: ${tx.rawRequiredSkill})。要求レベルが高いほど基底難易度が上昇します。` }
                                                      ]}
                                                  />
                                                  <NestedFactor 
                                                      id="sf" title="Sf: スキル習熟 (累次ミッション)" value={tx.sf} color="#6366f1" expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                      formula="Exponential Moving Average (EMA)"
                                                      variables={[
                                                          { name: 'ema_level', val: tx.sf.toFixed(3), source: 'あなたのキャリア資産', reason: `「累次ミッション」とは、これまでにあなたが完遂した同一タグの全ミッション履歴を指します。これら過去のパフォーマンスQを蓄積・平均した数値が「習熟度（Sf）」として現れます。` }
                                                      ]}
                                                  />
                                                  <NestedFactor 
                                                      id="eb" title="Eb: 効率性" value={tx.eb || 1} color="#10b981" expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                      formula="1.0 + max(0, (expected - actual) / expected)"
                                                      variables={[
                                                          { name: 'expected_h', val: tx.rawExpectedHours || 1.0, source: '依頼者の設定', reason: '案件発行時に設定された、標準的な想定納期（時間）です。' },
                                                          { name: 'actual_h', val: tx.rawActualHours ? tx.rawActualHours.toFixed(2) : 'N/A', source: 'Performer Data', reason: tx.rawActualHours ? `実際の完遂に要した時間。想定よりも ${((tx.rawExpectedHours - tx.rawActualHours)/tx.rawExpectedHours*100).toFixed(1)}% 早く完遂したためブーストが発生しました。` : '【N/A】過去の移行データ、または実働時間が入力されずに承認されたため、標準効率(1.0)として処理されました。' }
                                                      ]}
                                                  />
                                              </div>
                                              
                                              <div style={{ marginTop: '50px', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: `1px solid ${rankColor}30` }}>
                                                  <div style={{ fontSize: '1.8rem', fontWeight: '950', marginBottom: '15px' }}>{tx.finalScore.toFixed(3)} <span style={{ fontSize: '0.8rem', color: rankColor, letterSpacing: '1px' }}>S-Points</span></div>
                                                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', lineHeight: '1.8' }}>
                                                     Equation: C({tx.amount}) x Wu({tx.wu}) x Wd({tx.wd}) x Pc({tx.pc}) x Q({tx.q}) x Ac({tx.ac}) x Aa({tx.aa}) x (Df({tx.df}) + Sf({tx.sf})) x Eb({tx.eb||1}) x Rr({tx.rr})
                                                  </div>
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
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="company_top">
                   <div className="glass-card" style={{ padding: '32px', height: '420px', marginBottom: '32px' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>役職別リソース分配状況 (₲)</h3>
                      <div style={{ flex: 1, position: 'relative' }}><Bar data={{ labels: data.roleLabels, datasets: [{ data: data.roleVolume, backgroundColor: [rankColor, '#a855f7', '#22d3ee', '#10b981'], borderRadius: 12 }] }} options={chartOptions} /></div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

function NestedFactor({ id, title, value, color, formula, variables, expanded, setExpanded }: any) {
    const isThisExpanded = expanded === id;
    return (
        <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', overflow: 'hidden', background: isThisExpanded ? 'rgba(255,255,255,0.02)' : 'transparent', transition: '0.3s' }}>
            <div onClick={() => setExpanded(isThisExpanded ? null : id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} /><span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{title}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '1.1rem', fontWeight: '950', color }}>x{value.toFixed(2)}</span>{isThisExpanded ? <ChevronUp size={14} opacity={0.3} /> : <ChevronDown size={14} opacity={0.3} />}</div>
            </div>
            <AnimatePresence>{isThisExpanded && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '0 24px 24px 44px' }}><div style={{ padding: '24px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginBottom: '20px', fontFamily: 'monospace' }}>COMPUTATION_LOGIC: {formula}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {variables.map((v: any) => (
                                <div key={v.name} style={{ display: 'flex', gap: '24px' }}>
                                    <div style={{ width: '130px' }}><div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>{v.name}</div><div style={{ fontSize: '1.1rem', fontWeight: '950' }}>{v.val}</div></div>
                                    <div style={{ flex: 1 }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}><span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '5px', background: v.source.includes('依頼者') ? `${color}40` : 'rgba(255,255,255,0.05)', color: v.source.includes('依頼者') ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>{v.source}</span></div><p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>{v.reason}</p></div>
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

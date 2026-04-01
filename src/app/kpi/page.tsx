"use client"

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Zap, Briefcase, User, Calculator, ChevronDown, ChevronUp, Clock, Target, Layers, Cpu, Brain, ShieldCheck, Activity, Award, LayoutDashboard, Settings, Terminal, Database, ShieldAlert
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
             <Link href="/settings" className={styles.navItem}><Settings size={18} /> <span>設定</span></Link>
          </nav>
          <div style={{ flex: 1 }} />
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

        <AnimatePresence mode="wait">
          {activeTab === 'personal' && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="personal" style={{ padding: '32px 0' }}>
                
                <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
                   <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>あなたのミッション履歴: 嚴密監査ログ</h3>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {personalTxs.map((tx: any) => (
                        <div key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                          <div 
                            onClick={() => { setExpandedTx(expandedTx === tx.id ? null : tx.id); setExpandedFactor(null); }}
                            style={{ 
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                              padding: '24px', cursor: 'pointer', background: expandedTx === tx.id ? 'rgba(255,255,255,0.02)' : 'transparent',
                              borderRadius: '12px', transition: '0.2s'
                            }}
                          >
                             <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flex: 1 }}>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', width: '90px' }}>{new Date(tx.timestamp).toLocaleDateString()}</div>
                                <div style={{ fontWeight: '900', fontSize: '1.1rem', width: '80px' }}>₲{tx.amount}</div>
                                <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.85rem', padding: '6px 14px', background: `${rankColor}20`, color: rankColor, borderRadius: '8px', fontWeight: '950' }}>S: {tx.finalScore.toFixed(1)}</div>
                                    <div style={{ display: 'flex', gap: '4px', opacity: expandedTx === tx.id ? 0.3 : 1 }}>
                                        <Badge label={`Wu ${tx.wu.toFixed(1)}`} color={rankColor} />
                                        <Badge label={`Q ${tx.q.toFixed(1)}`} color="#10b981" />
                                        <Badge label={`Eb ${tx.eb.toFixed(1)}`} color="#22d3ee" />
                                        <Badge label={`Df ${tx.df.toFixed(1)}`} color="#ec4899" />
                                    </div>
                                </div>
                             </div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>{expandedTx === tx.id ? 'CLOSE' : 'DEEP AUDIT'}</div>
                                {expandedTx === tx.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                             </div>
                          </div>

                          <AnimatePresence>
                            {expandedTx === tx.id && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                 <div style={{ padding: '0 32px 40px 144px' }}>
                                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px' }}>
                                        <h4 style={{ fontSize: '0.8rem', fontWeight: '950', marginBottom: '32px', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px' }}>ALGORITHM-S v2.0 NESTED TRACE</h4>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <NestedFactor 
                                                id="wu" title="Wu: 独自性 (Uniqueness Factor)" value={tx.wu} color={rankColor} expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                formula="1.0 + max(0, 5.0 - log2(n_30d)) / 10.0"
                                                variables={[
                                                    { name: 'n_30d', val: tx.rawFrequency || 1, source: 'System Registry', reason: '直近30日間の全社タスク発行頻度。希少性が高いほど報酬がブーストされます。' }
                                                ]}
                                            />
                                            <NestedFactor 
                                                id="wd" title="Wd: 分散性 (Distribution Index)" value={tx.wd} color="#22d3ee" expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                formula="1.0 - (max_share^2 * 0.2)"
                                                variables={[
                                                    { name: 'max_share', val: tx.rawMaxShare || '0.12', source: 'Transaction Ledger', reason: '特定の依頼者への依存度。依存度が高いと、組織としての公平性担保のために負の補正が働きます。' }
                                                ]}
                                            />
                                            <NestedFactor 
                                                id="pc" title="Pc: 役職期待 (Position Expectation)" value={tx.pc} color="#a855f7" expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                formula="1.0 + Position_Weight"
                                                variables={[
                                                    { name: 'Role', val: 'GENERAL', source: '依頼者の設定', reason: '依頼者が案件発行時に指定したターゲット役職。上位役職ほど高い期待（基準）が設定されます。' }
                                                ]}
                                            />
                                            <NestedFactor 
                                                id="q" title="Q: 品質点 (Quality Evaluation)" value={tx.q} color="#10b981" expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                formula="Direct Rating (0.1 - 1.5)"
                                                variables={[
                                                    { name: 'rating_score', val: tx.q, source: '依頼者の評価', reason: '業務完了承認時に依頼者が入力したクオリティ係数。プロダクトの価値を直接決定します。' }
                                                ]}
                                            />
                                            <NestedFactor 
                                                id="df" title="Df: 難易度 (Task Difficulty)" value={tx.df} color="#ec4899" expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                formula="1.0 + (n_o*0.1) + (n_b*0.1) + (s_req/10)"
                                                variables={[
                                                    { name: 'n_o (Outputs)', val: tx.rawOutputs || 1, source: '依頼者の設定', reason: '要求されるアウトプットの数。' },
                                                    { name: 'n_b (Branches)', val: tx.rawBranches || 0, source: '依頼者の設定', reason: '要件分岐の複雑性。' },
                                                    { name: 's_req (Skill)', val: tx.rawRequiredSkill || 1.0, source: '依頼者の設定', reason: '要求されるスキルの最低到達レベル。' }
                                                ]}
                                            />
                                            <NestedFactor 
                                                id="sf" title="Sf: スキル習熟 (Skill Mastery)" value={tx.sf} color="#6366f1" expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                formula="Personal EMA Level"
                                                variables={[
                                                    { name: 'ema_level', val: tx.sf, source: 'あなたのキャリア資産', reason: '過去の類似ミッションで積み上げてきたスキルの指数移動平均に基づく習熟度。' }
                                                ]}
                                            />
                                            <NestedFactor 
                                                id="eb" title="Eb: 効率性 (Execution Efficiency)" value={tx.eb || 1} color="#10b981" expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                formula="1.0 + max(0, (expected - actual) / expected)"
                                                variables={[
                                                    { name: 'expected_h', val: tx.rawExpectedHours || 1.0, source: '依頼者の設定', reason: '案件発行時に設定された推定納期。' },
                                                    { name: 'actual_h', val: tx.rawActualHours ? tx.rawActualHours.toFixed(2) : 'N/A', source: 'あなたの実行データ', reason: '実際に完遂に要した時間。短縮するほど報酬が加算されます。' }
                                                ]}
                                            />
                                            <NestedFactor 
                                                id="rr" title="Rr: ランクアセット (Rank Correction)" value={tx.rr} color="#fbbf24" expanded={expandedFactor} setExpanded={setExpandedFactor}
                                                formula="1.0 + (current_rank_idx * 0.1)"
                                                variables={[
                                                    { name: 'rank', val: currentUser.rank, source: 'あなたのキャリア資産', reason: '現在のランクが基礎係数として反映されます。' }
                                                ]}
                                            />
                                        </div>

                                        <div style={{ marginTop: '50px', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: `1px solid ${rankColor}30` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                <h5 style={{ fontSize: '0.75rem', fontWeight: '950', color: rankColor, letterSpacing: '1px' }}>TOTAL SETTLEMENT SCORE</h5>
                                                <div style={{ fontSize: '1.8rem', fontWeight: '950' }}>{tx.finalScore.toFixed(3)} <span style={{ fontSize: '0.8rem', color: rankColor }}>S</span></div>
                                            </div>
                                            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', lineHeight: '1.6' }}>
                                                Amount({tx.amount}) x Factors({(tx.finalScore/tx.amount).toFixed(4)}) = Final_S
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
            </motion.section>
          )}

          {activeTab === 'company' && (
             <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="company" style={{ padding: '32px 0' }}>
                 <div className="glass-card" style={{ padding: '32px', height: '420px', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: '950' }}>全社リソース分配 (₲)</h3>
                    <div style={{ flex: 1, position: 'relative' }}><Bar data={{ labels: data.roleLabels, datasets: [{ data: data.roleVolume, backgroundColor: [rankColor, '#a855f7', '#22d3ee', '#10b981'], borderRadius: 12 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
                 </div>
             </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NestedFactor({ id, title, value, color, formula, variables, expanded, setExpanded }: any) {
    const isThisExpanded = expanded === id;

    return (
        <div style={{ border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', overflow: 'hidden', background: isThisExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
            <div 
                onClick={() => setExpanded(isThisExpanded ? null : id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '950', color }}>x{value.toFixed(2)}</span>
                    {isThisExpanded ? <ChevronUp size={14} opacity={0.3} /> : <ChevronDown size={14} opacity={0.3} />}
                </div>
            </div>
            
            <AnimatePresence>
                {isThisExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 20px 24px 41px' }}>
                            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', marginBottom: '15px', fontFamily: 'monospace' }}>MATH_LOGIC: {formula}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {variables.map((v: any) => (
                                        <div key={v.name} style={{ display: 'flex', gap: '20px' }}>
                                            <div style={{ width: '120px' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>{v.name}</div>
                                                <div style={{ fontSize: '1rem', fontWeight: '950' }}>{v.val}</div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', background: v.source.includes('依頼者') ? `${color}30` : 'rgba(255,255,255,0.05)', color: v.source.includes('依頼者') ? color : 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>
                                                        {v.source}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>{v.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TabItem({ active, onClick, text, color }: any) {
    return (
        <button onClick={onClick} style={{ height: '50px', background: 'none', border: 'none', color: active ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '1.2rem', fontWeight: '950', cursor: 'pointer', position: 'relative', transition: '0.3s' }}>
            {text}
            {active && <motion.div layoutId="kpi-tab" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '3px', background: color, boxShadow: `0 0 20px ${color}` }} />}
        </button>
    );
}

function Badge({ label, color }: { label: string, color: string }) {
    return (
        <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '6px', background: `${color}15`, color: color, fontWeight: 'bold', border: `1px solid ${color}30` }}>
            {label}
        </span>
    );
}

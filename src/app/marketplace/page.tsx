"use client"

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Briefcase, Filter, ArrowLeft, Target, ShieldCheck, Zap, X, Send, History, Award, LayoutDashboard, User, BarChart3, Settings, Calculator, MessageSquare, Clock, MapPin, CheckCircle2, TrendingUp, AlertCircle, ChevronRight, Layers, Cpu, Brain, Rocket, Star, PlusCircle, ExternalLink, Activity, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';
import { getRankColor } from '@/lib/colors';

export default function Marketplace() {
  const [view, setView] = useState<'browse' | 'my-issued' | 'my-bids'>('browse');
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState<any>(null);
  const [showMessageModal, setShowMessageModal] = useState<any>(null);
  
  const [masterSkills, setMasterSkills] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({
    title: '', description: '', baseReward: '100', expectedValue: '2', expectedUnit: 'h', 
    outputs: 1, branches: 0, skillCount: 1, externalCount: 0, requiredSkill: '1.0',
    position: 'GENERAL', tags: [] as string[]
  });
  
  const [newBid, setNewBid] = useState({ amount: '', message: '' });
  const [qualityScore, setQualityScore] = useState('1.0');
  const [actualHours, setActualHours] = useState('');
  const [taskMessages, setTaskMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const fetchData = async () => {
    try {
      const [tRes, uRes, sRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/users'),
        fetch('/api/skills')
      ]);
      const tData = await tRes.json();
      const uData = await uRes.json();
      const sData = await sRes.json();
      
      setTasks(tData);
      setUsers(uData);
      setMasterSkills(sData);
      
      const savedId = localStorage.getItem('demo-user-id');
      const user = savedId ? uData.find((u: any) => u.id === savedId) : uData[0];
      setCurrentUser(user || uData[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUserChange = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('demo-user-id', id);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const val = parseFloat(newTask.expectedValue) || 1;
      const unitFactor = newTask.expectedUnit === 'd' ? 8 : newTask.expectedUnit === 'w' ? 40 : 1;
      const hours = val * unitFactor;

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newTask, 
          expectedHours: hours,
          requesterId: currentUser.id,
          tags: newTask.tags 
        }),
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
        setNewTask({
          title: '', description: '', baseReward: '100', expectedValue: '2', expectedUnit: 'h', 
          outputs: 1, branches: 0, skillCount: 1, externalCount: 0, requiredSkill: '1.0',
          position: 'GENERAL', tags: []
        });
      }
    } catch (err) { console.error(err); }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !showBidModal) return;
    try {
      const res = await fetch(`/api/tasks/${showBidModal.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBid, bidderId: currentUser.id }),
      });
      if (res.ok) {
        setShowBidModal(null);
        setNewBid({ amount: '', message: '' });
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const handleAcceptBid = async (taskId: string, bidId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/accept-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId }),
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReviewModal) return;
    try {
      const res = await fetch(`/api/tasks/${showReviewModal.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          qualityScore: parseFloat(qualityScore),
          actualHours: actualHours ? parseFloat(actualHours) : null 
        }),
      });
      if (res.ok) {
        setShowReviewModal(null);
        setActualHours('');
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`エラー: ${errorData.error}`);
      }
    } catch (err: any) { 
        console.error(err); 
        alert(`通信エラー: ${err.message}`);
    }
  };

  const fetchMessages = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}/messages`);
    const data = await res.json();
    setTaskMessages(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !showMessageModal) return;
    try {
      const res = await fetch(`/api/tasks/${showMessageModal.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, content: newMessage }),
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(showMessageModal.id);
      }
    } catch (err) { console.error(err); }
  };

  if (loading || !currentUser) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: '#6366f1' }}>ニューラル・マーケット同期中...</div>;

  const filteredTasks = tasks.filter((t: any) => {
    if (view === 'my-issued') return t.requesterId === currentUser.id;
    if (view === 'my-bids') return t.bids?.some((b: any) => b.bidderId === currentUser.id);
    return t.requesterId !== currentUser.id;
  });

  const rankColor = getRankColor(currentUser.rank);

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', color: 'white', minHeight: '100vh', '--primary': rankColor } as any}>
      <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon} style={{ background: rankColor, boxShadow: `0 0 20px ${rankColor}30` }}><Zap size={14} color="white" /></div>
            <span className={styles.logoText}>Ignitera <span style={{ color: rankColor }}>OS</span></span>
         </Link>
         
         <nav className={styles.navMenu}>
             <Link href="/" className={styles.navItem}><LayoutDashboard size={18} /> <span>概要</span></Link>
             <Link href="/marketplace" className={clsx(styles.navItem, styles.navItemActive)}><Briefcase size={18} /> <span>マーケット</span></Link>
             <Link href="/kpi" className={styles.navItem}><BarChart3 size={18} /> <span>アナリティクス</span></Link>
             <Link href="/profile" className={styles.navItem}><User size={18} /> <span>プロフィール DNA</span></Link>
             <Link href="/settings" className={styles.navItem}><Settings size={18} /> <span>設定</span></Link>
             <Link href="/algorithm" className={styles.navItem} style={{ marginTop: '10px', opacity: 0.8 }}>
                <Calculator size={18} color={rankColor} /> <span style={{ fontSize: '0.85rem' }}>アルゴリズム解説</span>
             </Link>
         </nav>

         <div style={{ flex: 1 }} />
         
         <div style={{ padding: '20px', margin: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px', letterSpacing: '1px' }}>デモ・オペレーター切替</div>
            <select 
              value={currentUser.id} 
              onChange={(e) => handleUserChange(e.target.value)}
              style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: '900', marginBottom: '15px' }}
            >
              {users.map(u => <option key={u.id} value={u.id} style={{ background: '#0a0a0f' }}>{u.anonymousName} (ランク-{u.rank})</option>)}
            </select>
            <button 
                onClick={async () => {
                    if (confirm('システム時間（月）を進めますか？発行残高のリセット等が行われます。')) {
                        const res = await fetch('/api/simulate/next-month', { method: 'POST' });
                        if (res.ok) { fetchData(); alert('翌月のシミュレーションが完了しました。'); }
                    }
                }}
                style={{ width: '100%', padding: '10px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '8px', color: '#6366f1', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>
                <History size={12} style={{ marginRight: '6px' }} /> 月を進める (Simulation)
             </button>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-2px' }}>ミッション・<span style={{ color: rankColor }}>{view === 'browse' ? '探索' : view === 'my-issued' ? '管理' : 'ステータス'}</span></h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: '1rem', marginTop: '4px' }}>
              {view === 'browse' ? '分散型プロトコルから最適なミッションをスキャンし入札してください。' : '自らが発行したミッションの進捗と報酬支払いを管理します。'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ padding: '10px 18px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>FLOATING (₲)</div>
                  <div style={{ fontWeight: '900', color: rankColor }}>{currentUser.balanceFlow}</div>
               </div>
               <div style={{ padding: '10px 18px' }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>SETTLED (Stock)</div>
                  <div style={{ fontWeight: '900', color: '#10b981' }}>{currentUser.balanceStock?.toFixed(1)}</div>
               </div>
            </div>
            <button className="neon-button" style={{ background: rankColor }} onClick={() => setShowModal(true)}>
              <Plus size={18} /> <span>ミッションを新規発行</span>
            </button>
          </div>
        </header>

        <nav style={{ display: 'flex', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px' }}>
           <TabItem active={view === 'browse'} onClick={() => setView('browse')} text="案件をさがす" color={rankColor} />
           <TabItem active={view === 'my-issued'} onClick={() => setView('my-issued')} text="発行した案件" color={rankColor} />
           <TabItem active={view === 'my-bids'} onClick={() => setView('my-bids')} text="入札中の案件" color={rankColor} />
        </nav>

        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '32px' }}>
            {filteredTasks.map((task) => (
              <motion.div layout key={task.id} className="glass-card" style={{ padding: '32px', borderTop: `4px solid ${task.status === 'OPEN' ? rankColor : '#6366f1'}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div className={styles.badge} style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', borderRadius: '8px' }}>{task.position}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '950', color: rankColor, fontSize: '1.6rem', lineHeight: 1 }}>{task.baseReward} ₲</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>BASE_VALUE</div>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.5px' }}>{task.title}</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '28px' }}>{task.description}</p>
                
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <MetricItem icon={<Clock size={14} />} label="推定納期" value={`${task.expectedHours} ${task.expectedUnit || 'h'}`} />
                        <MetricItem icon={<Layers size={14} />} label="アウトプット数" value={task.outputs || 1} />
                        <MetricItem icon={<Cpu size={14} />} label="分岐難易度" value={task.branches || 0} />
                        <MetricItem icon={<Brain size={14} />} label="必要スキル習熟" value={`S-${task.requiredSkill || '1.0'}`} />
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '1px' }}>REQUIRED_SKILLSETS</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {(() => {
                              try {
                                const tags = typeof task.tags === 'string' ? JSON.parse(task.tags) : (task.tags || []);
                                const finalTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
                                return finalTags.map((tag: string) => (
                                  <span key={tag} style={{ padding: '4px 10px', background: `${rankColor}15`, color: rankColor, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', border: `1px solid ${rankColor}30` }}>{tag}</span>
                                ));
                              } catch(e) { 
                                return <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>スキル設定なし</span>; 
                              }
                            })()}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `linear-gradient(135deg, ${rankColor}, #000)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {task.requester?.anonymousName?.[0] || 'C'}
                      </div>
                      <span style={{ fontWeight: 'bold' }}>{task.requester?.anonymousName}</span>
                    </div>
                    {task.bids?.length > 0 && (
                      <div style={{ fontSize: '0.8rem', fontWeight: '900', color: rankColor }}>
                         {task.bids.length} 件の入札
                      </div>
                    )}
                  </div>

                  {task.status !== 'COMPLETED' && task.bids?.length > 0 && (
                    <div style={{ marginTop: '15px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>AUCTION_LANDSCAPE</div>
                          <div style={{ fontSize: '1rem', fontWeight: '900', marginTop: '2px' }}>
                             BEST_BID: <span style={{ color: rankColor }}>₲{Math.min(...task.bids.map((b: any) => b.amount))}</span>
                          </div>
                       </div>
                       <ChevronRight size={20} color="rgba(255,255,255,0.1)" />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                     {(task.requesterId === currentUser?.id || task.assigneeId === currentUser?.id) && (
                        <button className={styles.quickActionBtn} style={{ flex: 1 }} onClick={() => { setShowMessageModal(task); fetchMessages(task.id); }}>
                          <MessageSquare size={16} /> <span>スレッド</span>
                        </button>
                     )}
                     
                     {view === 'browse' && task.requesterId !== currentUser?.id && (
                        task.bids?.some((b: any) => b.bidderId === currentUser?.id) ? (
                            <div style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                               <CheckCircle2 size={16} style={{ marginRight: '8px' }} /> 入札を確定済み
                            </div>
                        ) : (
                            <button className="neon-button" style={{ flex: 1.5, background: rankColor }} onClick={() => setShowBidModal(task)}>
                               <Zap size={16} /> <span>この案件に入札する</span>
                            </button>
                        )
                     )}

                     {view === 'my-issued' && task.status === 'IN_PROGRESS' && (
                        <button className="neon-button" style={{ flex: 1, background: '#10b981' }} onClick={() => setShowReviewModal(task)}>
                           <CheckCircle2 size={16} /> <span>完了を承認</span>
                        </button>
                     )}
                  </div>

                  {view === 'my-issued' && task.status === 'BIDDING' && task.bids?.length > 0 && (
                     <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {task.bids.map((bid: any) => {
                           const bColor = getRankColor(bid.bidder.rank);
                           return (
                             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={bid.id} className="glass-card" style={{ padding: '24px', borderLeft: `4px solid ${bColor}`, background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${bColor}20`, border: `1px solid ${bColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: bColor, fontSize: '1.1rem' }}>{bid.bidder.rank}</div>
                                      <div>
                                         <div style={{ fontWeight: '900', fontSize: '1rem' }}>{bid.bidder.anonymousName}</div>
                                         <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', display: 'flex', gap: '10px', marginTop: '2px' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>先月スコア: {bid.bidder.lastMonthScore?.toFixed(1)} S</span>
                                            <span>M-Score: {bid.bidder.monthlyScore?.toFixed(0)}</span>
                                            <span>Skill: {bid.bidder.skillLevel?.toFixed(1)}</span>
                                         </div>
                                      </div>
                                   </div>
                                   <div style={{ textAlign: 'right' }}>
                                      <div style={{ fontWeight: '950', fontSize: '1.2rem', color: bColor }}>₲{bid.amount}</div>
                                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>PROPOSED_UNIT</div>
                                   </div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px', marginBottom: '4px' }}>{bid.message || 'ミッション実行プロトコル未記述'}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                                   <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginBottom: '6px' }}>HOLDER_SKILLSETS</div>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                         {(() => {
                                           try {
                                             const bSkills = JSON.parse(bid.bidder.skills || '[]');
                                             return bSkills.slice(0, 3).map((s: any) => (
                                               <span key={s.name} style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'rgba(255,255,255,0.5)' }}>{s.name}</span>
                                             ));
                                           } catch(e) { return null; }
                                         })()}
                                      </div>
                                   </div>
                                   <button onClick={() => handleAcceptBid(task.id, bid.id)} style={{ background: bColor, color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold' }}>採用する</button>
                                 </div>
                              </motion.div>
                           );
                        })}
                     </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showModal && <div className="modal-overlay"><CreateModal onClose={() => setShowModal(false)} onSubmit={handleCreateTask} newTask={newTask} setNewTask={setNewTask} masterSkills={masterSkills} color={rankColor} refreshSkills={fetchData} /></div>}
        {showBidModal && <div className="modal-overlay"><BidModal task={showBidModal} onClose={() => setShowBidModal(null)} onSubmit={handlePlaceBid} newBid={newBid} setNewBid={setNewBid} color={rankColor} /></div>}
        {showReviewModal && <div className="modal-overlay"><ReviewModal task={showReviewModal} onClose={() => setShowReviewModal(null)} onSubmit={handleCompleteTask} qualityScore={qualityScore} setQualityScore={setQualityScore} actualHours={actualHours} setActualHours={setActualHours} color={rankColor} /></div>}
        {showMessageModal && <div className="modal-overlay"><MessageModal task={showMessageModal} messages={taskMessages} currentUser={currentUser} onClose={() => setShowMessageModal(null)} onSend={handleSendMessage} newMessage={newMessage} setNewMessage={setNewMessage} color={rankColor} /></div>}
      </AnimatePresence>

      <style jsx>{`
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(20px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
}

function TabItem({ active, onClick, text, color }: any) {
    return (
        <button onClick={onClick} style={{ height: '50px', background: 'none', border: 'none', color: active ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: '900', cursor: 'pointer', position: 'relative', transition: '0.3s' }}>
            {text}
            {active && <motion.div layoutId="market-tab" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '3px', background: color, boxShadow: `0 0 10px ${color}` }} />}
        </button>
    );
}

function MetricItem({ icon, label, value }: any) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>{icon}</div>
            <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{value}</div>
            </div>
        </div>
    );
}

function CreateModal({ onClose, onSubmit, newTask, setNewTask, masterSkills, color, refreshSkills }: any) {
  const [newTagInput, setNewTagInput] = useState('');
  const toggleSkill = (name: string) => {
    const next = newTask.tags.includes(name) ? newTask.tags.filter((t: string) => t !== name) : [...newTask.tags, name];
    setNewTask({...newTask, tags: next});
  };
  const handleAddNewTag = async () => {
    if (!newTagInput.trim()) return;
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagInput.trim(), category: 'GENERAL' })
      });
      if (res.ok) {
        setNewTask({...newTask, tags: [...newTask.tags, newTagInput.trim()]});
        setNewTagInput('');
        refreshSkills();
      }
    } catch(e) { console.error(e); }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '48px', border: `1px solid ${color}30` }}>
      <h2 style={{ fontSize: '2.2rem', fontWeight: '950', marginBottom: '32px', letterSpacing: '-1.5px' }}>ミッションを<span style={{ color }}>発行する</span></h2>
      <form onSubmit={onSubmit}>
        <FormField label="任務タイトル (プロトコル名)" value={newTask.title} onChange={(v:any) => setNewTask({...newTask, title: v})} />
        <FormField label="詳細プロトコル (要件定義)" value={newTask.description} onChange={(v:any) => setNewTask({...newTask, description: v})} type="textarea" />
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
            <div style={{ flex: 1 }}><FormField label="基準報酬 (₲)" value={newTask.baseReward} onChange={(v:any) => setNewTask({...newTask, baseReward: v})} type="number" /></div>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', fontWeight: '900' }}>推定納期</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" value={newTask.expectedValue} onChange={(e) => setNewTask({...newTask, expectedValue: e.target.value})} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '14px', borderRadius: '10px' }} />
                    <select value={newTask.expectedUnit} onChange={(e) => setNewTask({...newTask, expectedUnit: e.target.value})} style={{ width: '100px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '14px', borderRadius: '10px' }}>
                        <option value="h">時間</option><option value="d">日間</option><option value="w">週間</option>
                    </select>
                </div>
            </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '28px', borderRadius: '20px', border: `1px solid ${color}20`, marginBottom: '32px' }}>
          <h4 style={{ fontSize: '0.8rem', color, marginBottom: '20px', fontWeight: '900' }}>複雑性マトリクス (D-FACTOR)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <FormField label="アウトプット数" value={newTask.outputs} onChange={(v:any) => setNewTask({...newTask, outputs: v})} type="number" />
            <FormField label="分岐難易度" value={newTask.branches} onChange={(v:any) => setNewTask({...newTask, branches: v})} type="number" />
            <FormField label="要求スキル習熟" value={newTask.requiredSkill} onChange={(v:any) => setNewTask({...newTask, requiredSkill: v})} type="number" />
            <FormField label="必要最少スキル数" value={newTask.skillCount} onChange={(v:any) => setNewTask({...newTask, skillCount: v})} type="number" />
          </div>
        </div>
        <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', fontWeight: '900' }}>必要スキル</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} placeholder="新しいスキルを追加..." style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 15px', color: 'white' }} />
                <button type="button" onClick={handleAddNewTag} style={{ padding: '0 15px', background: `${color}20`, border: `1px solid ${color}30`, color, borderRadius: '10px' }}><PlusCircle size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                {masterSkills.map((s: any) => (<button key={s.id} type="button" onClick={() => toggleSkill(s.name)} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid', borderColor: newTask.tags.includes(s.name) ? color : 'rgba(255,255,255,0.1)', background: newTask.tags.includes(s.name) ? `${color}20` : 'transparent', color: newTask.tags.includes(s.name) ? 'white' : 'rgba(255,255,255,0.4)' }}>{s.name}</button>))}
            </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '14px' }}>破棄</button>
          <button type="submit" className="neon-button" style={{ flex: 2, background: color, justifyContent: 'center', height: '54px' }}><Rocket size={18} /> <span>プロトコルを放送する</span></button>
        </div>
      </form>
    </motion.div>
  );
}

function BidModal({ task, onClose, onSubmit, newBid, setNewBid, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '500px', padding: '48px', border: `1px solid ${color}30` }}>
      <h3 style={{ fontSize: '1.8rem', fontWeight: '950', marginBottom: '8px' }}>ミッションへの入札</h3>
      <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>基準報酬額: <span style={{ color, fontWeight: 'bold' }}>₲{task.baseReward}</span></p>
      <form onSubmit={onSubmit}>
        <FormField label="提示単価 (₲)" value={newBid.amount} onChange={(v:any) => setNewBid({...newBid, amount: v})} type="number" />
        <FormField label="提案事項" value={newBid.message} onChange={(v:any) => setNewBid({...newBid, message: v})} type="textarea" />
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '14px' }}>キャンセル</button>
          <button type="submit" className="neon-button" style={{ flex: 2, background: color, justifyContent: 'center' }}><Send size={18} /> <span>入札プロトコルを送信</span></button>
        </div>
      </form>
    </motion.div>
  );
}

function ReviewModal({ task, onClose, onSubmit, qualityScore, setQualityScore, actualHours, setActualHours, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '480px', padding: '48px', border: `1px solid ${color}30` }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '950', marginBottom: '12px' }}>最終品質レビュー</h3>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>担当者: {task.assignee?.anonymousName}</p>
      
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <label style={{ fontSize: '0.85rem', color: 'white', fontWeight: '900' }}>クオリティ係数 (Q)</label>
            <span style={{ color, fontWeight: 'bold' }}>x{qualityScore}</span>
          </div>
          <input type="range" min="0.1" max="1.5" step="0.1" value={qualityScore} onChange={(e) => setQualityScore(e.target.value)} style={{ width: '100%', accentColor: color }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
             <span>要求未達</span><span>標準スコア</span><span>期待過達</span>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
           <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: '900', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>
              <Timer size={14} /> <span>実働時間 (Eb係数に影響)</span>
           </label>
           <input 
             type="number" step="0.1" 
             value={actualHours} onChange={(e) => setActualHours(e.target.value)} 
             placeholder={`推定 ${task.expectedHours}h に対して...`}
             style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', color: 'white', outline: 'none' }} 
           />
           <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>未入力の場合は、採用から現在までの時間が自動計算されます。</p>
        </div>

        <button type="submit" className="neon-button" style={{ width: '100%', background: '#10b981', justifyContent: 'center', height: '54px' }}>
           <CheckCircle2 size={18} /> <span>承認して報酬をアンロック</span>
        </button>
      </form>
    </motion.div>
  );
}

function MessageModal({ task, messages, currentUser, onClose, onSend, newMessage, setNewMessage, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '650px', height: '85vh', padding: '48px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
         <h3 style={{ fontSize: '1.4rem', fontWeight: '950' }}>セキュア・スレッド</h3>
         <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)' }}><X /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
         {messages.map((m:any) => (
           <div key={m.id} style={{ alignSelf: m.userId === currentUser.id ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{ padding: '16px 20px', background: m.userId === currentUser.id ? color : 'rgba(255,255,255,0.05)', borderRadius: '18px', color: 'white' }}>{m.content}</div>
           </div>
         ))}
      </div>
      <form onSubmit={onSend} style={{ display: 'flex', gap: '12px' }}>
         <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="メッセージを送信..." style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '16px', padding: '18px', color: 'white' }} />
         <button type="submit" className="neon-button" style={{ width: '60px', height: '60px', background: color, justifyContent: 'center' }}><Send size={22} /></button>
      </form>
    </motion.div>
  );
}

function FormField({ label, value, onChange, type = 'text', placeholder = '' }: any) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', color: 'white', minHeight: '100px' }} />
      ) : (
        <input type={type} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', color: 'white' }} />
      )}
    </div>
  );
}

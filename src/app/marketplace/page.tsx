"use client"

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Briefcase, Filter, ArrowLeft, Target, ShieldCheck, Zap, X, Send, History, Award, LayoutDashboard, User, BarChart3, Settings, Calculator, MessageSquare, Clock, MapPin, CheckCircle2, TrendingUp, AlertCircle
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
  
  const [newTask, setNewTask] = useState({
    title: '', description: '', baseReward: '100', expectedValue: '2', expectedUnit: 'h', 
    outputs: 1, branches: 0, skillCount: 1, externalCount: 0, requiredSkill: '1.0',
    position: 'GENERAL', tags: [] as string[]
  });
  
  const [newBid, setNewBid] = useState({ amount: '', message: '' });
  const [qualityScore, setQualityScore] = useState('1.0');
  const [taskMessages, setTaskMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [skillCategories, setSkillCategories] = useState<any>({});

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
      
      const savedId = localStorage.getItem('demo-user-id');
      const user = savedId ? uData.find((u: any) => u.id === savedId) : uData[0];
      setCurrentUser(user || uData[0]);
      
      const cats: any = {};
      sData.forEach((s: any) => {
        if (!cats[s.category]) cats[s.category] = [];
        cats[s.category].push(s.name);
      });
      setSkillCategories(cats);
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
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, requesterId: currentUser.id }),
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
        body: JSON.stringify({ qualityScore: parseFloat(qualityScore) }),
      });
      if (res.ok) {
        setShowReviewModal(null);
        fetchData();
      }
    } catch (err) { console.error(err); }
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

  if (loading || !currentUser) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: '#6366f1' }}>Mapping Neural Market...</div>;

  const filteredTasks = tasks.filter(t => {
    if (view === 'my-issued') return t.requesterId === currentUser.id;
    if (view === 'my-bids') return t.bids?.some((b: any) => b.bidderId === currentUser.id);
    return t.requesterId !== currentUser.id;
  });

  const rankColor = getRankColor(currentUser.rank);

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', color: 'white', minHeight: '100vh', '--primary': rankColor } as any}>
      <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon} style={{ background: rankColor }}><Zap size={14} color="white" /></div>
            <span className={styles.logoText}>Ignitera <span style={{ color: rankColor }}>OS</span></span>
         </Link>
         
         <nav className={styles.navMenu}>
             <Link href="/" className={styles.navItem}><LayoutDashboard size={18} /> <span>Overview</span></Link>
             <Link href="/marketplace" className={clsx(styles.navItem, styles.navItemActive)}><Briefcase size={18} /> <span>Marketplace</span></Link>
             <Link href="/kpi" className={styles.navItem}><BarChart3 size={18} /> <span>Analytics</span></Link>
             <Link href="/profile" className={styles.navItem}><User size={18} /> <span>Profile DNA</span></Link>
             <Link href="/settings" className={styles.navItem}><Settings size={18} /> <span>Settings</span></Link>
             <Link href="/algorithm" className={styles.navItem} style={{ marginTop: '10px', opacity: 0.8 }}>
                <Calculator size={18} color={rankColor} /> <span style={{ fontSize: '0.85rem' }}>Evaluation Docs</span>
             </Link>
         </nav>

         <div style={{ flex: 1 }} />
         
         <div style={{ padding: '20px', margin: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px', letterSpacing: '1px' }}>DEMO_OPERATOR</div>
            <select 
              value={currentUser.id} 
              onChange={(e) => handleUserChange(e.target.value)}
              style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.85rem' }}
            >
              {users.map(u => <option key={u.id} value={u.id} style={{ background: '#111' }}>{u.anonymousName} (RANK-{u.rank})</option>)}
            </select>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '950', letterSpacing: '-1.5px' }}>Market <span style={{ color: rankColor }}>{view === 'browse' ? 'Discovery' : view === 'my-issued' ? 'Control' : 'Participation'}</span></h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>
              {view === 'browse' ? 'Scan and bid on neural tasks using your expertise.' : 'Direct decentralized missions and manage rewards.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className={styles.balancePill}>
              <span className={styles.flowPill}>Flow: {currentUser.balanceFlow} ₲</span>
              <span className={styles.stockPill}>Stock: {currentUser.balanceStock?.toFixed(1)} ₲</span>
            </div>
            {view === 'my-issued' && (
              <button className="neon-button" style={{ background: rankColor }} onClick={() => setShowModal(true)}>
                <Plus size={18} /> <span>Issue Task</span>
              </button>
            )}
          </div>
        </header>

        <nav className={styles.tabNav} style={{ marginBottom: '30px' }}>
           <button onClick={() => setView('browse')} className={clsx(styles.tabItem, view === 'browse' && styles.tabItemActive)} style={{ borderColor: view === 'browse' ? rankColor : 'transparent', color: view === 'browse' ? rankColor : 'rgba(255,255,255,0.4)' }}>Market Browse</button>
           <button onClick={() => setView('my-issued')} className={clsx(styles.tabItem, view === 'my-issued' && styles.tabItemActive)} style={{ borderColor: view === 'my-issued' ? rankColor : 'transparent', color: view === 'my-issued' ? rankColor : 'rgba(255,255,255,0.4)' }}>Issued Missions</button>
           <button onClick={() => setView('my-bids')} className={clsx(styles.tabItem, view === 'my-bids' && styles.tabItemActive)} style={{ borderColor: view === 'my-bids' ? rankColor : 'transparent', color: view === 'my-bids' ? rankColor : 'rgba(255,255,255,0.4)' }}>Active Bids</button>
        </nav>

        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '28px' }}>
            {filteredTasks.map((task) => (
              <motion.div layout key={task.id} className="glass-card" style={{ padding: '28px', borderLeft: `4px solid ${task.status === 'OPEN' ? rankColor : '#6366f1'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div className={styles.badge} style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>{task.position}</div>
                  <span style={{ color: rankColor, fontWeight: '900', fontSize: '1.4rem' }}>{task.finalReward || task.baseReward} ₲</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', fontWeight: '900' }}>{task.title}</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '24px' }}>{task.description}</p>
                
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {task.requester?.anonymousName?.[0] || 'C'}
                      </div>
                      <span style={{ opacity: 0.6 }}>{task.requester?.anonymousName || 'Client'}</span>
                    </div>
                    {task.bids?.length > 0 && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: rankColor }}>
                         {task.bids.length} Active Bids
                      </div>
                    )}
                  </div>

                  {/* Auction Landscape Visibility */}
                  {task.status !== 'COMPLETED' && task.bids?.length > 0 && (
                    <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                       <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Current Auction Landscape</div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                            Best Offer: <span style={{ color: rankColor }}>₲{Math.min(...task.bids.map((b: any) => b.amount))}</span>
                          </div>
                          <div style={{ fontSize: '0.7rem' }}>Avg: ₲{Math.round(task.bids.reduce((a:any,b:any)=>a+b.amount,0)/task.bids.length)}</div>
                       </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                     {(task.requesterId === currentUser?.id || task.assigneeId === currentUser?.id) && (
                        <button 
                          className={styles.quickActionBtn}
                          style={{ flex: 1, height: '45px' }}
                          onClick={() => { setShowMessageModal(task); fetchMessages(task.id); }}
                        >
                          <MessageSquare size={16} /> <span>Thread</span>
                        </button>
                     )}
                     
                     {view === 'browse' && task.requesterId !== currentUser?.id && (
                        task.bids?.some((b: any) => b.bidderId === currentUser?.id) ? (
                            <div style={{ flex: 1, height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                               <CheckCircle2 size={16} style={{ marginRight: '6px' }} /> Bid Active
                            </div>
                        ) : (
                            <button className="neon-button" style={{ flex: 1, height: '45px', background: rankColor }} onClick={() => setShowBidModal(task)}>Place Bid</button>
                        )
                     )}

                     {view === 'my-issued' && task.status === 'BIDDING' && (
                        <button className="neon-button" style={{ flex: 1, height: '45px', background: rankColor }} onClick={() => setView('my-issued')}>Review Bids</button>
                     )}

                     {view === 'my-issued' && task.status === 'IN_PROGRESS' && (
                        <button className="neon-button" style={{ flex: 1, height: '45px', background: '#10b981' }} onClick={() => setShowReviewModal(task)}>Final Review</button>
                     )}
                  </div>

                  {/* Bid Detail Expansion (Issued View) */}
                  {view === 'my-issued' && task.status === 'BIDDING' && (
                     <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {task.bids?.map((bid: any) => (
                               <div key={bid.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                                  <div>
                                     <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{bid.bidder.anonymousName} • ₲{bid.amount}</div>
                                     <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{bid.message}</div>
                                  </div>
                                  <button onClick={() => handleAcceptBid(task.id, bid.id)} style={{ background: rankColor, color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }}>Accept</button>
                               </div>
                            ))}
                         </div>
                     </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showModal && <div className="modal-overlay"><CreateModal onClose={() => setShowModal(false)} onSubmit={handleCreateTask} newTask={newTask} setNewTask={setNewTask} skillCategories={skillCategories} color={rankColor} /></div>}
        {showBidModal && <div className="modal-overlay"><BidModal task={showBidModal} onClose={() => setShowBidModal(null)} onSubmit={handlePlaceBid} newBid={newBid} setNewBid={setNewBid} color={rankColor} /></div>}
        {showReviewModal && <div className="modal-overlay"><ReviewModal task={showReviewModal} onClose={() => setShowReviewModal(null)} onSubmit={handleCompleteTask} qualityScore={qualityScore} setQualityScore={setQualityScore} color={rankColor} /></div>}
        {showMessageModal && <div className="modal-overlay"><MessageModal task={showMessageModal} messages={taskMessages} currentUser={currentUser} onClose={() => setShowMessageModal(null)} onSend={handleSendMessage} newMessage={newMessage} setNewMessage={setNewMessage} color={rankColor} /></div>}
      </AnimatePresence>

      <style jsx>{`
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
}

function CreateModal({ onClose, onSubmit, newTask, setNewTask, skillCategories, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ width: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '40px', border: `1px solid ${color}30` }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '24px', letterSpacing: '-1px' }}>Issue <span style={{ color: color }}>Mission</span></h2>
      <form onSubmit={onSubmit}>
        <FormField label="Mission Objective" value={newTask.title} onChange={(v:any) => setNewTask({...newTask, title: v})} placeholder="Definitive goal..." />
        <FormField label="Internal Protocol Details" value={newTask.description} onChange={(v:any) => setNewTask({...newTask, description: v})} type="textarea" placeholder="Describe the mission parameters..." />
        <FormField label="Standard Reward (₲)" value={newTask.baseReward} onChange={(v:any) => setNewTask({...newTask, baseReward: v})} type="number" />
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>S-Temporal Duration</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" value={newTask.expectedValue} onChange={(e) => setNewTask({...newTask, expectedValue: e.target.value})} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none' }} />
            <select value={newTask.expectedUnit} onChange={(e) => setNewTask({...newTask, expectedUnit: e.target.value})} style={{ width: '120px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
              <option value="h">Hours</option><option value="d">Days</option><option value="w">Weeks</option>
            </select>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: `1px solid ${color}20`, marginBottom: '25px' }}>
          <h4 style={{ fontSize: '0.7rem', color: color, marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold' }}>Complexity Matrix (D-Factor)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <FormField label="Outputs (n_o)" value={newTask.outputs} onChange={(v:any) => setNewTask({...newTask, outputs: v})} type="number" />
            <FormField label="Branches (n_b)" value={newTask.branches} onChange={(v:any) => setNewTask({...newTask, branches: v})} type="number" />
            <FormField label="Skill Required (EMA)" value={newTask.requiredSkill} onChange={(v:any) => setNewTask({...newTask, requiredSkill: v})} type="number" />
            <FormField label="Min Skill Count" value={newTask.skillCount} onChange={(v:any) => setNewTask({...newTask, skillCount: v})} type="number" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" className="neon-button" style={{ flex: 2, background: color }}>Initialize Payout</button>
        </div>
      </form>
    </motion.div>
  );
}

function BidModal({ task, onClose, onSubmit, newBid, setNewBid, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '480px', padding: '40px', border: `1px solid ${color}40` }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '8px' }}>Strategic Bid</h3>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginBottom: '30px' }}>Mission Reward baseline: <span style={{ color }}>{task.baseReward} ₲</span></p>
      
      {/* Competitor visibility in Modal */}
      {task.bids?.length > 0 && (
         <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>MARKET LANDSCAPE</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
               <span>Current Best Offer</span>
               <span style={{ color: color, fontWeight: 'bold' }}>₲{Math.min(...task.bids.map((b:any)=>b.amount))}</span>
            </div>
         </div>
      )}

      <form onSubmit={onSubmit}>
        <FormField label="Neural Quote (₲)" value={newBid.amount} onChange={(v:any) => setNewBid({...newBid, amount: v})} type="number" placeholder="Enter your strategic value..." />
        <FormField label="Execution Proposition" value={newBid.message} onChange={(v:any) => setNewBid({...newBid, message: v})} type="textarea" placeholder="How do you plan to optimize this?" />
        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" className="neon-button" style={{ flex: 2, background: color }}>Confirm Bid</button>
        </div>
      </form>
    </motion.div>
  );
}

function ReviewModal({ task, onClose, onSubmit, qualityScore, setQualityScore, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '480px', padding: '40px' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '8px' }}>Final Evaluation</h3>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginBottom: '30px' }}>Assignee: {task.assignee?.anonymousName}</p>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '30px' }}>
          <label style={{ fontSize: '0.8rem', color: color, display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Quality Coefficient (Q): {qualityScore}</label>
          <input type="range" min="0.1" max="1.5" step="0.1" value={qualityScore} onChange={(e) => setQualityScore(e.target.value)} style={{ width: '100%', accentColor: color }} />
        </div>
        <button type="submit" className="neon-button" style={{ width: '100%', background: '#10b981' }}>Complete & Payout</button>
      </form>
    </motion.div>
  );
}

function MessageModal({ task, messages, currentUser, onClose, onSend, newMessage, setNewMessage, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '650px', height: '85vh', padding: '40px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
         <h3 style={{ fontSize: '1.4rem', fontWeight: '900' }}>Neural <span style={{ color }}>Thread</span></h3>
         <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
         {messages.map((m:any) => (
           <div key={m.id} style={{ alignSelf: m.userId === currentUser.id ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
              <div style={{ padding: '15px 20px', background: m.userId === currentUser.id ? color : 'rgba(255,255,255,0.05)', borderRadius: '15px', color: m.userId === currentUser.id ? 'white' : 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>{m.content}</div>
           </div>
         ))}
      </div>
      <form onSubmit={onSend} style={{ display: 'flex', gap: '10px' }}>
         <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Enter secure message..." style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: 'white', outline: 'none' }} />
         <button type="submit" className="neon-button" style={{ width: '50px', background: color }}><Send size={20} /></button>
      </form>
    </motion.div>
  );
}

function FormField({ label, value, onChange, type = 'text', options = [], placeholder = '' }: any) {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', color: 'white', outline: 'none', minHeight: '100px' }} />
      ) : type === 'select' ? (
        <select value={value} onChange={(e)=>onChange(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', color: 'white', outline: 'none' }}>
           {options.map((opt:any) => <option key={opt.value} value={opt.value} style={{ background: '#111' }}>{opt.label}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', color: 'white', outline: 'none' }} />
      )}
    </div>
  );
}

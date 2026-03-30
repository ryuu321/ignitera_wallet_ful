"use client"

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Plus,
  ArrowLeft,
  X,
  Loader2,
  MessageSquare,
  Send,
  History as HistoryIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';
import { Calculator } from 'lucide-react';

export default function MarketplacePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('browse'); // 'browse', 'my-issued', 'my-bids'
  
  const [showModal, setShowModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState<any>(null); // task object
  const [showReviewModal, setShowReviewModal] = useState<any>(null); // task object
  const [showMessageModal, setShowMessageModal] = useState<any>(null); // task object
  
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    baseReward: '200', 
    position: 'GENERAL', 
    tags: [] as string[], 
    expectedValue: '1',
    expectedUnit: 'h',
    requiredSkill: '1.0',
    outputs: '1',
    branches: '0',
    skillCount: '1',
    externalCount: '0'
  });
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [newBid, setNewBid] = useState({ amount: '', message: '' });
  const [qualityScore, setQualityScore] = useState('0.9');
  
  const [taskMessages, setTaskMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [masterSkills, setMasterSkills] = useState<any[]>([]);
  const [skillCategories, setSkillCategories] = useState<any>({});

  const fetchData = async () => {
    try {
      const [tRes, uRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/users')
      ]);
      const tData = await tRes.json();
      const uData = await uRes.json();
      const savedUserId = localStorage.getItem('demo-user-id');
      let targetUser = uData[0];
      if (savedUserId) {
        const found = uData.find((u: any) => u.id === savedUserId);
        if (found) targetUser = found;
      }
      // Fetch Master Skills
      const sRes = await fetch('/api/skills');
      const sData = await sRes.json();
      setMasterSkills(sData);
      
      const categories: any = {};
      sData.forEach((s: any) => {
        if (!categories[s.category]) categories[s.category] = [];
        categories[s.category].push(s.name);
      });
      setSkillCategories(categories);

      setCurrentUser(targetUser);
      setTasks(tData);
      setUsers(uData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUserChange = (id: string) => {
    const found = users.find(u => u.id === id);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('demo-user-id', id);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newTask, 
          expectedHours: parseFloat(newTask.expectedValue || '0'), 
          requiredSkill: parseFloat(newTask.requiredSkill),
          outputs: parseInt(newTask.outputs),
          branches: parseInt(newTask.branches),
          skillCount: parseInt(newTask.skillCount),
          externalCount: parseInt(newTask.externalCount),
          requesterId: currentUser.id,
          tags: newTask.tags
        }),
      });
      setShowModal(false);
      setNewTask({ 
        title: '', 
        description: '', 
        baseReward: '200', 
        position: 'GENERAL', 
        tags: [], 
        expectedValue: '1',
        expectedUnit: 'h',
        requiredSkill: '1.0',
        outputs: '1',
        branches: '0',
        skillCount: '1',
        externalCount: '0'
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !showBidModal) return;
    try {
      const res = await fetch(`/api/tasks/${showBidModal.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidderId: currentUser.id, ...newBid }),
      });
      if (res.ok) {
        alert('Bid placed successfully! Your proposal has been sent to the requester.');
        setShowBidModal(null);
        setNewBid({ amount: '', message: '' });
        fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to bid: ${err.error}`);
      }
    } catch (err) { alert('Network error during bid submission.'); }
  };

  const fetchMessages = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/messages`);
      const data = await res.json();
      setTaskMessages(data);
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !showMessageModal || !newMessage.trim()) return;
    try {
      await fetch(`/api/tasks/${showMessageModal.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, content: newMessage }),
      });
      setNewMessage('');
      fetchMessages(showMessageModal.id);
    } catch (err) { console.error(err); }
  };

  const handleAcceptBid = async (taskId: string, bidId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/accept-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId }),
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReviewModal) return;
    try {
      await fetch(`/api/tasks/${showReviewModal.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qualityScore }),
      });
      setShowReviewModal(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const filteredTasks = tasks.filter(t => {
    // 1. Role (View) Filter
    if (view === 'my-issued' && t.requesterId !== currentUser?.id) return false;
    if (view === 'my-bids' && !t.bids?.some((b: any) => b.bidderId === currentUser?.id)) return false;
    if (view === 'browse' && t.status !== 'OPEN' && t.status !== 'BIDDING') return false;
    
    // 2. Skill Filter
    if (selectedFilters.length > 0) {
      const taskTags = JSON.parse(t.tags || '[]');
      if (!selectedFilters.some(f => taskTags.includes(f))) return false;
    }
    
    return true;
  });

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: 'var(--primary)' }}>Syncing with Marketplace...</div>;
  }

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050510', color: 'white', gap: '20px' }}>
        <h2>Marketplace Inactive</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Please initialize the system data to start trading.</p>
        <Link href="/settings" className="neon-button" style={{ textDecoration: 'none' }}>Go to Settings</Link>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}><ArrowLeft size={20} color="var(--primary)" /></div>
            <span className={styles.logoText}>Back to Home</span>
         </Link>
         
         <div style={{ marginTop: '30px', padding: '0 10px' }}>
            <h3 style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '15px', paddingLeft: '10px' }}>Navigation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  className={clsx(styles.navItem, view === 'browse' && styles.navItemActive)} 
                  onClick={() => setView('browse')}
                >
                  <Search size={18} /> <span>Browse Market</span>
                </button>
                <button 
                  className={clsx(styles.navItem, view === 'my-issued' && styles.navItemActive)} 
                  onClick={() => setView('my-issued')}
                >
                  <Plus size={18} /> <span>Issued Tasks</span>
                </button>
                <button 
                  className={clsx(styles.navItem, view === 'my-bids' && styles.navItemActive)} 
                  onClick={() => setView('my-bids')}
                >
                  <HistoryIcon size={18} /> <span>My Active Bids</span>
                </button>
                <Link href="/profile" className={styles.navItem}>
                  <User size={18} /> <span>Profile DNA</span>
                </Link>
                <Link href="/algorithm" className={styles.navItem} style={{ marginTop: '5px', opacity: 0.7 }}>
                  <Calculator size={18} color="var(--primary)" /> <span>Evaluation Docs</span>
                </Link>
            </div>

            <div style={{ marginTop: '30px', padding: '0 10px' }}>
              <h3 style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '15px', paddingLeft: '10px' }}>Skill Filter</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '10px' }}>
                {masterSkills.slice(0, 12).map(s => (
                  <button 
                    key={s.id}
                    onClick={() => {
                      setSelectedFilters(prev => prev.includes(s.name) ? prev.filter(f => f !== s.name) : [...prev, s.name]);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      background: selectedFilters.includes(s.name) ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                      color: selectedFilters.includes(s.name) ? 'white' : 'rgba(255,255,255,0.4)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
         </div>

         {currentUser && (
           <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>SWITCH USER (DEMO)</div>
              <select 
                value={currentUser.id} 
                onChange={(e) => handleUserChange(e.target.value)}
                style={{ width: '100%', background: 'none', color: 'white', border: 'none', outline: 'none', fontSize: '0.85rem' }}
              >
                {users.map(u => <option key={u.id} value={u.id} style={{ background: '#111' }}>{u.anonymousName} ({u.role})</option>)}
              </select>
           </div>
         )}
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Market <span className="gradient-text">{view === 'browse' ? 'Discovery' : view === 'my-issued' ? 'Control' : 'Participation'}</span></h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>
              {view === 'browse' ? 'Find and bid on tasks using your unique skill set.' : 'Manage your issued tasks and reward allocations.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className={styles.balancePill}>
              <span className={styles.flowPill}>Flow: {currentUser.balanceFlow} ₲</span>
              <span className={styles.stockPill}>Stock: {currentUser.balanceStock?.toFixed(1)} ₲</span>
            </div>
            {view === 'my-issued' && (
              <button className="neon-button" onClick={() => setShowModal(true)}>
                <Plus size={18} /> <span>Issue Task</span>
              </button>
            )}
          </div>
        </header>

        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {filteredTasks.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.2)' }}>
                No records found in this category.
              </div>
            )}
            
            {filteredTasks.map((task) => (
              <motion.div 
                layout
                key={task.id}
                className="glass-card"
                style={{ padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className={clsx(styles.badge, styles.pulse)} style={{ background: task.status === 'OPEN' ? 'rgba(34, 211, 238, 0.1)' : 'rgba(99, 102, 241, 0.1)', color: task.status === 'OPEN' ? 'var(--accent)' : 'var(--primary)' }}>
                      {task.status}
                    </div>
                    <div className={styles.badge} style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {task.position}
                    </div>
                  </div>
                  <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.2rem' }}>{task.finalReward || task.baseReward} ₲</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{task.title}</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', marginBottom: '20px', flex: 1 }}>{task.description}</p>
                
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                      <User size={14} />
                      <span>{task.requester?.anonymousName || 'Client'}</span>
                    </div>
                    {task.bids?.length > 0 && (
                      <div style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                        {task.bids.length} bids
                      </div>
                    )}
                  </div>

                  {/* Neural Thread Communication */}
                  {(task.requesterId === currentUser?.id || task.assigneeId === currentUser?.id) && (
                    <button 
                      className={styles.navItem}
                      style={{ width: '100%', marginTop: '15px', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', padding: '10px', height: 'auto' }}
                      onClick={() => {
                        setShowMessageModal(task);
                        fetchMessages(task.id);
                      }}
                    >
                      <MessageSquare size={16} /> <span>Open Neural Thread</span>
                    </button>
                  )}

                  {/* Contextual Action Buttons */}
                  {view === 'browse' && task.requesterId !== currentUser?.id && (
                    <>
                      {task.bids?.some((b: any) => b.bidderId === currentUser?.id) ? (
                        <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', textAlign: 'center', fontSize: '0.8rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          Your bid is currently active.
                        </div>
                      ) : (
                        <button 
                          className="neon-button" 
                          style={{ width: '100%', marginTop: '20px' }}
                          onClick={() => setShowBidModal(task)}
                        >
                          Place Bid
                        </button>
                      )}
                    </>
                  )}

                  {view === 'browse' && task.requesterId === currentUser?.id && (
                    <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      You issued this mission.
                    </div>
                  )}

                  {view === 'my-issued' && task.status === 'BIDDING' && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ fontSize: '0.8rem', marginBottom: '10px', color: 'var(--primary)' }}>Active Bids</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {task.bids?.map((bid: any) => (
                          <div key={bid.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{bid.bidder.anonymousName} - {bid.amount} ₲</div>
                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{bid.message}</div>
                            </div>
                            <button className={styles.textBtn} onClick={() => handleAcceptBid(task.id, bid.id)}>Accept</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {view === 'my-issued' && task.status === 'IN_PROGRESS' && (
                    <button 
                      className="neon-button" 
                      style={{ width: '100%', marginTop: '20px', background: 'var(--success)' }}
                      onClick={() => setShowReviewModal(task)}
                    >
                      Review & Complete
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Various Modals (Create, Bid, Review, Messages) */}
      <AnimatePresence>
        {showModal && <div className="modal-overlay"><CreateModal onClose={() => setShowModal(false)} onSubmit={handleCreateTask} newTask={newTask} setNewTask={setNewTask} skillCategories={skillCategories} /></div>}
        {showBidModal && <div className="modal-overlay"><BidModal task={showBidModal} onClose={() => setShowBidModal(null)} onSubmit={handlePlaceBid} newBid={newBid} setNewBid={setNewBid} /></div>}
        {showReviewModal && <div className="modal-overlay"><ReviewModal task={showReviewModal} onClose={() => setShowReviewModal(null)} onSubmit={handleCompleteTask} qualityScore={qualityScore} setQualityScore={setQualityScore} /></div>}
        {showMessageModal && <div className="modal-overlay"><MessageModal task={showMessageModal} messages={taskMessages} currentUser={currentUser} onClose={() => setShowMessageModal(null)} onSend={handleSendMessage} newMessage={newMessage} setNewMessage={setNewMessage} /></div>}
      </AnimatePresence>

      <style jsx>{`
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
}

function CreateModal({ onClose, onSubmit, newTask, setNewTask, skillCategories }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
      <h2 style={{ marginBottom: '24px' }}>New Mission Parameter</h2>
      <form onSubmit={onSubmit}>
        <FormField label="Task Title" value={newTask.title} onChange={(v:any) => setNewTask({...newTask, title: v})} />
        <FormField label="Description" value={newTask.description} onChange={(v:any) => setNewTask({...newTask, description: v})} type="textarea" />
        <FormField label="Base Reward (₲)" value={newTask.baseReward} onChange={(v:any) => setNewTask({...newTask, baseReward: v})} type="number" />
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase' }}>Expected Duration (所要時間)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="number" 
              value={newTask.expectedValue}
              onChange={(e) => setNewTask({...newTask, expectedValue: e.target.value})}
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 14px', borderRadius: '8px', outline: 'none' }}
            />
            <select 
              value={newTask.expectedUnit}
              onChange={(e) => setNewTask({...newTask, expectedUnit: e.target.value})}
              style={{ width: '100px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <option value="h">Hours (時)</option>
              <option value="d">Days (日)</option>
              <option value="w">Weeks (週)</option>
              <option value="m">Months (月)</option>
            </select>
          </div>
        </div>

        <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '15px', textTransform: 'uppercase' }}>Complexity Matrix (D-Factor)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <FormField label="Outputs (n_o)" value={newTask.outputs} onChange={(v:any) => setNewTask({...newTask, outputs: v})} type="number" />
            <FormField label="Branches (n_b)" value={newTask.branches} onChange={(v:any) => setNewTask({...newTask, branches: v})} type="number" />
            <FormField label="Skill Count (n_s)" value={newTask.skillCount} onChange={(v:any) => setNewTask({...newTask, skillCount: v})} type="number" />
            <FormField label="External Dependencies (n_e)" value={newTask.externalCount} onChange={(v:any) => setNewTask({...newTask, externalCount: v})} type="number" />
            <FormField label="Required Skill Level (s_req)" value={newTask.requiredSkill} onChange={(v:any) => setNewTask({...newTask, requiredSkill: v})} type="number" />
          </div>
        </div>

        <FormField 
          label="Mission Position" 
          value={newTask.position} 
          onChange={(v:any) => setNewTask({...newTask, position: v})} 
          type="select" 
          options={[
            { value: 'GENERAL', label: 'General Programmer / Member (x1.0)' },
            { value: 'SPECIALIST', label: 'Specialist / Expert (x1.1)' },
            { value: 'SUB_MANAGER', label: 'Sub-Manager / Lead (x1.15)' },
            { value: 'MANAGER', label: 'Manager / Project Owner (x1.2)' }
          ]} 
        />
        <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '10px' }}>
          {Object.entries(skillCategories || {}).map(([cat, catskills]: any) => (
            <div key={cat} style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', textTransform: 'uppercase' }}>{cat}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {Array.isArray(catskills) && catskills.map((s: string) => {
                  const isSelected = newTask.tags.includes(s);
                  return (
                    <button 
                      key={s} 
                      type="button"
                      onClick={() => {
                        const next = isSelected 
                          ? newTask.tags.filter((v: string) => v !== s)
                          : [...newTask.tags, s];
                        setNewTask({ ...newTask, tags: next });
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '15px',
                        fontSize: '0.7rem',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'none',
                        color: isSelected ? 'white' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer'
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" className="neon-button" style={{ flex: 2 }}>Initialize Emission</button>
        </div>
      </form>
    </motion.div>
  );
}

function BidModal({ task, onClose, onSubmit, newBid, setNewBid }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '450px', padding: '32px' }}>
      <h3 style={{ marginBottom: '10px' }}>Bid for {task.title}</h3>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>Base Reward: {task.baseReward} ₲</p>
      <form onSubmit={onSubmit}>
        <FormField label="Your Quote (₲)" value={newBid.amount} onChange={(v:any) => setNewBid({...newBid, amount: v})} type="number" />
        <FormField label="Message / Proposal" value={newBid.message} onChange={(v:any) => setNewBid({...newBid, message: v})} type="textarea" />
        <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" className="neon-button" style={{ flex: 2 }}>Confirm Bid</button>
        </div>
      </form>
    </motion.div>
  );
}

function ReviewModal({ task, onClose, onSubmit, qualityScore, setQualityScore }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '450px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
      <h3 style={{ marginBottom: '10px' }}>Mission Review</h3>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>Review performance for <b>{task.assignee?.anonymousName}</b></p>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '8px' }}>Quality Rating (Q): {qualityScore}</label>
          <input 
            type="range" min="0.1" max="1.5" step="0.1" 
            value={qualityScore} 
            onChange={(e) => setQualityScore(e.target.value)} 
            style={{ width: '100%', accentColor: 'var(--primary)' }} 
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
            <span>Low Quality</span>
            <span>Exceptional (+50% bonus)</span>
          </div>
        </div>
        <div style={{ padding: '15px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.1)', marginBottom: '30px' }}>
           <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>Algorithm S Integration</div>
           <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '5px' }}>Final payout will be adjusted based on Wu (Skill Uniqueness) and Wd (Network Dispersion).</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" className="neon-button" style={{ flex: 2, background: 'var(--success)' }}>Authorize Payout</button>
        </div>
      </form>
    </motion.div>
  );
}

function MessageModal({ task, messages, currentUser, onClose, onSend, newMessage, setNewMessage }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '600px', height: '80vh', padding: '32px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem' }}>Neural Thread</h3>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Mission: {task.title}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '10px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
             Starting secure synchronization... No logs available yet.
          </div>
        )}
        {messages.map((m: any) => (
          <div key={m.id} style={{ alignSelf: m.userId === currentUser.id ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
             <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textAlign: m.userId === currentUser.id ? 'right' : 'left' }}>
               {m.user?.anonymousName} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
             <div style={{ 
               padding: '12px 16px', 
               background: m.userId === currentUser.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
               borderRadius: '12px',
               color: m.userId === currentUser.id ? 'white' : 'rgba(255,255,255,0.9)',
               fontSize: '0.9rem',
               boxShadow: m.userId === currentUser.id ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
             }}>
               {m.content}
             </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSend} style={{ display: 'flex', gap: '10px' }}>
         <input 
           type="text" 
           placeholder="Transmit message to assignee..."
           value={newMessage}
           onChange={(e) => setNewMessage(e.target.value)}
           style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: 'white', outline: 'none' }}
         />
         <button type="submit" className="neon-button" style={{ width: '50px', height: '50px', borderRadius: '12px', padding: 0, display: 'flex', justifyContent: 'center' }}>
            <Send size={20} />
         </button>
      </form>
    </motion.div>
  );
}

function FormField({ label, value, onChange, type = 'text', options = [], placeholder = '' }: any) {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>{label}</label>
      {type === 'textarea' ? (
        <textarea 
          value={value} onChange={(e) => onChange(e.target.value)} 
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none', minHeight: '100px' }} 
        />
      ) : type === 'select' ? (
        <select 
          value={value} onChange={(e) => onChange(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
        >
          {options.map((opt: any) => <option key={opt.value} value={opt.value} style={{ background: '#111' }}>{opt.label}</option>)}
        </select>
      ) : type === 'multi-select' ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
          {options.map((opt: any) => {
            const isSelected = value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const next = isSelected 
                    ? value.filter((v: string) => v !== opt.value)
                    : [...value, opt.value];
                  onChange(next);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '15px',
                  fontSize: '0.75rem',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'none',
                  color: isSelected ? 'white' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer'
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      ) : (
        <input 
          type={type} value={value} onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }} 
        />
      )}
    </div>
  );
}

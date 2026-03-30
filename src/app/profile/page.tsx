"use client"

import React, { useState, useEffect } from 'react';
import { 
  User, 
  ArrowLeft, 
  Award, 
  Zap, 
  History, 
  Brain,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../page.module.css';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedUserId = localStorage.getItem('demo-user-id');
        const uRes = await fetch('/api/users');
        const uData = await uRes.json();
        
        let user = uData[0];
        if (savedUserId) {
          const found = uData.find((u: any) => u.id === savedUserId);
          if (found) user = found;
        }
        
        // Fetch specific history for this user
        const txRes = await fetch('/api/kpi'); // Reusing KPI for now, better to have /api/users/[id]/tx
        const kpiData = await txRes.json();
        const myTx = kpiData.transactions?.filter((tx: any) => tx.toUserId === user?.id) || [];
        
        setCurrentUser(user);
        setHistory(myTx);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading || !currentUser) {
     return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: 'var(--primary)' }}>Syncing Neural Profile...</div>;
  }

  const skills = JSON.parse(currentUser.skills || '[]');

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}><ArrowLeft size={20} color="var(--primary)" /></div>
            <span className={styles.logoText}>Back to Home</span>
         </Link>
         
         <div style={{ marginTop: '30px', padding: '10px' }}>
            <div className={clsx("glass-card", styles.userProfileSummary)} style={{ padding: '20px', border: '1px solid var(--primary)' }}>
               <div className={styles.avatar} style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>{currentUser.anonymousName[0]}</div>
               <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{currentUser.anonymousName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '4px' }}>Level 4 {currentUser.role}</div>
               </div>
            </div>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader}>
          <div>
            <h1>Player <span className="gradient-text">DNA Profile</span></h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>Detailed behavioral analysis and asset distribution for {currentUser.anonymousName}.</p>
          </div>
          <div className={styles.balancePill}>
            <span className={styles.flowPill}>Flow: {currentUser.balanceFlow} ₲</span>
            <span className={styles.stockPill}>Stock: {currentUser.balanceStock?.toFixed(1)} ₲</span>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Core Stats */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Award color="var(--primary)" />
                    <h3 style={{ fontSize: '1.1rem' }}>Accumulated Score (S)</h3>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'white' }}>{currentUser.evaluationScore?.toFixed(1) || '0.0'}</div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Top 12% in Global Ranking</p>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Trust Factor</div>
                    <div style={{ fontWeight: 'bold' }}>0.98</div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Reliability</div>
                    <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>High</div>
                  </div>
                </div>
            </div>

            {/* Hybrid Indicator */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Brain color="var(--accent)" />
                    <h3 style={{ fontSize: '1.1rem' }}>Operational Persona</h3>
                </div>
                <div style={{ position: 'relative', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', marginTop: '40px' }}>
                    <div style={{ position: 'absolute', top: '-25px', left: '0', fontSize: '0.7rem' }}>PLAYER-DRIVEN</div>
                    <div style={{ position: 'absolute', top: '-25px', right: '0', fontSize: '0.7rem' }}>MANAGER-DRIVEN</div>
                    <div style={{ position: 'absolute', left: '60%', top: '-5px', width: '20px', height: '20px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 15px var(--accent)', transform: 'translate(-50%, -2px)' }} />
                </div>
                <p style={{ marginTop: '30px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
                   Current stance reflects a <b>60% Managerial</b> tendency. You are valued for coordinating complex projects while maintaining high technical quality.
                </p>
            </div>

            {/* Skills */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Zap color="var(--secondary)" />
                    <h3 style={{ fontSize: '1.1rem' }}>Identified Skill DNA</h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skills.map((s: any) => {
                      const level = s.level || 'GRAY';
                      const colorMap: any = {
                        GRAY: { bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)', shadow: 'none' },
                        BRONZE: { bg: 'rgba(205, 127, 50, 0.1)', text: '#cd7f32', border: '#cd7f32', shadow: '0 0 10px rgba(205, 127, 50, 0.2)' },
                        SILVER: { bg: 'rgba(192, 192, 192, 0.1)', text: '#c0c0c0', border: '#c0c0c0', shadow: '0 0 10px rgba(192, 192, 192, 0.2)' },
                        GOLD: { bg: 'rgba(255, 215, 0, 0.1)', text: '#ffd700', border: '#ffd700', shadow: '0 0 15px rgba(255, 215, 0, 0.4)' }
                      };
                      const style = colorMap[level];

                      return (
                        <span key={s.name} style={{ 
                          padding: '6px 14px', 
                          background: style.bg, 
                          border: `1px solid ${style.border}`, 
                          color: style.text, 
                          borderRadius: '20px', 
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          boxShadow: style.shadow,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {level === 'GOLD' && '★'} {s.name || s}
                        </span>
                      );
                    })}
                    {skills.length === 0 && <p style={{ color: 'rgba(255,255,255,0.2)' }}>No skills documented.</p>}
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  {!showSkillInput ? (
                    <button 
                      onClick={() => setShowSkillInput(true)}
                      style={{ background: 'none', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      + Add Self-Applied Skill (Gray)
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g. Photoshop, Python"
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontSize: '0.8rem' }}
                      />
                      <button 
                        onClick={async () => {
                          if (!newSkill.trim()) return;
                          const updated = [...skills, { name: newSkill.trim(), level: 'GRAY' }];
                          await fetch(`/api/users/${currentUser.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ skills: JSON.stringify(updated) })
                          });
                          window.location.reload();
                        }}
                        style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
            </div>

            {/* History Table */}
            <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <History color="rgba(255,255,255,0.5)" />
                    <h3 style={{ fontSize: '1.1rem' }}>Personal Mission Ledger</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                        <th style={{ padding: '12px' }}>Timestamp</th>
                        <th style={{ padding: '12px' }}>Task Type</th>
                        <th style={{ padding: '12px' }}>Role (Pc)</th>
                        <th style={{ padding: '12px' }}>Quality (Q)</th>
                        <th style={{ padding: '12px' }}>Score (S)</th>
                        <th style={{ padding: '12px' }}>Net ₲</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem' }}>
                          <td style={{ padding: '12px' }}>{new Date(tx.timestamp).toLocaleDateString()}</td>
                          <td style={{ padding: '12px' }}>Software Engineering</td>
                          <td style={{ padding: '12px' }}>x{tx.pc?.toFixed(1) || '1.0'}</td>
                          <td style={{ padding: '12px' }}>x{tx.q?.toFixed(1) || '1.0'}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{tx.finalScore?.toFixed(1) || '0.0'}</td>
                          <td style={{ padding: '12px', color: 'var(--success)' }}>+{tx.amount} ₲</td>
                        </tr>
                      ))}
                      {history.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.2)' }}>No personal records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}

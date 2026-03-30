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
  LayoutDashboard,
  X,
  Calculator,
  ShieldCheck,
  Trophy
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
  const [masterSkills, setMasterSkills] = useState<any[]>([]);

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
        
        // Fetch specific history for this user (All 11 Factors)
        const txRes = await fetch('/api/kpi'); 
        const kpiData = await txRes.json();
        const myTx = kpiData.transactions?.filter((tx: any) => tx.toUserId === user?.id) || [];
        
        // Fetch Master Skills
        const sRes = await fetch('/api/skills');
        const sData = await sRes.json();
        setMasterSkills(sData);
        
        setCurrentUser(user);
        setHistory(myTx);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading || !currentUser) {
     return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', color: '#6366f1' }}>Syncing Neural Profile...</div>;
  }

  const skills = JSON.parse(currentUser.skills || '[]');

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', color: 'white' }}>
      <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}><ArrowLeft size={20} color="#6366f1" /></div>
            <span className={styles.logoText}>Back to Hub</span>
         </Link>
         
         <div style={{ marginTop: '30px', padding: '10px' }}>
            <div className={clsx("glass-card", styles.userProfileSummary)} style={{ padding: '20px', border: '1px solid #6366f1' }}>
               <div className={styles.avatar} style={{ width: '64px', height: '64px', fontSize: '1.8rem', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>{currentUser.anonymousName[0]}</div>
               <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '900', fontSize: '1.3rem' }}>{currentUser.anonymousName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6366f1', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} />
                    <span>RANK-{currentUser.rank} / LV.{(currentUser.skillLevel || 1.0).toFixed(1)}</span>
                  </div>
               </div>
            </div>

            <Link href="/kpi" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
               <Trophy size={18} color="#fbbf24" />
               <span style={{ fontSize: '0.85rem' }}>Global Analytics</span>
            </Link>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Network <span style={{ color: '#6366f1' }}>DNA Profile</span></h1>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Multi-dimensional performance analysis for {currentUser.anonymousName}.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="glass-card" style={{ padding: '15px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Available Flow</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#22d3ee' }}>{currentUser.balanceFlow.toFixed(0)} ₲</span>
            </div>
            <div className="glass-card" style={{ padding: '15px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #10b981' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Total Stock</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10b981' }}>{currentUser.balanceStock?.toFixed(1)} ₲</span>
            </div>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Core Stats */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Award color="#6366f1" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Algorithm S Reputation</h3>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4.5rem', fontWeight: '900', color: 'white', textShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>{currentUser.evaluationScore?.toFixed(1) || '0.0'}</div>
                    <p style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 'bold' }}>TOP {(100 - (currentUser.evaluationScore % 100)).toFixed(0)}% PERCENTILE</p>
                </div>
                <div style={{ marginTop: '24px', gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '8px' }}>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>Role Impact</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{currentUser.role}</div>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>Growth Rate</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#10b981' }}>+12%</div>
                  </div>
                </div>
            </div>

            {/* Persona Indicator */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Brain color="#a855f7" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Operational Persona</h3>
                </div>
                <div style={{ position: 'relative', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '40px' }}>
                    <div style={{ position: 'absolute', top: '-25px', left: '0', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>MAKER-MODE</div>
                    <div style={{ position: 'absolute', top: '-25px', right: '0', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>STRATEGIST-MODE</div>
                    <div style={{ position: 'absolute', left: '72%', top: '-6px', width: '20px', height: '20px', background: '#a855f7', borderRadius: '50%', boxShadow: '0 0 15px #a855f7' }} />
                </div>
                <p style={{ marginTop: '30px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.7' }}>
                   Profile indicates a <b>High Strategist</b> tendency. System value is driven by architectural oversight (Pc=1.20) and complex problem solving (Df=1.45+).
                </p>
            </div>

            {/* Skills DNAtree */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Zap color="#22d3ee" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Neural Skill Deck</h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {skills.map((s: any) => (
                      <span key={s.name || s} style={{ 
                        padding: '5px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
                        color: 'rgba(255,255,255,0.8)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold'
                      }}>
                        {s.name || s}
                      </span>
                    ))}
                    {skills.length === 0 && <p style={{ color: 'rgba(255,255,255,0.2)' }}>No neural links detected.</p>}
                </div>
            </div>

            {/* History Table - FULL 11 FACTORS */}
            <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <History color="#6366f1" />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Algorithm S Performance Ledger</h3>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Full Audit Sync v2.0</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px' }}>Date</th>
                        <th style={{ padding: '12px' }}>Wu (Rare)</th>
                        <th style={{ padding: '12px' }}>Pc (Role)</th>
                        <th style={{ padding: '12px' }}>Q (Qual)</th>
                        <th style={{ padding: '12px' }}>Aa (Act)</th>
                        <th style={{ padding: '12px' }}>Df (Diff)</th>
                        <th style={{ padding: '12px' }}>Sf (Chal)</th>
                        <th style={{ padding: '12px' }}>Eb (Eff)</th>
                        <th style={{ padding: '12px' }}>Rf (Rank)</th>
                        <th style={{ padding: '12px', color: 'white', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Score S</th>
                        <th style={{ padding: '12px' }}>Reward</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.75rem' }}>
                          <td style={{ padding: '12px', whiteSpace: 'nowrap', opacity: 0.5 }}>{new Date(tx.timestamp).toLocaleDateString()}</td>
                          <td style={{ padding: '12px', color: '#6366f1' }}>x{tx.wu?.toFixed(2)}</td>
                          <td style={{ padding: '12px', opacity: 0.7 }}>x{tx.pc?.toFixed(2)}</td>
                          <td style={{ padding: '12px', color: '#10b981' }}>x{tx.q?.toFixed(1)}</td>
                          <td style={{ padding: '12px', color: '#22d3ee' }}>x{tx.aa?.toFixed(2)}</td>
                          <td style={{ padding: '12px' }}>x{tx.df?.toFixed(2)}</td>
                          <td style={{ padding: '12px', color: '#a855f7' }}>x{tx.sf?.toFixed(2)}</td>
                          <td style={{ padding: '12px' }}>x{tx.eb?.toFixed(2)}</td>
                          <td style={{ padding: '12px', color: '#fbbf24' }}>x{tx.rf?.toFixed(2)}</td>
                          <td style={{ padding: '12px', fontWeight: '900', color: '#6366f1', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                            {tx.finalScore?.toFixed(1)}
                          </td>
                          <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>+{tx.amount}₲</td>
                        </tr>
                      ))}
                      {history.length === 0 && (
                        <tr><td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.2)' }}>No operational footprints found. Execute missions to generate DNA.</td></tr>
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

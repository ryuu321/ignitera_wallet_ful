"use client"

import React from 'react';
import { 
  ArrowLeft, 
  Target, 
  ShieldCheck, 
  Zap, 
  Database, 
  History, 
  ShieldAlert,
  ArrowUpRight,
  Calculator,
  UserCheck,
  Award,
  Activity,
  Cpu,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../page.module.css';
import Link from 'next/link';

export default function AlgorithmDocs() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', color: 'white', minHeight: '100vh' }}>
      <aside className={styles.sidebar}>
         <Link href="/kpi" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}><ArrowLeft size={14} color="#6366f1" /></div>
            <span className={styles.logoText}>Back to Analytics</span>
         </Link>
         
         <div style={{ marginTop: '30px', padding: '10px' }}>
            <div className="glass-card" style={{ padding: '24px', border: '1px solid #6366f1', textAlign: 'center' }}>
                <Calculator size={32} color="#6366f1" style={{ marginBottom: '15px' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '900' }}>Algorithm S</h3>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', lineHeight: '1.5' }}>Behavioral Evaluation Analysis Engine v2.0 Integrated Integrated Spec</p>
            </div>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-1.5px' }}>Unified <span style={{ color: '#6366f1' }}>Evaluation Logic</span></h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: '1.1rem' }}>Technical documentation for the 12-factor behavioral scoring system.</p>
          </div>
        </header>

        <motion.section 
          variants={container}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '28px' }}
        >
            {/* The Integrated Formula */}
            <motion.div variants={item} className="glass-card" style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(0,0,0,0))' }}>
                <h2 style={{ fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '3px', fontWeight: 'bold' }}>The Ultimate Equation</h2>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', letterSpacing: '2px', marginBottom: '12px', wordBreak: 'break-all', lineHeight: '1.4' }}>
                  S = C × Wu × Wd × Pc × Q × Ac × Aa × Df × Sf × Eb × Rr
                </div>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto' }}>
                    Algorithm S v2.0 represents a multi-dimensional synthesis of capital, network hygiene, effort alignment, and competitive standing.
                </p>
            </motion.div>

            {/* Factor Groups */}
            <motion.div variants={item} className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Star size={20} color="#ffd700" /> Graded Mastery (Sf)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ borderLeft: '2px solid #ffd700', paddingLeft: '20px' }}>
                         <div style={{ fontWeight: '900', fontSize: '1rem', color: 'white' }}>Skill Grades</div>
                         <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>Mastery levels: **Basic < Bronze < Silver < Gold.** Higher grades increase your effective baseline for the **Sf** factor.</p>
                    </div>
                    <FactorInfo title="Sf (Skill Factor)" desc="Rewards performing tasks above your registered grade-baseline. A 'Silver' performer taking on 'Gold' level logic receives a 1.2x boost." />
                </div>
            </motion.div>

            <motion.div variants={item} className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={20} color="#22d3ee" /> Behavioral Flux
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <FactorInfo title="Aa (Activity)" desc="Measures current cycle output relative to the system-wide peer average." />
                    <FactorInfo title="Df (Difficulty)" desc="Objective payload (n_outputs, n_branches, n_skills) normalization." />
                    <FactorInfo title="Eb (Efficiency)" desc="Time-saving bonus for completion before the requested deadline." />
                </div>
            </motion.div>

            <motion.div variants={item} className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldAlert size={20} color="#f59e0b" /> Integrity & Rank
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <FactorInfo title="Ac (Anti-Collusion)" desc="Real-time mitigation of reciprocity and price anomaly rings." />
                    <FactorInfo title="Rr (Rank Correction)" desc="Promotion bonus: 1 + 0.003 * (13 - r). Boosts standing in top-tiers." />
                    <FactorInfo title="Wd (Dispersion)" desc="Penalizes repeated same-source transactions to prevent network centrality." />
                </div>
            </motion.div>

            {/* Why Algorithm S? */}
            <motion.div variants={item} className="glass-card" style={{ gridColumn: '1 / -1', padding: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                  <ShieldCheck size={48} color="#10b981" style={{ flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '16px' }}>The "Un-Gamable" Ecosystem</h3>
                    <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8' }}>
                      Traditional systems are easily exploited by volume or speed. Algorithm S v2.0 (Integrated Spec) prioritizes **rarity, decentralization, and skill progression.** By penalizing dependency through **Wd** and detecting mutual circles via **Ac**, it ensures that your Rank (A-Z) and Payout are derived from true organizational value, not just repetitive activity.
                    </p>
                  </div>
               </div>
            </motion.div>
        </motion.section>
      </main>
    </div>
  );
}

function FactorInfo({ title, desc }: { title: string, desc: string }) {
    return (
        <div style={{ borderLeft: '2px solid rgba(99, 102, 241, 0.3)', paddingLeft: '20px' }}>
            <div style={{ fontWeight: '900', fontSize: '1rem', color: 'white' }}>{title}</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px', lineHeight: '1.5' }}>{desc}</div>
        </div>
    );
}

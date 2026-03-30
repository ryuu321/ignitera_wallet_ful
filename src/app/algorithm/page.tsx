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
  UserCheck
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
    <div className={styles.dashboardContainer} style={{ background: '#050510' }}>
      <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}><ArrowLeft size={20} color="var(--primary)" /></div>
            <span className={styles.logoText}>Back to Home</span>
         </Link>
         
         <div style={{ marginTop: '30px', padding: '10px' }}>
            <div className="glass-card" style={{ padding: '20px', border: '1px solid var(--primary)', textAlign: 'center' }}>
                <Calculator size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
                <h3 style={{ fontSize: '1rem', color: 'white' }}>Algorithm S</h3>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>Behavioral Evaluation Analysis Engine v2.0</p>
            </div>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader}>
          <div>
            <h1>Neural <span className="gradient-text">Evaluation Engine</span></h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>Detailed technical documentation for the Algorithm S behavioral scoring system.</p>
          </div>
        </header>

        <motion.section 
          variants={container}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}
        >
            {/* The Formula */}
            <motion.div variants={item} className="glass-card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(73, 76, 255, 0.05), rgba(0,0,0,0))' }}>
                <h2 style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '2px' }}>The Core Logic</h2>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', letterSpacing: '4px', marginBottom: '8px' }}>
                  S = (C · Q · Wu · Pc · (1 + Eb)) · Wd · Ac
                </div>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>Layered Evaluation: Reward Factors scaled by Network Hygiene.</p>
            </motion.div>

            {/* Layer 1: Reward Factors */}
            <motion.div variants={item} className="glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                        <ArrowUpRight color="var(--primary)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem' }}>Reward Factors (加点)</h3>
                      <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Performance & Role Contribution</p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '15px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Wu (Uniqueness)</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>1 + 0.5 × (1 - Percentile). Higher rarity in the ecosystem yields higher scores.</div>
                    </div>
                    <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '15px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Pc (Position)</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Manager (x1.2), Specialist (x1.1), Lead (x1.15). Multiplier based on role responsibility.</div>
                    </div>
                    <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '15px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Eb (Efficiency Bonus)</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Speed factor. Up to +20% bonus if actual hours are shorter than expected.</div>
                    </div>
                </div>
            </motion.div>

            {/* Layer 2: Control Factors */}
            <motion.div variants={item} className="glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                        <ShieldCheck color="var(--success)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem' }}>Control Factors (抑止)</h3>
                      <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Network Hygiene & Anti-fraud</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ borderLeft: '2px solid var(--success)', paddingLeft: '15px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Wd (Distribution)</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>1 - 0.3 × Reliance Ratio. Prevents dependency on a single requester for scores.</div>
                    </div>
                    <div style={{ borderLeft: '2px solid var(--success)', paddingLeft: '15px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Ac (Anti-Collusion)</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Fraud Score F. Detects mutual trading and price anomalies. Reductions up to 0.5x.</div>
                    </div>
                    <div style={{ borderLeft: '2px solid var(--success)', paddingLeft: '15px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Q (Quality)</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>0.0 - 1.0 scale. Direct assessment of output quality by the requester.</div>
                    </div>
                </div>
            </motion.div>

            {/* Why Algorithm S? */}
            <motion.div variants={item} className="glass-card" style={{ gridColumn: '1 / -1', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                  <ShieldAlert size={48} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Why "Algorithm S"?</h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8' }}>
                      Traditional evaluation systems are easily "gamed" by volume or speed. Algorithm S was designed to prioritize **rarity, quality, and decentralized health.** By penalizing dependency and detecting collusion, it ensures that your stock balance reflects true ecosystem value, not just repetition. 
                    </p>
                  </div>
               </div>
            </motion.div>
        </motion.section>
      </main>
    </div>
  );
}

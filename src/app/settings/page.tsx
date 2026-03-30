"use client"

import React from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  User, 
  Key, 
  Files, 
  LogOut,
  ChevronRight,
  CircleAlert
} from 'lucide-react';
import styles from '../page.module.css';
import Link from 'next/link';

export default function SettingsPage() {
  const [status, setStatus] = React.useState('');
  
  const handleResetFlow = async () => {
     setStatus('Resetting coins...');
     try {
       const res = await fetch('/api/admin/reset-flow', { method: 'POST' });
       if (res.ok) setStatus('Success: Monthly allocation reset.');
       else setStatus('Error: Failed to reset.');
     } catch (e) { setStatus('Error: Connection failed.'); }
  }

  const handleResetDB = async () => {
    setStatus('Initializing database...');
    try {
      const res = await fetch('/api/init-db');
      if (res.ok) setStatus('Success: Database re-initialized.');
      else setStatus('Error: Failed to initialize.');
    } catch (e) { setStatus('Error: Connection failed.'); }
  }

  const tosText = `
# Ignitera Wallet: Internal Currency Usage Terms

## 1. Purpose
Empower skill recognition and transparent task allocation.

## 2. Roles
- PLAYER: Task fulfillment.
- MANAGER: Task creation and review.

## 3. Algorithm
S = C * Wu * Wd * Pc * Q * Ac
...
  `;

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}>
              <ArrowLeft size={20} color="var(--primary)" />
            </div>
            <span className={styles.logoText}>Back to Home</span>
         </Link>
         
         <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className={styles.navItem}>
                    <User size={18} />
                    <span>Profile</span>
                </button>
                <button className={styles.navItemActive}>
                    <ShieldCheck size={18} />
                    <span>Compliance</span>
                </button>
                <button className={styles.navItem}>
                    <Key size={18} />
                    <span>API Access</span>
                </button>
            </div>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader}>
          <div>
            <h1>Settings & <span className="gradient-text">Compliance</span></h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>Manage your account and review system policies.</p>
          </div>
        </header>

        <section style={{ maxWidth: '900px' }}>
            {status && (
               <div className="glass-card" style={{ padding: '12px 24px', marginBottom: '24px', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                  {status}
               </div>
            )}

            <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Files size={24} color="var(--primary)" />
                    Terms of Service (Copyable)
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    This text should be included in your employment contract or internal policy documents when deploying this system.
                </p>
                <textarea 
                    readOnly 
                    value={tosText.trim()}
                    style={{ 
                        width: '100%', 
                        height: '250px', 
                        background: 'rgba(0, 0, 0, 0.2)', 
                        border: '1px solid var(--card-border)', 
                        borderRadius: '12px', 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        padding: '20px', 
                        fontFamily: 'monospace', 
                        fontSize: '0.85rem',
                        resize: 'none',
                        outline: 'none'
                    }}
                />
            </div>

            <div className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ marginBottom: '24px' }}>Administrative Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <ActionItem 
                        onClick={handleResetFlow}
                        icon={<CircleAlert size={18} color="var(--warning)" />}
                        title="Clear Monthly Flow Coins"
                        description="Usually performed on the 1st of every month."
                    />
                    <ActionItem 
                        onClick={handleResetDB}
                        icon={<LogOut size={18} color="rgba(255,255,255,0.3)" />}
                        title="Reset Database Connection"
                        description="Reconnect and seed basic data."
                    />
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}

function ActionItem({ icon, title, description, onClick }: any) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: '0.2s' }} className="action-hover" onClick={onClick}>
            <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{description}</div>
            </div>
            <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
            <style jsx>{`
                .action-hover:hover { background: rgba(255, 255, 255, 0.05); }
            `}</style>
        </div>
    )
}

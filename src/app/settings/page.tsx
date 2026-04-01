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
  CircleAlert,
  Zap
} from 'lucide-react';
import styles from '../page.module.css';
import Link from 'next/link';

export default function SettingsPage() {
  const [status, setStatus] = React.useState('');
  
  const handleResetFlow = async () => {
     setStatus('コインをリセット中...');
     try {
       const res = await fetch('/api/admin/reset-flow', { method: 'POST' });
       if (res.ok) setStatus('成功: 月次配布予算がリセットされました。');
       else setStatus('エラー: リセットに失敗しました。');
     } catch (e) { setStatus('エラー: 接続に失敗しました。'); }
  }

  const handleResetDB = async () => {
    setStatus('データベースを初期化中...');
    try {
      const res = await fetch('/api/init-db');
      if (res.ok) setStatus('成功: データベースが再初期化されました。');
      else setStatus('エラー: 初期化に失敗しました。');
    } catch (e) { setStatus('エラー: 接続に失敗しました。'); }
  }

  const tosText = `
# Ignitera OS: 社内通貨利用規約

## 1. 目的
スキルの可視化と透明性の高いタスク分配を支援し、組織の成長を促進します。

## 2. 権限
- PLAYER: ミッションの完遂、報酬の獲得。
- MANAGER: ミッションの発行、レビュー、承認。

## 3. アルゴリズム
S = C * Wu * Wd * Pc * Q * Ac * Aa * Df * Sf * Eb * Rr
11次元の行動特性から算出されます。
  `;

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', minHeight: '100vh', color: 'white' }}>
      <aside className={styles.sidebar}>
         <Link href="/" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}>
              <ArrowLeft size={20} color="#6366f1" />
            </div>
            <span className={styles.logoText}>ホームに戻る</span>
         </Link>
         
         <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/profile" className={styles.navItem} style={{ textDecoration: 'none' }}>
                    <User size={18} />
                    <span>プロフィール DNA</span>
                </Link>
                <button className={styles.navItemActive}>
                    <ShieldCheck size={18} />
                    <span>コンプライアンス</span>
                </button>
                <button className={styles.navItem}>
                    <Key size={18} />
                    <span>外部アクセス設定</span>
                </button>
            </div>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '950', letterSpacing: '-1.5px' }}>設定 ＆ <span style={{ color: '#6366f1' }}>コンプライアンス</span></h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>アカウントの管理とシステムポリシーの確認を行います。</p>
          </div>
        </header>

        <section style={{ maxWidth: '900px' }}>
            {status && (
               <div className="glass-card" style={{ padding: '12px 24px', marginBottom: '24px', color: '#6366f1', borderColor: '#6366f1' }}>
                  {status}
               </div>
            )}

            <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <Files size={24} color="#6366f1" />
                    利用規約（ドラフト）
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.6' }}>
                    このテキストは、システム導入時に雇用契約や社内規定に盛り込むべき標準的な規約案です。
                </p>
                <textarea 
                    readOnly 
                    value={tosText.trim()}
                    style={{ 
                        width: '100%', 
                        height: '250px', 
                        background: 'rgba(0, 0, 0, 0.2)', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '12px', 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        padding: '20px', 
                        fontFamily: 'monospace', 
                        fontSize: '0.8rem',
                        resize: 'none',
                        outline: 'none'
                    }}
                />
            </div>

            <div className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '24px' }}>管理者向けアクション</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <ActionItem 
                        onClick={handleResetFlow}
                        icon={<CircleAlert size={18} color="#f59e0b" />}
                        title="発行可能残高 (Flow) を全員リセット"
                        description="通常、毎月1日に実行される月次初期化プロセスです。"
                    />
                    <ActionItem 
                        onClick={handleResetDB}
                        icon={<LogOut size={18} color="rgba(255,255,255,0.3)" />}
                        title="データベースの再接続・初期化"
                        description="デモデータの再投入と接続の初期化を強制実行します。"
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: '0.2s', border: '1px solid rgba(255,255,255,0.03)' }} className="action-hover" onClick={onClick}>
            <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{title}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{description}</div>
            </div>
            <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
            <style jsx>{`
                .action-hover:hover { background: rgba(255, 255, 255, 0.05); }
            `}</style>
        </div>
    )
}

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
  Activity,
  Cpu,
  Star,
  LayoutDashboard,
  Briefcase,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../page.module.css';
import Link from 'next/link';

export default function AlgorithmDocs() {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');

  React.useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    const savedMode = localStorage.getItem('display-mode') as 'desktop' | 'mobile';
    setViewMode(savedMode || (isMobile ? 'mobile' : 'desktop'));
  }, []);

  const toggleViewMode = () => {
    const next = viewMode === 'desktop' ? 'mobile' : 'desktop';
    setViewMode(next);
    localStorage.setItem('display-mode', next);
  };

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

  const rankColor = '#6366f1';

  // Mobile Lite Layout
  if (viewMode === 'mobile') {
    return (
      <div style={{ background: '#05050e', minHeight: '100vh', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ background: `${rankColor}15`, padding: '30px', borderRadius: '40px', border: `1px solid ${rankColor}30`, marginBottom: '30px' }}>
             <Calculator size={60} color={rankColor} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '950', marginBottom: '15px' }}>DOCS_LOCKED</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', maxWidth: '300px', lineHeight: '1.6', marginBottom: '40px' }}>
             Algorithm S v2.0 の統合仕様書はデスクトップ版でのみ閲覧可能です。PCからアクセスしてください。
          </p>
          <button onClick={toggleViewMode} style={{ background: 'none', border: `1px solid ${rankColor}40`, color: rankColor, padding: '12px 24px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '900' }}>
             FORCE_DESKTOP_UI
          </button>

          {/* Bottom Nav */}
          <nav style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', height: '75px', background: 'rgba(20,20,25,0.9)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', display: 'flex', padding: '0 15px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', zIndex: 1000 }}>
             <button onClick={() => location.href='/'} style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <LayoutDashboard size={22} />
                <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>HOME</span>
             </button>
             <button onClick={() => location.href='/marketplace'} style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Briefcase size={22} />
                <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>MARKET</span>
             </button>
             <button onClick={() => alert('支払いQR読取(未実装)')} style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Zap size={22} />
                <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>PAY</span>
             </button>
             <button onClick={() => location.href='/profile'} style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <User size={22} />
                <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>DNA</span>
             </button>
          </nav>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', color: 'white', minHeight: '100vh' }}>
      <aside className={styles.sidebar}>
         <Link href="/kpi" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}><ArrowLeft size={14} color="#6366f1" /></div>
            <span className={styles.logoText}>分析に戻る</span>
         </Link>
         
         <div style={{ marginTop: '30px', padding: '10px' }}>
            <div className="glass-card" style={{ padding: '24px', border: '1px solid #6366f1', textAlign: 'center' }}>
                <Calculator size={32} color="#6366f1" style={{ marginBottom: '15px' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '900' }}>Algorithm S</h3>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', lineHeight: '1.5' }}>行動評価分析エンジン v2.0 統合仕様書</p>
            </div>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-1.5px' }}>統合<span style={{ color: '#6366f1' }}>評価ロジック</span></h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: '1.1rem' }}>11次元の行動スコアリング・システムに関する技術ドキュメント</p>
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
                <h2 style={{ fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '3px', fontWeight: 'bold' }}>究極の数理モデル</h2>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', letterSpacing: '2px', marginBottom: '12px', wordBreak: 'break-all', lineHeight: '1.4' }}>
                  S = C × Wu × Wd × Pc × Q × Ac × Aa × Df × Sf × Eb × Rr
                </div>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto' }}>
                    Algorithm S v2.0 は、資本、ネットワークの透明性、努力の方向性、そして競争優位性を統合した、多次元的な価値算出エンジンです。
                </p>
            </motion.div>

            {/* Factor Groups */}
            <motion.div variants={item} className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Star size={20} color="#ffd700" /> 習熟度評価 (Sf)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ borderLeft: '2px solid #ffd700', paddingLeft: '20px' }}>
                         <div style={{ fontWeight: '900', fontSize: '1rem', color: 'white' }}>スキル・グレード</div>
                         <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>習熟レベル: **Basic &lt; Bronze &lt; Silver &lt; Gold.** 上位グレードへの昇格により、Sf因子の計算基準値が向上します。</p>
                    </div>
                    <FactorInfo title="Sf (Skill Factor)" desc="登録された基準グレードを超える難易度のミッションを完遂することで報酬が増加します。現在のレベルを超えるミッションへの挑戦を推奨します。" />
                </div>
            </motion.div>

            <motion.div variants={item} className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={20} color="#22d3ee" /> 行動流動性
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <FactorInfo title="Aa (Activity / 活動量)" desc="現在のサイクルにおけるアウトプットを、システム全体の平均値と比較して評価します。" />
                    <FactorInfo title="Df (Difficulty / 難易度)" desc="ミッションの成果物、分岐数、必要スキル数から算出される客観的な負荷係数です。" />
                    <FactorInfo title="Eb (Efficiency / 効率性)" desc="デッドラインよりも早く完了させた場合に付与されるボーナス係数です。" />
                </div>
            </motion.div>

            <motion.div variants={item} className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldAlert size={20} color="#f59e0b" /> 健全性とランク
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <FactorInfo title="Ac (Anti-Collusion / 耐癒着性)" desc="特定のユーザー間での相互入札や価格操作を検知し、評価を補正します。" />
                    <FactorInfo title="Rr (Rank Correction / ランク補正)" desc="上位階層における競争を促すための昇格ボーナスです。1 + 0.003 * (13 - r) で算出されます。" />
                    <FactorInfo title="Wd (Dispersion / 分散性)" desc="同一ソースからの繰り返し報酬を抑制し、ネットワークの分散化を促します。" />
                </div>
            </motion.div>

            {/* Why Algorithm S? */}
            <motion.div variants={item} className="glass-card" style={{ gridColumn: '1 / -1', padding: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                  <ShieldCheck size={48} color="#10b981" style={{ flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '16px' }}>「攻略」不可能なエコシステム</h3>
                    <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8' }}>
                      従来のシステムは単純な取引量やスピードでハックされがちでした。Algorithm S v2.0（統合仕様）は、**「希少性、分散性、およびスキル成長」**を最重要視します。Wdによる依存性の抑制やAcによる癒着の検知により、あなたのランクと報酬が「単純作業」ではなく「真の組織価値」に基づいていることを保証します。
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

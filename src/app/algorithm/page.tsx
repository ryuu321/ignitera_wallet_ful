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
  User,
  Rocket,
  Info,
  TrendingUp,
  Coins,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../page.module.css';
import Link from 'next/link';
import { getRankColor } from '@/lib/colors';

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
             Algorithm S 分離型システム v2.5 仕様書はデスクトップ版でのみ閲覧可能です。
          </p>
          <button onClick={toggleViewMode} style={{ background: 'none', border: `1px solid ${rankColor}40`, color: rankColor, padding: '12px 24px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '900' }}>
             FORCE_DESKTOP_UI
          </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer} style={{ background: '#050511', color: 'white', minHeight: '100vh' }}>
      <aside className={styles.sidebar}>
         <Link href="/kpi" className={styles.logoSection} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon} style={{ background: rankColor }}><ArrowLeft size={14} color="white" /></div>
            <span className={styles.logoText}>分析に戻る</span>
         </Link>
         
         <div style={{ marginTop: '30px', padding: '10px' }}>
            <div className="glass-card" style={{ padding: '24px', border: `1px solid ${rankColor}`, textAlign: 'center' }}>
                <Calculator size={32} color={rankColor} style={{ marginBottom: '15px' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '900' }}>Algorithm S</h3>
                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', lineHeight: '1.5' }}>
                   分離型システム (S/C/IGN)<br/>
                   v2.5 統合技術仕様書
                </p>
            </div>
         </div>
      </aside>

      <main className={styles.mainScrollArea}>
        <header className={styles.topHeader} style={{ marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-1.5px' }}>
               評価・経済・投資<span style={{ color: rankColor }}> 分離型システム</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: '1.1rem', marginTop: '8px' }}>
               4ドメインの完全分離による次世代社内ガバナンス・プロトコル
            </p>
          </div>
        </header>

        <motion.section 
          variants={container}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '28px' }}
        >
            {/* Core Domain Principles */}
            <motion.div variants={item} className="glass-card" style={{ gridColumn: '1 / -1', padding: '48px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: rankColor }} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: '950', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <ShieldCheck color={rankColor} /> 相互非干渉の4ドメイン原則
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                   <DomainDesc title="1. 評価 (S)" desc="どれだけ価値を生んだかをスコア化。月次ランクの唯一の入力因子。" color={rankColor} />
                   <DomainDesc title="2. 市場 (C_flow)" desc="タスク報酬。社内オークションと流通のみを司る。" color="#6366f1" />
                   <DomainDesc title="3. 資産 (C_stock)" desc="個人の蓄積資産。評価(S)には一切影響しない。" color="#10b981" />
                   <DomainDesc title="4. 投資 (IGN)" desc="経費用リソース。外部委託やツール購入に使用され、間接的にSへ影響。" color="#fbbf24" />
                </div>
            </motion.div>

            {/* Formula S Section */}
            <motion.div variants={item} className="glass-card" style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ fontSize: '0.8rem', color: rankColor, fontWeight: '900', letterSpacing: '2px', marginBottom: '24px' }}>EVALUATION CORE FORMULA</h3>
                <div style={{ fontSize: '2.4rem', fontWeight: '950', color: 'white', marginBottom: '20px', letterSpacing: '1px' }}>
                  S = V × f(E_c) × R_rank
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', opacity: 0.8 }}>
                   <MathDetail term="V" desc="総価値 (V_base + V_rev)" />
                   <MathDetail term="f(E_c)" desc="投資効率補正 (1.0 + α * log(1+Ec))" />
                   <MathDetail term="R_rank" desc="ランク定数補正 (1.0 + 0.003 * (13-r))" />
                </div>
            </motion.div>

            {/* Complexity Cards */}
            <motion.div variants={item} className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={20} color={rankColor} /> 価値創出 (V_base + V_rev)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginBottom: '20px', lineHeight: 1.6 }}>
                   評価の基底となる価値(V)は、9つの行動因子と、市場報酬の対数によって構成されます。
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   <FactorRow label="V_base" desc="Wu/Wd/Pc/Q/Ac/Aa/Df/Sf/Eb の 9因子乗算積" />
                   <FactorRow label="V_rev" desc="k * log(1 + R) (個人報酬 R の対数評価)" />
                   <FactorRow label="k (Constant)" desc="報酬価値係数 0.1 を適用" />
                </div>
            </motion.div>

            <motion.div variants={item} className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Rocket size={20} color="#fbbf24" /> 投資と効率 (C_eval & Ec)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginBottom: '20px', lineHeight: 1.6 }}>
                   IGN(投資)を使用して外注やツールを導入すると C_eval が増加し、評価倍率に影響します。
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   <FactorRow label="C_eval" desc="w*T + M + O + S (時給2000 + 実費 + 外注 + ツール)" />
                   <FactorRow label="E_c" desc="投資効率 (V / C_eval)。低コスト・高価値を評価。" />
                   <FactorRow label="f(E_c)" desc="補正倍率。1.0 + 0.1 * log(1 + Ec) で算出。" />
                </div>
            </motion.div>

            <motion.div variants={item} className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <TrendingUp size={20} color="#10b981" /> ランク昇格プロトコル
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginBottom: '20px', lineHeight: 1.6 }}>
                   昇格は月間スコア(S_month)のみに依存し、定員制の競争となっています。
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   <FactorRow label="しきい値 (Tr)" desc="Tr = 100 * 1.2^n (n:ランク指数)" />
                   <FactorRow label="降格条件" desc="S_month < 0.7 * Tr (しきい値の70%未満)" />
                   <FactorRow label="定員枠" desc="A:10 / B:20 / C:30 / D:50 名制限" />
                </div>
            </motion.div>

            {/* Interaction Flow */}
            <motion.div variants={item} className="glass-card" style={{ gridColumn: '1 / -1', padding: '40px' }}>
               <h3 style={{ fontSize: '1.3rem', fontWeight: '950', marginBottom: '24px', textAlign: 'center' }}>エコシステム・フィードバック・ループ</h3>
               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <FlowStep icon={<Briefcase/>} text="受注 (C_flow)"/>
                  <FlowArrow/>
                  <FlowStep icon={<Coins/>} text="資産 (C_stock)"/>
                  <FlowArrow/>
                  <FlowStep icon={<Rocket/>} text="投資 (IGN)"/>
                  <FlowArrow/>
                  <FlowStep icon={<Cpu/>} text="外注/ツール活用"/>
                  <FlowArrow/>
                  <FlowStep icon={<Award/>} text="評価 (S)"/>
               </div>
            </motion.div>
        </motion.section>
      </main>
    </div>
  );
}

function DomainDesc({ title, desc, color }: any) {
    return (
        <div>
            <div style={{ fontWeight: '950', color, fontSize: '0.9rem', marginBottom: '10px' }}>{title}</div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>{desc}</p>
        </div>
    );
}

function MathDetail({ term, desc }: any) {
    return (
        <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: '900', fontSize: '1rem', color: 'white' }}>{term}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{desc}</div>
        </div>
    );
}

function FactorRow({ label, desc }: any) {
    return (
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'white', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', whiteSpace: 'nowrap' }}>{label}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{desc}</div>
        </div>
    );
}

function FlowStep({ icon, text }: any) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '120px' }}>
            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', color: '#6366f1' }}>{icon}</div>
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{text}</span>
        </div>
    );
}

function FlowArrow() {
    return <ArrowUpRight size={16} opacity={0.2} style={{ transform: 'rotate(45deg)' }} />;
}

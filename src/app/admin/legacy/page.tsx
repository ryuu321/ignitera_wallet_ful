"use client"

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Briefcase, BarChart3, User, Settings, Search, Bell, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Plus, CheckCircle2, Clock, Zap, Target, History, Award, Crown, Calculator, ChevronRight, Sparkles, Filter, MoreHorizontal, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css'; // Note: Ensure module.css exists or handle appropriately
import { clsx } from 'clsx';
import Link from 'next/link';
import { getRankColor } from '@/lib/colors';
import { RANK_LADDER, getPromotionThreshold } from '@/lib/rank';

export default function LegacyAdminDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, tRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/tasks')
        ]);
        const uData = await uRes.json();
        const tData = await tRes.json();
        
        setUsers(uData);
        setTasks(tData);
        setCurrentUser(uData[0]);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleUserChange = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) setCurrentUser(user);
  };

  if (loading || !currentUser) {
    return <div className="h-screen flex items-center justify-center bg-[#050510] text-[#6366f1] font-bold">LEGACY OS BOOTING...</div>;
  }

  const rankColor = getRankColor(currentUser.rank);

  return (
    <div className="min-h-screen bg-[#05050e] text-white p-8">
      <header className="flex justify-between items-center mb-12">
        <Link href="/admin" className="flex items-center gap-2 text-indigo-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> 管理者コンソールに戻る
        </Link>
        <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-full text-amber-500 text-xs font-bold animate-pulse">
          LEGACY SIMULATION MODE
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-12">
        <section className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex justify-between items-center">
            <div>
                <h1 className="text-4xl font-black italic mb-2">Legacy <span style={{ color: rankColor }}>Prototyping</span></h1>
                <p className="text-gray-500">以前のUIを使用して、ユーザー切り替えやデータの即時反映をテストできます。</p>
            </div>
            <div className="text-right">
                <div className="text-xs text-gray-500 mb-2 font-bold uppercase">Operator Selector</div>
                <select 
                    value={currentUser.id} 
                    onChange={(e) => handleUserChange(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {users.map(u => <option key={u.id} value={u.id} className="bg-[#05050e]">{u.anonymousName} (Rank {u.rank})</option>)}
                </select>
            </div>
        </section>

        {/* 以前の主要カードを一部再現 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <LegacyCard label="TOTAL SCORE" value={currentUser.totalScore?.toFixed(1)} color={rankColor} />
            <LegacyCard label="FLOW BUDGET" value={`₲${currentUser.balanceFlow}`} color="#6366f1" />
            <LegacyCard label="ASSETS STOCK" value={`₲${currentUser.balanceStock?.toFixed(0)}`} color="#10b981" />
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">プロトタイプ・ミッション</h2>
                <button 
                  onClick={async () => {
                    if (confirm('次月へ進みますか？')) {
                        await fetch('/api/simulate/next-month', { method: 'POST' });
                        window.location.reload();
                    }
                  }}
                  className="px-6 py-2 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                  <History size={18} /> 月を進める (Simulate)
                </button>
             </div>
             <div className="space-y-4">
                {tasks.slice(0, 3).map(task => (
                    <div key={task.id} className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5">
                        <span className="font-bold">{task.title}</span>
                        <span className="font-mono text-indigo-400">{task.baseReward} ₲</span>
                    </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
}

function LegacyCard({ label, value, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] hover:scale-[1.02] transition-transform cursor-default" style={{ borderBottom: `4px solid ${color}` }}>
      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{label}</div>
      <div className="text-3xl font-black font-mono tracking-tighter" style={{ color: color }}>{value}</div>
    </div>
  );
}

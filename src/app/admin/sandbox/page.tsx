"use client"

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Briefcase, BarChart3, User, Settings, Search, Bell, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Plus, CheckCircle2, Clock, Zap, Target, History, Award, Crown, Calculator, ChevronRight, Sparkles, Filter, MoreHorizontal, ArrowLeft, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import Link from 'next/link';

// === 初期UIのモックデータとロジックを完全再現 ===

const MOCK_USERS = [
  { id: '1', name: 'Alpha-01', rank: 'S', balance: 12500, flow: 2400, stock: 10100, score: 94.2, tasks: 12, role: 'Lead Architect', avatar: 'A1' },
  { id: '2', name: 'Beta-Vortex', rank: 'A', balance: 8400, flow: 1200, stock: 7200, score: 88.5, tasks: 8, role: 'Neural Eng', avatar: 'BV' },
  { id: '3', name: 'Gamma-Zero', rank: 'B', balance: 3200, flow: 800, stock: 2400, score: 72.1, tasks: 4, role: 'Junior Dev', avatar: 'GZ' },
];

const MOCK_TASKS = [
  { id: 'T1', title: 'Neural Network Optimization', reward: 1200, complexity: 0.85, deadline: '24h', category: 'Backend', status: 'In Progress' },
  { id: 'T2', title: 'Quantum Protocol Debugging', reward: 2500, complexity: 0.95, deadline: '48h', category: 'Security', status: 'Open' },
  { id: 'T3', title: 'Visual Buffer Refactoring', reward: 800, complexity: 0.65, deadline: '12h', category: 'Frontend', status: 'Review' },
];

export default function AdminSandboxPage() {
  // アカウント管理以前の「自由なユーザー切り替え」を再現
  const [currentUser, setCurrentUser] = useState(MOCK_USERS[1]); // Vortexを初期値に
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSimulating, setIsSimulating] = useState(false);

  const handleNextMonth = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // 擬似的な月次処理
      setCurrentUser(prev => ({
        ...prev,
        balance: prev.balance + 1500,
        score: Math.min(100, prev.score + 2.5)
      }));
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050511] text-white font-['Outfit'] overflow-x-hidden">
      {/* Sandbox Header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-amber-500/10 border-b border-amber-500/30 backdrop-blur-md z-[100] flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
           <Link href="/admin" className="text-amber-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <ArrowLeft size={14} /> Back to Real OS
           </Link>
           <div className="h-4 w-px bg-amber-500/20" />
           <span className="text-amber-500 text-xs font-black italic tracking-tighter">SANDBOX PROTOCOL ALPHA-0.1 (Unauthenticated Mode)</span>
        </div>
        
        <div className="flex items-center gap-4">
           <span className="text-[10px] text-amber-500/50 font-bold uppercase">Current Operator:</span>
           <select 
              value={currentUser.id} 
              onChange={(e) => setCurrentUser(MOCK_USERS.find(u => u.id === e.target.value)!)}
              className="bg-black/40 border border-amber-500/30 rounded-lg px-3 py-1 text-[10px] font-bold text-amber-500 outline-none"
           >
              {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
           </select>
           <button 
             onClick={handleNextMonth}
             disabled={isSimulating}
             className="bg-amber-500 text-black px-4 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-amber-400 transition-all disabled:opacity-50"
           >
             {isSimulating ? 'Processing...' : 'Simulate Next Month'}
           </button>
        </div>
      </div>

      <div className="pt-24 px-8 max-w-7xl mx-auto pb-20">
        <header className="flex justify-between items-end mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl font-black italic tracking-tighter mb-2">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">{currentUser.name}</span>
            </h1>
            <p className="text-gray-500 font-medium">Neural Node: {currentUser.role} | System v0.1</p>
          </motion.div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
               <Crown size={20} className="text-amber-500" />
               <span className="text-xl font-bold font-mono tracking-tighter">Rank {currentUser.rank}</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <SandboxStatCard label="Total Balance" value={`₲${currentUser.balance.toLocaleString()}`} icon={<BarChart3 />} color="#6366f1" />
          <SandboxStatCard label="C_Flow" value={`₲${currentUser.flow.toLocaleString()}`} icon={<Activity />} color="#22d3ee" />
          <SandboxStatCard label="C_Stock" value={`₲${currentUser.stock.toLocaleString()}`} icon={<TrendingUp />} color="#10b981" />
          <SandboxStatCard label="S-Score" value={currentUser.score.toFixed(1)} icon={<Sparkles />} color="#a855f7" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white/5 border border-white/10 rounded-[32px] p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold italic flex items-center gap-3">
                  <Zap className="text-indigo-500" /> Active Missions
                </h2>
                <div className="flex gap-2">
                  <button className="bg-white/5 p-2 rounded-xl text-gray-500 hover:text-white transition-colors"><Filter size={18} /></button>
                  <button className="bg-white/5 p-2 rounded-xl text-gray-500 hover:text-white transition-colors"><Plus size={18} /></button>
                </div>
              </div>
              
              <div className="space-y-4">
                {MOCK_TASKS.map(task => (
                  <div key={task.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/[0.08] transition-all cursor-pointer group flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{task.category}</span>
                        <div className="h-1 w-1 rounded-full bg-gray-500" />
                        <span className="text-xs text-gray-500">{task.deadline} left</span>
                      </div>
                      <h3 className="text-xl font-bold mb-1">{task.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                        <span className="flex items-center gap-1"><Target size={12} /> Complexity: {task.complexity}</span>
                        <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {task.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black font-mono text-indigo-500">{task.reward} ₲</div>
                      <ChevronRight className="ml-auto mt-2 text-gray-700 group-hover:text-white transition-colors" size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="bg-white/5 border border-white/10 rounded-[32px] p-8">
              <h2 className="text-xl font-bold mb-6 italic flex items-center gap-3">
                 <ArrowUpRight className="text-green-500" /> Recent Flows
              </h2>
              <div className="space-y-6">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                       <History size={18} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">Transfer Node-0x{i}</div>
                      <div className="text-[10px] text-gray-500 font-mono">2026.04.1{i} / neural_link</div>
                    </div>
                    <div className="text-sm font-black font-mono text-green-400">+450</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-[32px] p-10 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <Calculator size={140} />
               </div>
               <h3 className="text-2xl font-black italic mb-2">Algorithm S</h3>
               <p className="text-sm text-gray-400 leading-relaxed">
                  Neural evaluation in progress. Your uniqueness factor is <span className="text-white font-bold">1.2x</span> currently. Keep contributing to boost node rank.
               </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SandboxStatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-7 rounded-[32px] relative group hover:scale-[1.05] transition-all" style={{ borderBottom: `4px solid ${color}` }}>
      <div className="text-gray-500 mb-4 group-hover:text-white transition-colors">{icon}</div>
      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-black font-mono tracking-tight" style={{ color: color }}>{value}</div>
    </div>
  );
}

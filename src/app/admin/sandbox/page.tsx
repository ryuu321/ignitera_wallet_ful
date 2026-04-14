"use client"

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Briefcase, BarChart3, User, Settings, Search, Bell, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Plus, CheckCircle2, Clock, Zap, Target, History, Award, Crown, Calculator, ChevronRight, Sparkles, Filter, MoreHorizontal, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// === Turn 1 の完全なモックデータ ===
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
  const [currentUser, setCurrentUser] = useState(MOCK_USERS[1]); // Vortex (Admin) 初期選択
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSimulating, setIsSimulating] = useState(false);

  const handleNextMonth = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setCurrentUser(prev => ({
        ...prev,
        balance: prev.balance + 1500,
        score: Math.min(100, prev.score + 1.2)
      }));
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050511] text-white font-['Outfit'] flex overflow-hidden">
      
      {/* --- 左側サイドバー (ここが抜けていました) --- */}
      <aside className="w-64 border-r border-white/10 bg-[#070718] flex flex-col p-6 z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter italic">Ignitera OS</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { name: 'Fleet', icon: <Briefcase size={20} /> },
            { name: 'Marketplace', icon: <BarChart3 size={20} /> },
            { name: 'Analytics', icon: <Activity size={20} /> },
            { name: 'Settings', icon: <Settings size={20} /> },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={clsx(
                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-medium",
                activeTab === item.name ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-gray-500 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
           <Link href="/admin" className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-amber-500 hover:bg-amber-500/10 transition-all font-bold text-xs uppercase tracking-widest">
              <ArrowLeft size={16} /> Exit Sandbox
           </Link>
        </div>
      </aside>

      {/* --- メインコンテンツ領域 --- */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        
        {/* Sandbox Simulation Bar */}
        <div className="sticky top-0 right-0 left-0 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-xl z-10 py-3 px-8 flex justify-between items-center">
            <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Sandbox Protocol Alpha-0.1</div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                   <span className="text-[10px] text-gray-500 uppercase font-bold">Quick Switch:</span>
                   <div className="flex gap-2">
                      {MOCK_USERS.map(u => (
                        <button 
                          key={u.id}
                          onClick={() => setCurrentUser(u)}
                          className={clsx(
                            "w-6 h-6 rounded-full text-[8px] font-bold flex items-center justify-center transition-all",
                            currentUser.id === u.id ? "bg-amber-500 text-black scale-110" : "bg-white/10 text-gray-500 hover:bg-white/20"
                          )}
                        >
                          {u.avatar}
                        </button>
                      ))}
                   </div>
                </div>
                <button 
                   onClick={handleNextMonth}
                   disabled={isSimulating}
                   className="bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black px-4 py-1.5 rounded-lg transition-all shadow-lg shadow-amber-500/20"
                >
                  {isSimulating ? 'SIMULATING...' : 'NEXT MONTH'}
                </button>
            </div>
        </div>

        <div className="p-12 max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-end mb-12">
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-6xl font-black tracking-tighter italic mb-4">
                  Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">{currentUser.name}</span>
                </h1>
                <p className="text-gray-400 font-medium italic flex items-center gap-3">
                  <Crown size={18} className="text-amber-500" /> {currentUser.role} | Node Connectivity: Stable
                </p>
              </motion.div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col items-center min-w-[100px]">
                <span className="text-[10px] font-bold text-gray-500 uppercase mb-1">Rank</span>
                <span className="text-2xl font-black font-mono tracking-tighter">{currentUser.rank}</span>
              </div>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatCard label="Total Balance" value={`₲${currentUser.balance.toLocaleString()}`} icon={<BarChart3 size={20} />} color="#6366f1" />
            <StatCard label="Flow Budget" value={`₲${currentUser.flow.toLocaleString()}`} icon={<Activity size={20} />} color="#22d3ee" />
            <StatCard label="Assets Stock" value={`₲${currentUser.stock.toLocaleString()}`} icon={<TrendingUp size={20} />} color="#10b981" />
            <StatCard label="S-Score" value={currentUser.score.toFixed(1)} icon={<Sparkles size={20} />} color="#a855f7" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Missions List */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white/[0.03] border border-white/5 p-10 rounded-[40px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Target size={120} />
                </div>
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-bold flex items-center gap-3 italic">
                     <Zap className="text-amber-500" /> Active Missions
                  </h2>
                  <button className="bg-white/5 p-3 rounded-2xl hover:bg-white/10 transition-all">
                    <Filter size={18} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {MOCK_TASKS.map(task => (
                    <div key={task.id} className="bg-white/5 border border-white/5 p-8 rounded-3xl hover:bg-white/[0.08] transition-all group flex justify-between items-center border-l-4 border-l-transparent hover:border-l-indigo-500">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                           <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg">{task.category}</span>
                           <span className="text-xs text-gray-500 font-mono">{task.deadline} to fail</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">{task.title}</h3>
                        <div className="flex items-center gap-5 text-xs text-gray-500 font-mono italic">
                           <span className="flex items-center gap-1.5"><History size={14} /> Complexity: {task.complexity}</span>
                           <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> {task.status}</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-3xl font-black font-mono text-indigo-400">{task.reward} <span className="text-sm opacity-40">₲</span></div>
                         <div className="mt-4 flex justify-end">
                            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-indigo-600 transition-all">
                               <ChevronRight size={18} />
                            </div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Side Analytics */}
            <aside className="space-y-8">
               <section className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
                  <h3 className="text-xl font-bold mb-6 italic flex items-center gap-2">
                     <History size={20} className="text-gray-500" /> Node Logs
                  </h3>
                  <div className="space-y-8 relative">
                     <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />
                     {[1,2,3].map(i => (
                       <div key={i} className="flex gap-6 relative">
                          <div className="h-8 w-8 rounded-xl bg-[#0a0a20] border border-white/10 flex items-center justify-center shrink-0 z-10">
                              <ArrowUpRight size={14} className="text-green-500" />
                          </div>
                          <div className="flex-1 pb-2">
                             <div className="text-sm font-bold">Transfer Accepted</div>
                             <div className="text-xs text-gray-500 italic mt-1 font-mono tracking-tighter">OS_Sync_Protocol: Successful</div>
                          </div>
                          <div className="text-sm font-black font-mono text-green-400">+450</div>
                       </div>
                     ))}
                  </div>
               </section>

               <section className="bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 border border-white/5 p-10 rounded-[40px] relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                     <Calculator size={140} />
                  </div>
                  <h3 className="text-2xl font-black italic mb-3">S-Algorithm</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                     Node uniqueness factor: <span className="text-white font-bold">1.2x</span>. Monthly contribution yield is currently projected at <span className="text-indigo-400 font-black">+14.2%</span>.
                  </p>
                  <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                     View Raw Stats
                  </button>
               </section>
            </aside>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] relative group hover:scale-[1.05] transition-all hover:bg-white/[0.08]" style={{ borderBottom: `4px solid ${color}` }}>
      <div className="text-gray-500 mb-6 group-hover:text-white transition-all transform group-hover:-translate-y-1">{icon}</div>
      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{label}</div>
      <div className="text-4xl font-black font-mono tracking-tighter" style={{ color: color }}>{value}</div>
    </div>
  );
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

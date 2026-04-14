"use client"

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Briefcase, BarChart3, User, Settings, Search, Bell, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Plus, CheckCircle2, Clock, Zap, Target, History, Award, Crown, Calculator, ChevronRight, Sparkles, Filter, MoreHorizontal, ArrowLeft, Database, HardDrive, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// === Turn 1 の完全なモックデータ ===
const MOCK_USERS = [
  { id: '1', name: 'Alpha-01', rank: 'S', balance: 12500, flow: 2400, stock: 10100, score: 94.2, tasks: 12, role: 'Lead Architect', avatar: 'A1', status: 'Online' },
  { id: '2', name: 'Beta-Vortex', rank: 'A', balance: 8400, flow: 1200, stock: 7200, score: 88.5, tasks: 8, role: 'Neural Eng', avatar: 'BV', status: 'Online' },
  { id: '3', name: 'Gamma-Zero', rank: 'B', balance: 3200, flow: 800, stock: 2400, score: 72.1, tasks: 4, role: 'Junior Dev', avatar: 'GZ', status: 'Offline' },
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
      
      {/* --- 左側サイドバー --- */}
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
            { name: 'Fleet', icon: <User size={20} /> },
            { name: 'Marketplace', icon: <Briefcase size={20} /> },
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
           <Link href="/admin" className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-amber-500 hover:bg-amber-500/10 transition-all font-bold text-xs uppercase tracking-widest text-center justify-center">
              <ArrowLeft size={16} className="mr-2" /> Exit Sandbox
           </Link>
        </div>
      </aside>

      {/* --- メインコンテンツ領域 --- */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col">
        
        {/* Sandbox Simulation Bar */}
        <div className="sticky top-0 right-0 left-0 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-xl z-30 py-3 px-8 flex justify-between items-center">
            <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Sandbox Protocol : {activeTab.toUpperCase()}</div>
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

        <div className="p-12 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'Dashboard' && <DashboardContent currentUser={currentUser} />}
              {activeTab === 'Fleet' && <FleetContent />}
              {activeTab === 'Marketplace' && <MarketplaceContent />}
              {activeTab === 'Analytics' && <AnalyticsContent />}
              {activeTab === 'Settings' && <SettingsContent />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}

// === タブコンテンツの定義 ===

function DashboardContent({ currentUser }: { currentUser: any }) {
  return (
    <>
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-6xl font-black tracking-tighter italic mb-4">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">{currentUser.name}</span>
          </h1>
          <p className="text-gray-400 font-medium italic flex items-center gap-3">
            <Crown size={18} className="text-amber-500" /> {currentUser.role} | Node Connectivity: Stable
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col items-center min-w-[100px]">
          <span className="text-[10px] font-bold text-gray-500 uppercase mb-1">Rank</span>
          <span className="text-2xl font-black font-mono tracking-tighter">{currentUser.rank}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Balance" value={`₲${currentUser.balance.toLocaleString()}`} icon={<BarChart3 size={20} />} color="#6366f1" />
        <StatCard label="Flow Budget" value={`₲${currentUser.flow.toLocaleString()}`} icon={<Activity size={20} />} color="#22d3ee" />
        <StatCard label="Assets Stock" value={`₲${currentUser.stock.toLocaleString()}`} icon={<TrendingUp size={20} />} color="#10b981" />
        <StatCard label="S-Score" value={currentUser.score.toFixed(1)} icon={<Sparkles size={20} />} color="#a855f7" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white/[0.03] border border-white/5 p-10 rounded-[40px] relative overflow-hidden">
            <h2 className="text-2xl font-bold flex items-center gap-3 italic mb-10"><Zap className="text-amber-500" /> Active Missions</h2>
            <div className="space-y-6">
              {MOCK_TASKS.map(task => (
                <div key={task.id} className="bg-white/5 border border-white/5 p-8 rounded-3xl flex justify-between items-center group">
                  <div>
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg">{task.category}</span>
                    <h3 className="text-2xl font-bold mt-3 mb-2">{task.title}</h3>
                    <div className="text-xs text-gray-500 font-mono italic">Complexity: {task.complexity} | {task.status}</div>
                  </div>
                  <div className="text-3xl font-black font-mono text-indigo-400">{task.reward} ₲</div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
          <h3 className="text-xl font-bold mb-6 italic flex items-center gap-2"><History size={20} className="text-gray-500" /> Node Logs</h3>
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <div className="text-sm font-medium">Neural Transfer x{i}0.2MB Successful</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

function FleetContent() {
  return (
    <div className="space-y-8">
       <h1 className="text-5xl font-black italic tracking-tighter mb-8 italic">Fleet Management</h1>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_USERS.map(u => (
            <div key={u.id} className="bg-white/5 border border-white/10 p-8 rounded-[40px] relative group">
               <div className={`absolute top-6 right-6 h-2 w-2 rounded-full ${u.status === 'Online' ? 'bg-green-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`} />
               <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-black mb-6">{u.avatar}</div>
               <h3 className="text-2xl font-bold mb-1">{u.name}</h3>
               <p className="text-gray-500 text-sm mb-6">{u.role}</p>
               <div className="flex justify-between border-t border-white/5 pt-6">
                  <div>
                     <div className="text-[10px] text-gray-500 font-bold uppercase">Tasks</div>
                     <div className="font-mono font-bold">{u.tasks}</div>
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] text-gray-500 font-bold uppercase">S-Score</div>
                     <div className="font-mono font-bold text-indigo-400">{u.score}%</div>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}

function MarketplaceContent() {
  return (
    <div>
      <h1 className="text-5xl font-black italic tracking-tighter mb-8 italic">Global Marketplace</h1>
      <div className="space-y-4">
        {[...MOCK_TASKS, ...MOCK_TASKS].map((task, i) => (
          <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[32px] flex justify-between items-center group hover:bg-white/[0.08] transition-all">
            <div className="flex gap-8 items-center">
               <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center"><Briefcase className="text-indigo-400" /></div>
               <div>
                 <h3 className="text-xl font-bold">{task.title}</h3>
                 <p className="text-gray-500 text-xs">Expires in {task.deadline} | Rank Requirement: {i % 2 === 0 ? 'B' : 'A'}</p>
               </div>
            </div>
            <div className="text-2xl font-black font-mono text-indigo-500">{task.reward} ₲</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsContent() {
  return (
    <div className="space-y-12">
       <h1 className="text-5xl font-black italic tracking-tighter mb-8 italic">Neural Analytics</h1>
       <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] h-64 flex items-end gap-4 px-12">
          {[40, 70, 45, 90, 65, 80, 55, 95, 30].map((h, i) => (
            <div key={i} className="flex-1 bg-indigo-600/20 rounded-t-xl group relative" style={{ height: `${h}%` }}>
               <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 rounded-full" />
               <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-[10px] px-2 py-1 rounded font-bold transition-opacity">{h}%</div>
            </div>
          ))}
       </div>
       <div className="grid grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
             <div className="text-gray-500 text-xs font-bold uppercase mb-2">Node Efficiency</div>
             <div className="text-3xl font-black font-mono">98.4%</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
             <div className="text-gray-500 text-xs font-bold uppercase mb-2">Network Load</div>
             <div className="text-3xl font-black font-mono">1.2 TB/s</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
             <div className="text-gray-500 text-xs font-bold uppercase mb-2">Uptime</div>
             <div className="text-3xl font-black font-mono">99.99%</div>
          </div>
       </div>
    </div>
  );
}

function SettingsContent() {
  return (
    <div className="max-w-2xl space-y-12">
       <h1 className="text-5xl font-black italic tracking-tighter mb-8 italic">OS Settings</h1>
       <div className="space-y-8">
          <SettingItem label="Neural Link Sensitivity" description="調整すると思考同期の速度が変化します" value={85} />
          <SettingItem label="Encryption Level" description="最高レベル(AES-512)を推奨します" value={100} />
          <SettingItem label="Auto-Simulation Mode" description="月次処理を自律的に実行します" value={0} />
       </div>
       <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all uppercase tracking-[0.2em] text-sm">
          Save Protocol Changes
       </button>
    </div>
  );
}

function SettingItem({ label, description, value }: any) {
  return (
    <div className="space-y-4">
       <div className="flex justify-between items-end">
          <div>
            <div className="font-bold text-lg">{label}</div>
            <div className="text-gray-500 text-xs italic">{description}</div>
          </div>
          <div className="font-mono font-bold text-indigo-400">{value}%</div>
       </div>
       <div className="h-2 bg-white/5 rounded-full relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 bg-indigo-600 rounded-full" style={{ width: `${value}%` }} />
       </div>
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

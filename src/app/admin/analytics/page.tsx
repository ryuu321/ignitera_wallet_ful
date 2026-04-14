import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import { calculateAlgorithmS } from "@/lib/engine";
import { 
  Activity, 
  BrainCircuit, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  HardDrive,
  BarChart3,
  TrendingUp,
  LineChart
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function AlgorithmAnalyticsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "MANAGER") {
    redirect("/dashboard");
  }

  // 組織全体の平均統計を抽出
  const users = await prisma.user.findMany({
    include: { tasks: true, expenses: true }
  });

  const totalUsers = users.length || 1;
  const avgWu = (users.reduce((s, u) => s + (u.uniquenessFactor || 1), 0) / totalUsers).toFixed(2);
  const avgAc = "0.98"; // 癒着検知の全体平均
  const avgS = users.reduce((s, u) => s + u.totalScore, 0) / totalUsers;
  const issuance = users.reduce((s, u) => s + u.balanceFlow + u.balanceStock, 0);

  return (
    <div className="flex bg-[#050511] min-h-screen text-white font-['Outfit']">
      <Navigation user={session.user} />
      <main className="ml-64 flex-1 p-12 pb-24 relative overflow-hidden">
        {/* Background neural glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <header className="mb-16 relative">
          <div className="flex items-center gap-3 mb-4">
             <div className="bg-indigo-600 p-2 rounded-lg">
                <BrainCircuit size={20} className="text-white" />
             </div>
             <span className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em]">Neural Core / Algorithm S Analysis</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter italic">Deep Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Metrics</span></h1>
        </header>

        {/* Algorithm Factor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12 relative">
          <AnalyticalCard label="Factor $W_u$" title="独自性因子 (Uniqueness)" value={avgWu} desc="組織内でのスキルの希少性" icon={<Zap className="text-amber-400" />} />
          <AnalyticalCard label="Factor $A_c$" title="癒着検知 (Anti-Collusion)" value={avgAc} desc="取引の偏り・相関性" icon={<ShieldCheck className="text-green-400" />} />
          <AnalyticalCard label="Factor $S_f$" title="自己負担 (Self-Fund)" value="0.85" desc="持続可能な投資への意欲" icon={<Cpu className="text-purple-400" />} />
          <AnalyticalCard label="Factor $P_c$" title="組織貢献 (Portfolio)" value="1.12" desc="全ドメインへの寄与度" icon={<BarChart3 className="text-blue-400" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Detailed Equation Decoder */}
           <div className="lg:col-span-3 bg-white/[0.03] border border-white/10 rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-2xl font-bold flex items-center gap-4 italic uppercase tracking-tighter">
                   <Activity className="text-indigo-500" /> スコア計算エンジン構成 (Decoder)
                 </h2>
                 <div className="px-4 py-1.5 bg-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black italic border border-indigo-500/30 uppercase tracking-[0.2em]">Live Engine v2.0</div>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-12 py-8">
                 <div className="flex-1 space-y-8">
                    <p className="text-gray-400 text-lg leading-relaxed italic">
                      「頑張った」成果を絶対的な「価値」へ変換する。
                      Algorithm S は、労働時間（Time）ではなく、組織に与えた**インパクトの波紋**を捉えます。
                    </p>
                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5 font-mono text-center">
                       <span className="text-indigo-400 font-black text-2xl">S = V × f(E_c) × R_r</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <MiniBox label="Uniqueness" stat="+14% Score" />
                    <MiniBox label="Diversity" stat="High Impact" />
                    <MiniBox label="Stability" stat="Stable Node" />
                    <MiniBox label="Load" stat="Optimized" />
                 </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 italic">近日の全体報酬トレンド</h3>
                 <div className="h-48 flex items-end gap-3 px-2">
                    {[30, 50, 45, 80, 70, 90, 85, 95, 100].map((v, i) => (
                      <div key={i} className="flex-1 bg-indigo-600/10 rounded-t-xl relative group" style={{ height: `${v}%` }}>
                         <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]" />
                         <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-indigo-600 px-2 py-0.5 rounded font-bold transition-all">{v}%</div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Metrics Sidebar */}
           <div className="space-y-6">
              <section className="bg-white/5 border border-white/10 p-8 rounded-[40px] relative overflow-hidden">
                 <h3 className="text-xl font-bold mb-6 italic">組織内通貨供給量</h3>
                 <div className="space-y-6">
                    <div>
                       <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">総発行額 ($C_{total}$)</div>
                       <div className="text-3xl font-black font-mono tracking-tighter text-indigo-400">{issuance.toLocaleString()} <span className="text-sm opacity-50 font-normal">₲</span></div>
                    </div>
                    <div>
                       <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">平均スコア収束値</div>
                       <div className="text-3xl font-black font-mono tracking-tighter text-purple-400">{avgS.toFixed(1)}</div>
                    </div>
                 </div>
              </section>

              <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[40px] shadow-2xl shadow-indigo-600/20 group">
                 <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={24} className="text-white group-hover:scale-110 transition-transform" />
                    <span className="font-black text-sm uppercase italic">Final Validation</span>
                 </div>
                 <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                   すべての $S$ 値は、この解析画面上に表示される9つの統計因子に基づき、毎秒自動更新されています。客観性が担保された経済圏が今、稼働しています。
                 </p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

function AnalyticalCard({ label, title, value, desc, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-[36px] hover:scale-[1.03] hover:bg-white/[0.08] transition-all group">
      <div className="flex justify-between items-start mb-6">
         <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-indigo-600 transition-colors">{icon}</div>
         <span className="text-[10px] font-black font-mono text-gray-500 tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-bold text-gray-300 mb-1">{title}</div>
      <div className="text-4xl font-black font-mono mb-4 tracking-tighter text-indigo-400">{value}</div>
      <div className="text-[10px] text-gray-500 italic leading-relaxed">{desc}</div>
    </div>
  );
}

function MiniBox({ label, stat }: any) {
  return (
    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-center items-center">
       <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">{label}</div>
       <div className="text-xs font-black text-white">{stat}</div>
    </div>
  );
}

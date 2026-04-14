import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import { 
  Search, 
  Filter, 
  Zap, 
  Clock, 
  Target, 
  ArrowRight,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MarketplacePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // 募集中のタスクを取得
  const tasks = await prisma.task.findMany({
    where: { status: "OPEN" },
    include: { requester: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex bg-[#050505] min-h-screen text-white">
      <Navigation user={session.user} />
      <main className="ml-64 flex-1 p-8 pb-24">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2 italic">マーケットプレイス</h1>
            <p className="text-gray-400 font-medium">あなたのスキルを必要とする未解決のミッション</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="ミッションを検索..." 
                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all w-64"
              />
            </div>
            <button className="bg-white/5 border border-white/10 p-3 rounded-2xl text-gray-400 hover:bg-white/10 transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <div key={task.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/[0.08] transition-all group border-l-4 border-l-indigo-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                         <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/30">
                           {task.position || "GENERAL"}
                         </span>
                         <span className="text-xs text-gray-500 font-mono">ID: {task.id.substring(0,8)}</span>
                      </div>
                      <h2 className="text-2xl font-bold mb-1">{task.title}</h2>
                      <p className="text-gray-400 text-sm line-clamp-2 max-w-xl">{task.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black font-mono text-indigo-400">{task.baseReward} <span className="text-xs opacity-50">₲</span></div>
                      <div className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">潜在報酬額</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-black/20 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                      <Clock className="text-gray-500" size={16} />
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">推定時間</div>
                        <div className="text-sm font-bold">{task.expectedHours}h</div>
                      </div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                      <Target className="text-gray-500" size={16} />
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">難易度係数</div>
                        <div className="text-sm font-bold">x{task.requiredSkill?.toFixed(1) || "1.0"}</div>
                      </div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                      <Zap className="text-gray-500" size={16} />
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">依頼者</div>
                        <div className="text-sm font-bold truncate">{task.requester.anonymousName}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-2xl text-center transition-all flex items-center justify-center gap-2">
                      詳細を確認
                    </button>
                    <button 
                      onClick={() => alert(`ミッション受注リクエスト(未実装)\nID: ${task.id}`)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-center shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
                    >
                      受注に名乗りを上げる <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/5 border border-white/10 border-dashed rounded-3xl p-20 text-center text-gray-500">
                 <Briefcase className="mx-auto mb-4 opacity-20" size={64} />
                 <p className="text-lg font-bold">現在、進行可能なミッションはありません。</p>
                 <p className="text-sm mt-2 opacity-60">新しい案件の公示を待つか、自らミッションを作成してください。</p>
              </div>
            )}
          </div>

          <aside className="space-y-8">
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl">
              <h3 className="font-bold text-lg mb-4 text-indigo-400">受注のヒント</h3>
              <p className="text-sm text-indigo-200/70 leading-relaxed mb-4">
                あなたのランク（{ (session.user as any).role === "MANAGER" ? "管理者" : "プレイヤー" }）に合ったミッションを選ぶことで、評価スコア $S$ の上昇効率が最大化されます。
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs py-2 border-b border-indigo-500/10">
                  <span className="text-gray-400">現在のランク</span>
                  <span className="font-bold text-white">{(session.user as any).rank || "Z"}</span>
                </div>
                <div className="flex justify-between text-xs py-2 border-b border-indigo-500/10">
                  <span className="text-gray-400">平均収益</span>
                  <span className="font-bold text-white">2,500 ₲ / 回</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

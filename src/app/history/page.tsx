import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  TrendingUp,
  CreditCard
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  // 全取引履歴を取得
  const transactions = await prisma.transaction.findMany({
    where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
    orderBy: { timestamp: "desc" },
    include: { fromUser: true, toUser: true }
  });

  return (
    <div className="flex bg-[#050505] min-h-screen text-white">
      <Navigation user={session.user} />
      <main className="ml-64 flex-1 p-12 pb-24">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2 italic">履歴・統計</h1>
            <p className="text-gray-400 font-medium">あなたの全貢献プロトコルと資産の移動記録</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="履歴を検索..." 
                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main List */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h3 className="font-bold flex items-center gap-2">
                  <CreditCard size={18} className="text-indigo-400" />
                  トランザクション・ログ
                </h3>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{transactions.length} RECORDS</span>
              </div>
              
              <div className="divide-y divide-white/5">
                {transactions.length > 0 ? (
                  transactions.map(tx => {
                    const isIncoming = tx.toUserId === userId;
                    return (
                      <div key={tx.id} className="p-6 flex items-center gap-6 hover:bg-white/[0.03] transition-colors group">
                        <div className={`p-4 rounded-2xl ${isIncoming ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {isIncoming ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-lg">
                              {isIncoming ? `${tx.fromUser.anonymousName} さんから受取` : `${tx.toUser.anonymousName} さんへ送金`}
                            </span>
                            <span className="px-2 py-0.5 bg-white/5 text-[10px] text-gray-400 rounded-md font-mono">
                              {tx.type}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString()} / ID: {tx.id.substring(0,12)}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-black font-mono ${isIncoming ? 'text-green-400' : 'text-gray-300'}`}>
                            {isIncoming ? '+' : '-'}{tx.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-20 text-center text-gray-500 italic">取引履歴はありません。</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Statistics Summary */}
          <aside className="space-y-6">
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl">
              <h4 className="font-bold text-sm mb-4 text-indigo-400 flex items-center gap-2">
                <TrendingUp size={16} /> 貢献サマリー
              </h4>
              <div className="space-y-4">
                <StatSimple label="累計報酬獲得額" value={`${transactions.filter(t => t.toUserId === userId).reduce((s,t) => s+t.amount, 0).toLocaleString()} ₲`} />
                <StatSimple label="現在の月次スコア" value="+1,240.5" />
                <StatSimple label="平均報酬単価" value="480.2 ₲" />
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-xs text-gray-500 leading-relaxed italic">
              アルゴリズム S による評価ログを含む、より詳細な統計レポートは月末に生成されます。
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StatSimple({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xl font-black font-mono">{value}</div>
    </div>
  );
}

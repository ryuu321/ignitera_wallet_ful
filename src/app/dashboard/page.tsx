import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  ShieldCheck, 
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const username = (session.user as any).name;

  // Vortex特権: 完全再現された初期Sandbox（サンドボックス）へ自動遷移
  if (username === "Vortex") {
    redirect("/admin/sandbox");
  }

  // DB Fetching (Parallel)
  const [user, recentTransactions, tasks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { expenses: true }
    }),
    prisma.transaction.findMany({
      where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
      take: 5,
      orderBy: { timestamp: "desc" },
      include: { fromUser: true, toUser: true }
    }),
    prisma.task.findMany({
      where: { assigneeId: userId, status: "IN_PROGRESS" },
      take: 3
    })
  ]);

  if (!user) return <div className="p-20 text-center font-bold">ユーザーが見つかりません。再同期してください。</div>;

  return (
    <div className="flex bg-[#050505] min-h-screen text-white">
      <Navigation user={session.user} />
      <main className="ml-64 flex-1 p-8 pb-24">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
            <p className="text-gray-400 mt-1 italic opacity-80 decoration-indigo-500">
              {user.anonymousName} さん、今日も貢献を加速させましょう。
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <ShieldCheck className={user.role === 'MANAGER' ? "text-red-400" : "text-green-400"} size={20} />
            <span className="text-sm font-medium tracking-widest">{user.role} | ランク {user.rank}</span>
          </div>
        </header>

        {/* メイン数値 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BalanceCard title="流動予算 (C_flow)" amount={user.balanceFlow} color="blue" />
          <BalanceCard title="確定資産 (C_stock)" amount={user.balanceStock} color="purple" />
          <BalanceCard title="投資権限 (IGN)" amount={user.balanceIgn} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: 成果とタスク */}
          <div className="lg:col-span-2 space-y-8">
            {/* 貢献統計グラフ */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={22} className="text-green-400" />
                月次貢献パフォーマンス
              </h2>
              <div className="flex items-end gap-6 h-32 px-2">
                <div className="flex-1 bg-white/10 rounded-t-lg h-[40%]"></div>
                <div className="flex-1 bg-white/10 rounded-t-lg h-[60%]"></div>
                <div className="flex-1 bg-white/10 rounded-t-lg h-[30%]"></div>
                <div className="flex-1 bg-white/10 rounded-t-lg h-[80%]"></div>
                <div className="flex-1 bg-white/10 rounded-t-lg h-[55%]"></div>
                <div className="flex-1 bg-green-500/40 rounded-t-lg h-[90%] border-t-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"></div>
              </div>
              <div className="flex justify-between mt-4 text-xs text-gray-500 font-mono italic">
                <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span className="text-green-400">CURRENT</span>
              </div>
            </section>

            {/* 実行中のミッション */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <History size={22} className="text-indigo-400" />
                現在進行中のミッション
              </h2>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map(t => (
                    <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex justify-between items-center transition-all hover:bg-white/[0.07] hover:border-white/20">
                      <div>
                        <h3 className="font-bold text-lg">{t.title}</h3>
                        <p className="text-sm text-gray-400">ステータス: 稼働中 / 納期 残り48時間以内</p>
                      </div>
                      <Link href={`/tasks/${t.id}`} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">
                        進捗管理
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center text-gray-500 italic">
                  現在、割り当てられたミッションはありません。マーケットプレイスで新しい案件を探してください。
                </div>
              )}
            </section>
          </div>

          {/* 右カラム: 履歴とお知らせ */}
          <div className="space-y-8">
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">最近の取引履歴</h2>
              <div className="space-y-6">
                {recentTransactions.map(tx => {
                  const isIncoming = tx.toUserId === userId;
                  return (
                    <div key={tx.id} className="flex gap-4 items-center group">
                      <div className={`p-3 rounded-2xl transition-colors ${isIncoming ? 'bg-green-500/10 text-green-400 group-hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20'}`}>
                        {isIncoming ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold">{isIncoming ? `${tx.fromUser.anonymousName} さんから` : `${tx.toUser.anonymousName} さんへ`}</div>
                        <div className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleDateString()} / OS転送</div>
                      </div>
                      <div className={`font-mono font-bold text-lg ${isIncoming ? 'text-green-400' : 'text-gray-300'}`}>
                        {isIncoming ? '+' : '-'}{tx.amount}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link href="/history" className="block text-center mt-8 text-xs font-bold tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                全履歴データにアクセス
              </Link>
            </section>

            {/* 通知 / システムアラート */}
            <section className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertCircle size={60} />
              </div>
              <h2 className="text-lg font-bold mb-3 text-amber-400 flex items-center gap-2">
                システム通知
              </h2>
              <p className="text-sm text-amber-200/70 leading-relaxed font-medium">
                ランク昇格審査まで残り14日です。現在のスコアリングは順調ですが、追加のミッション納品でボーナス加算が可能です。
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function BalanceCard({ title, amount, color }: { title: string, amount: number, color: string }) {
  const colors = {
    blue: "from-blue-500/15 to-indigo-500/20 text-blue-400 border-blue-500/20",
    purple: "from-purple-500/15 to-violet-500/20 text-purple-400 border-purple-500/20",
    amber: "from-amber-500/15 to-orange-500/20 text-amber-400 border-amber-500/20"
  }[color as 'blue' | 'purple' | 'amber'];

  return (
    <div className={`bg-gradient-to-br ${colors} border p-7 rounded-3xl relative overflow-hidden group transition-all hover:scale-[1.02] hover:border-white/30`}>
      <Wallet className="absolute top-[-20px] right-[-20px] opacity-[0.03] group-hover:scale-125 transition-transform duration-700" size={140} />
      <div className="relative">
        <p className="text-xs font-black tracking-[0.2em] opacity-50 mb-2 uppercase">{title}</p>
        <p className="text-4xl font-black font-mono tracking-tighter shadow-sm">
          {amount.toLocaleString()}
          <span className="text-sm ml-2 font-normal opacity-40">IGN</span>
        </p>
      </div>
    </div>
  );
}

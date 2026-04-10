import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

  if (!user) return <div>ユーザーが見つかりません</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-20">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-gray-400 mt-1">おかえりなさい、{user.anonymousName} さん</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
          <ShieldCheck className={user.role === 'MANAGER' ? "text-red-400" : "text-green-400"} size={20} />
          <span className="text-sm font-medium">{user.role} | ランク {user.rank}</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balances */}
        <BalanceCard title="流動予算 (C_flow)" amount={user.balanceFlow} color="blue" />
        <BalanceCard title="確定資産 (C_stock)" amount={user.balanceStock} color="purple" />
        <BalanceCard title="投資権限 (IGN)" amount={user.balanceIgn} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Monthly Stats Summary */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={22} className="text-green-400" />
              今月の貢献統計
            </h2>
            <div className="flex items-end gap-6 h-32">
              <div className="flex-1 bg-white/10 rounded-t-lg h-[40%]"></div>
              <div className="flex-1 bg-white/10 rounded-t-lg h-[60%]"></div>
              <div className="flex-1 bg-white/10 rounded-t-lg h-[30%]"></div>
              <div className="flex-1 bg-white/10 rounded-t-lg h-[80%]"></div>
              <div className="flex-1 bg-white/10 rounded-t-lg h-[55%]"></div>
              <div className="flex-1 bg-green-500/40 rounded-t-lg h-[90%] border-t-2 border-green-500"></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
              <span>1月</span><span>2月</span><span>3月</span><span>4月</span><span>5月</span><span className="text-green-400">現在</span>
            </div>
          </section>

          {/* Active Tasks */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <History size={22} className="text-indigo-400" />
              進行中のミッション
            </h2>
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map(t => (
                  <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center transition-transform hover:scale-[1.01]">
                    <div>
                      <h3 className="font-medium">{t.title}</h3>
                      <p className="text-sm text-gray-400">納期: 残り2日</p>
                    </div>
                    <Link href={`/tasks/${t.id}`} className="px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm hover:bg-indigo-500 hover:text-white transition-colors">
                      更新する
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-8 text-center text-gray-500">
                進行中のミッションはありません。マーケットプレイスを確認してください。
              </div>
            )}
          </section>
        </div>

        {/* Right Column: History & Notifications */}
        <div className="space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 font-bold">最近の履歴</h2>
            <div className="space-y-6">
              {recentTransactions.map(tx => {
                const isIncoming = tx.toUserId === userId;
                return (
                  <div key={tx.id} className="flex gap-4">
                    <div className={`p-2 rounded-lg ${isIncoming ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {isIncoming ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <div className="font-medium">{isIncoming ? `${tx.fromUser.anonymousName} さんから` : `${tx.toUser.anonymousName} さんへ`}</div>
                      <div className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</div>
                    </div>
                    <div className={`ml-auto font-mono font-bold ${isIncoming ? 'text-green-400' : 'text-gray-300'}`}>
                      {isIncoming ? '+' : '-'}{tx.amount}
                    </div>
                  </div>
                );
              })}
            </div>
            <Link href="/history" className="block text-center mt-6 text-sm text-indigo-400 hover:text-indigo-300">
              すべての履歴を表示
            </Link>
          </section>

          {/* Unapproved Bids or Alerts */}
          <section className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-amber-400 flex items-center gap-2">
              <AlertCircle size={20} />
              お知らせ
            </h2>
            <p className="text-sm text-amber-200/60 leading-relaxed">
              「フロントエンド・メンテナンス」へのあなたの入札は、現在Vanguard-Leadによる承認待ちです。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ title, amount, color }: { title: string, amount: number, color: string }) {
  const colors = {
    blue: "from-blue-500/20 to-indigo-500/30 text-blue-400 border-blue-500/20",
    purple: "from-purple-500/20 to-violet-500/30 text-purple-400 border-purple-500/20",
    amber: "from-amber-500/20 to-orange-500/30 text-amber-400 border-amber-500/20"
  }[color as 'blue' | 'purple' | 'amber'];

  return (
    <div className={`bg-gradient-to-br ${colors} border p-6 rounded-2xl relative overflow-hidden group`}>
      <Wallet className="absolute top-[-10px] right-[-10px] opacity-10 group-hover:scale-110 transition-transform" size={100} />
      <div className="relative">
        <p className="text-sm font-medium tracking-wide opacity-70 mb-1">{title}</p>
        <p className="text-4xl font-bold font-mono tracking-tighter">
          {amount.toLocaleString()}
          <span className="text-xs ml-2 opacity-50">IGN</span>
        </p>
      </div>
    </div>
  );
}

function BalanceCard({ title, amount, color }: { title: string, amount: number, color: string }) {
  const colors = {
    blue: "from-blue-500/20 to-indigo-500/30 text-blue-400 border-blue-500/20",
    purple: "from-purple-500/20 to-violet-500/30 text-purple-400 border-purple-500/20",
    amber: "from-amber-500/20 to-orange-500/30 text-amber-400 border-amber-500/20"
  }[color as 'blue' | 'purple' | 'amber'];

  return (
    <div className={`bg-gradient-to-br ${colors} border p-6 rounded-2xl relative overflow-hidden group`}>
      <Wallet className="absolute top-[-10px] right-[-10px] opacity-10 group-hover:scale-110 transition-transform" size={100} />
      <div className="relative">
        <p className="text-sm font-medium tracking-wide opacity-70 mb-1">{title}</p>
        <p className="text-4xl font-bold font-mono tracking-tighter">
          {amount.toLocaleString()}
          <span className="text-xs ml-2 opacity-50">IGN</span>
        </p>
      </div>
    </div>
  );
}

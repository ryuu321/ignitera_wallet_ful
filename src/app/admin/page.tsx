import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { 
  Users, 
  Activity, 
  ShieldAlert, 
  Briefcase, 
  Search,
  Settings,
  MoreVertical,
  TriangleAlert,
  ShieldCheck
} from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  
  // Stats
  const [users, transactions, totalTasks, kpiLogs] = await Promise.all([
    prisma.user.findMany({ orderBy: { totalScore: 'desc' } }),
    prisma.transaction.findMany({ 
      orderBy: { timestamp: 'desc' }, 
      take: 10,
      include: { fromUser: true, toUser: true }
    }),
    prisma.task.count(),
    prisma.kPILog.findMany({ take: 10, orderBy: { timestamp: 'desc' } })
  ]);

  const totalCflow = users.reduce((sum, u) => sum + u.balanceFlow, 0);
  const totalCstock = users.reduce((sum, u) => sum + u.balanceStock, 0);
  
  // 不正検知のフラグ (Ac <= 0.8)
  const flaggableTransactions = transactions.filter(tx => (tx as any).ac <= 0.8);

  return (
    <div className="min-h-screen bg-[#080808] text-gray-200 p-8">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent italic">
            司令センター (Command Center)
          </h1>
          <p className="text-gray-500 font-mono text-sm mt-2 flex items-center gap-2">
            <Settings size={14} /> システム状態: 安定 / 稼働ノード: アクティブ
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-bold tracking-widest uppercase animate-pulse">
            管理者モード
          </div>
        </div>
      </header>

      {/* KPI サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <StatItem label="アクティブ・エージェント" value={users.length} icon={<Users size={16} />} color="blue" />
        <StatItem label="総流通量 (C_flow)" value={totalCflow.toLocaleString()} icon={<Activity size={16} />} color="emerald" />
        <StatItem label="総蓄積資産 (C_stock)" value={totalCstock.toLocaleString()} icon={<Briefcase size={16} />} color="purple" />
        <StatItem label="稼働中のミッション" value={totalTasks} icon={<Search size={16} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="font-semibold text-lg">エージェント・レジストリ</h2>
            <button className="text-xs text-indigo-400 font-medium">すべて管理</button>
          </div>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-gray-500">
                <th className="px-6 py-4 font-normal">エージェント</th>
                <th className="px-6 py-4 font-normal">役割</th>
                <th className="px-6 py-4 font-normal text-right">信用スコア</th>
                <th className="px-6 py-4 font-normal text-right">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                      {u.anonymousName.substring(0,2)}
                    </div>
                    <span className="font-medium">{u.anonymousName}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono opacity-60">{u.role}</td>
                  <td className="px-6 py-4 text-right font-mono">{(u.balanceFlow + u.balanceStock).toFixed(0)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] border border-green-500/20 uppercase font-bold">有効</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Security / Fraud Log */}
        <div className="space-y-6">
          <div className="bg-red-500/[0.03] border border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-red-500">
              <ShieldAlert size={22} /> 不正・癒着検知ログ
            </h2>
            <div className="space-y-4">
              {flaggableTransactions.length > 0 ? (
                flaggableTransactions.map(tx => (
                  <div key={tx.id} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-4">
                    <TriangleAlert className="text-red-500 shrink-0" size={18} />
                    <div className="text-sm">
                      <p className="text-red-200">
                        <span className="font-bold text-white">異常な取引パターン:</span> 以下のエージェント間で高頻度のリピート取引を検知しました:
                        <br/>
                        <span className="font-bold"> {tx.fromUser.anonymousName}</span> ⇄ <span className="font-bold"> {tx.toUser.anonymousName}</span>
                      </p>
                      <p className="mt-1 text-xs text-red-400 font-mono">係数 Ac: {(tx as any).ac} / スコア減衰ペナルティを適用済み</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-500 text-sm">
                  <ShieldCheck className="mx-auto mb-3 opacity-20" size={40} />
                  現在、癒着パターンの検知はありません。
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold mb-6 flex items-center justify-between">
              <span>システム実行ログ</span>
              <Activity className="text-indigo-400" size={16} />
            </h2>
            <div className="font-mono text-[11px] space-y-2 opacity-70">
              {kpiLogs.map(log => (
                <div key={log.id} className="flex gap-4">
                  <span className="text-gray-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="text-green-400">INFO</span>
                  <span className="truncate">{log.metricName}: {log.value} 実行完了。</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, icon, color }: { label: string, value: any, icon: any, color: string }) {
  const colors = {
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    purple: "text-purple-400",
    amber: "text-amber-400"
  }[color as 'blue' | 'emerald' | 'purple' | 'amber'];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-1">
        {icon} <span>{label}</span>
      </div>
      <div className={`text-2xl font-bold font-mono tracking-tight ${colors}`}>
        {value}
      </div>
    </div>
  );
}

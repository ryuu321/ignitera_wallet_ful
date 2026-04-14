import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import { 
  Clock, 
  Target, 
  Zap, 
  ChevronLeft,
  Briefcase,
  AlertTriangle,
  Send
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: { requester: true }
  });

  if (!task) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center">
        <AlertTriangle size={64} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">ミッションが見つかりません</h1>
        <Link href="/marketplace" className="text-indigo-400 hover:underline">マーケットプレイスに戻る</Link>
      </div>
    );
  }

  return (
    <div className="flex bg-[#050505] min-h-screen text-white">
      <Navigation user={session.user} />
      <main className="ml-64 flex-1 p-12 pb-24">
        <Link href="/marketplace" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          マーケットプレイスに戻る
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-10">
            <header>
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest rounded-full border border-indigo-500/30">
                   {task.position}
                 </span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter mb-6">{task.title}</h1>
              <div className="p-8 bg-white/5 border border-white/10 rounded-3xl leading-relaxed text-gray-300 text-lg">
                {task.description}
              </div>
            </header>

            <section className="grid grid-cols-3 gap-6">
              <DetailCard icon={<Clock className="text-indigo-400" />} label="推定作業時間" value={`${task.expectedHours} 時間`} />
              <DetailCard icon={<Target className="text-emerald-400" />} label="難易度係数" value={`x${task.requiredSkill?.toFixed(1)}`} />
              <DetailCard icon={<Zap className="text-amber-400" />} label="依頼レベル" value="High Priority" />
            </section>
          </div>

          {/* Action Sidebar */}
          <aside className="space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[40px] shadow-2xl shadow-indigo-600/30">
              <div className="text-sm font-bold opacity-60 uppercase tracking-widest mb-2">確定報酬額 (Base)</div>
              <div className="text-5xl font-black font-mono mb-8">{task.baseReward} <span className="text-xl">₲</span></div>
              
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-2xl">
                  <div className="text-[10px] font-bold opacity-60 uppercase mb-1">依頼者</div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold">
                      {task.requester.anonymousName.substring(0,2)}
                    </div>
                    <span className="font-bold text-sm">{task.requester.anonymousName}</span>
                  </div>
                </div>
              </div>

              <form action={async (formData) => {
                'use server';
                // 入札ロジック (簡易化のためアラート相当のリダイレクト)
                // 本来はprisma.bid.createを行う
                redirect(`/marketplace?bid_success=${task.id}`);
              }} className="mt-8">
                <div className="mb-4">
                  <label className="block text-xs font-bold mb-2 opacity-80 decoration-white">メッセージ (任意)</label>
                  <textarea 
                    name="message"
                    placeholder="このミッションを選んだ理由や、自身の強みを伝えてください"
                    className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all h-32 resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <Send size={20} />
                  入札プロトコルを実行
                </button>
              </form>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-sm text-gray-500 leading-relaxed italic">
              入札後、依頼者による承認が行われると、あなたの「進行中のミッション」にリストアップされます。
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function DetailCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
      <div className="mb-4">{icon}</div>
      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xl font-black font-mono">{value}</div>
    </div>
  );
}

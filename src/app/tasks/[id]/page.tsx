import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import { 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ArrowLeft,
  Zap,
  ShieldCheck,
  Send
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TaskProgressPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: { requester: true, assignee: true, messages: { include: { user: true }, orderBy: { createdAt: 'asc' } } }
  });

  if (!task) redirect("/dashboard");

  return (
    <div className="flex bg-[#050505] min-h-screen text-white">
      <Navigation user={session.user} />
      <main className="ml-64 flex-1 p-12 pb-24">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          ダッシュボードに戻る
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content: Info & Collaboration */}
          <div className="lg:col-span-2 space-y-12">
            <header>
              <div className="flex items-center gap-4 mb-4">
                 <span className="px-4 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/30">
                   {task.status}
                 </span>
                 <span className="text-xs text-gray-500 font-mono italic">Node_ID: {task.id.substring(0,8)}</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter mb-4">{task.title}</h1>
              <div className="text-gray-400 leading-relaxed text-lg max-w-3xl">
                {task.description}
              </div>
            </header>

            {/* Chat / Collaboration Section */}
            <section className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden flex flex-col h-[500px]">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <MessageSquare size={18} className="text-indigo-400" />
                  タクティカル・チャット
                </h3>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Encrypted Channel</span>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {task.messages.length > 0 ? (
                  task.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.user.id === (session.user as any).id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.user.id === (session.user as any).id 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white/10 text-gray-200 rounded-tl-none'
                      }`}>
                        <div className="text-[10px] opacity-60 mb-1 font-bold">{msg.user.anonymousName}</div>
                        <div className="text-sm">{msg.content}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 italic text-sm">
                    メッセージのやり取りはありません。
                  </div>
                )}
              </div>

              <div className="p-4 bg-black/40 border-t border-white/10">
                <form action={async (formData) => {
                  'use server';
                   // メッセージ送信ロジック (本来はprisma)
                   redirect(`/tasks/${task.id}?msg_sent=true`);
                }} className="flex gap-4">
                  <input 
                    name="content"
                    placeholder="状況報告、または質問を入力..." 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button type="submit" className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all">
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </section>
          </div>

          {/* Action Sidebar: Status & Completion */}
          <aside className="space-y-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-10">
              <div className="space-y-1">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">現在の期待報酬</div>
                <div className="text-4xl font-black font-mono tracking-tighter">{task.baseReward} <span className="text-sm opacity-40">₲</span></div>
              </div>

              <div className="space-y-6">
                <StatusItem icon={<Clock size={16} />} label="経過時間" value="03:45 / 08:00" />
                <StatusItem icon={<Zap size={16} />} label="推定 S-Score" value="+145.2" />
                <StatusItem icon={<ShieldCheck size={16} />} label="品質保証 (QA)" value="PENDING" />
              </div>

              <div className="pt-6 border-t border-white/10">
                <button 
                  onClick={() => alert(`ミッション完了申請(未実装)\nID: ${task.id}`)}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 active:scale-95"
                >
                  <CheckCircle2 size={22} />
                  任務完了を報告する
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-4 leading-relaxed px-4 italic">
                  完了報告を行うと、依頼者とアルゴリズムによる最終評価が開始されます。
                </p>
              </div>
            </div>

            <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl">
              <h4 className="font-bold text-sm mb-2 text-indigo-400">依頼者情報</h4>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {task.requester.anonymousName.substring(0,2)}
                </div>
                <div className="font-bold text-sm text-indigo-200">{task.requester.anonymousName}</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StatusItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <span className="text-sm font-bold font-mono text-gray-300">{value}</span>
    </div>
  );
}

'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        redirect: false,
      });

      if (result?.error) {
        setError("認証に失敗しました。正しいエージェント名を入力してください。");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("予期せぬエラーが発生しました。");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050505] p-3 border border-white/10 rounded-2xl">
          <ShieldCheck className="text-indigo-500" size={32} />
        </div>
        
        <div className="text-center mb-10 mt-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Ignitera OS</h1>
          <p className="text-gray-400 mt-2 text-sm italic">神経キャリア認証が必要です</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-6 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
              エージェント識別名 (匿名ID)
            </label>
            <input
              type="text"
              required
              placeholder="例: Vortex-Lead-99"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group tracking-widest"
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : "アクセスを承認する"}
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-gray-500 leading-relaxed px-4">
          本システムにアクセスすることで、あなたはIgnitera統治プロトコルおよび2026年神経プライバシー法に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}

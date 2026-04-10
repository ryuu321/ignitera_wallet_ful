'use client';

import { useState } from "react";
import { UserPlus, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError("");

    try {
      // 1. APIに登録リクエスト
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登録に失敗しました。");
        return;
      }

      // 2. 成功したらそのまま自動ログイン
      await signIn("credentials", {
        username,
        callbackUrl: "/dashboard",
      });

    } catch (err) {
      setError("接続エラーが発生しました。");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050505] p-3 border border-white/10 rounded-2xl">
          <UserPlus className="text-emerald-500" size={32} />
        </div>
        
        <div className="text-center mb-10 mt-4">
          <h1 className="text-3xl font-bold text-white tracking-tight font-black italic">新規登録</h1>
          <p className="text-gray-400 mt-2 text-sm italic">新しいエージェント識別子を作成します</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-6 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
              希望の識別名 (3文字以上)
            </label>
            <input
              type="text"
              required
              placeholder="例: Shadow-Walker-01"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group tracking-widest"
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : "エージェントを創設する"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            既存のアカウントでログイン
          </Link>
        </div>
      </div>
    </div>
  );
}

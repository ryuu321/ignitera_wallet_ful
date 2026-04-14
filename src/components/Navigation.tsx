'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  History, 
  Search,
  Zap,
  LogOut,
  User as UserIcon,
  PlusSquare
} from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function Navigation({ user }: { user: any }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'ダッシュボード', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { name: 'マーケットプレイス', icon: <Briefcase size={20} />, href: '/marketplace' },
    { name: '履歴・統計', icon: <History size={20} />, href: '/history' },
  ];

  // 管理者メニュー
  if (user?.role === 'MANAGER') {
    menuItems.push({ name: '管理者コンソール', icon: <Users size={20} />, href: '/admin' });
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#080808] border-r border-white/10 p-6 flex flex-col z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-indigo-600 p-2 rounded-xl">
          <Zap size={20} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tighter italic">Ignitera OS</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-medium ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
        
        <button 
           onClick={() => alert('ミッション作成（未実装）')}
           className="w-full mt-8 flex items-center gap-4 px-4 py-3 rounded-2xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-all font-medium"
        >
          <PlusSquare size={20} />
          <span className="text-sm">任務を発令する</span>
        </button>
      </nav>

      <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
        <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold">
            {user?.name?.substring(0,2)}
          </div>
          <div className="flex-1 truncate">
            <div className="text-xs font-bold truncate">{user?.name}</div>
            <div className="text-[10px] text-gray-500 font-mono tracking-tighter">Rank {user?.rank || 'Z'}</div>
          </div>
        </div>

        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-medium"
        >
          <LogOut size={20} />
          <span className="text-sm">ログアウト</span>
        </button>
      </div>
    </aside>
  );
}

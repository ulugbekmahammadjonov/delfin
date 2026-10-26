import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Timer,
  DoorClosed,
  ShoppingBag,
  Users,
  Wallet,
  Settings,
} from 'lucide-react';

export default function Sidebar() {
  const {
    t,
    currentTab,
    userRole,
    sessions,
    rooms,
    products,
  } = useApp();

  const overtimeCount = sessions.filter((s) => s.status === 'overtime').length;
  const activeCount = sessions.filter((s) => s.status === 'active').length;
  const cleaningRoomsCount = rooms.filter((r) => r.status === 'cleaning').length;
  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  const menuItems = [
    {
      id: 'dashboard',
      path: '/',
      label: t.dashboard,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'registration',
      path: '/registration',
      label: t.registration,
      icon: Timer,
      badge: overtimeCount > 0 ? (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
          {overtimeCount}
        </span>
      ) : activeCount > 0 ? (
        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-400">
          {activeCount}
        </span>
      ) : null,
    },
    {
      id: 'rooms',
      path: '/rooms',
      label: t.rooms,
      icon: DoorClosed,
      badge: cleaningRoomsCount > 0 ? (
        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/20 text-amber-500">
          {cleaningRoomsCount}
        </span>
      ) : null,
    },
    {
      id: 'minibar',
      path: '/minibar',
      label: t.minibar,
      icon: ShoppingBag,
      badge: lowStockCount > 0 ? (
        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-red-500/20 text-red-400">
          !
        </span>
      ) : null,
    },
    {
      id: 'crm',
      path: '/crm',
      label: t.crm,
      icon: Users,
      badge: null,
    },
    {
      id: 'cashier',
      path: '/cashier',
      label: t.cashier,
      icon: Wallet,
      badge: null,
    },
    {
      id: 'settings',
      path: '/settings',
      label: t.settings,
      icon: Settings,
      badge: userRole === 'super_admin' ? (
        <span className="text-[10px] text-purple-400 font-bold">PRO</span>
      ) : null,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 transition-colors h-full overflow-y-auto select-none">
      <div className="space-y-6">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 dark:bg-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-sky-50 dark:from-slate-800/80 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700/60 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {t.shiftOpen}
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">09:00 - 23:59</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[11px] mt-1">
            <span>Kassir:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Dilshod A.</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[11px] mt-1">
            <span>Kassa tushumi:</span>
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400">8,150,000 UZS</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

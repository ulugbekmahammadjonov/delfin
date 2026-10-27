import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/app/providers/AppContext';
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
    isSidebarCollapsed,
    toggleSidebar,
  } = useApp();

  const overtimeCount = sessions.filter((s) => s.status === 'overtime').length;
  const activeCount = sessions.filter((s) => s.status === 'active').length;
  const partialRoomsCount = rooms.filter((r) => r.status === 'partial').length;
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
      badge: partialRoomsCount > 0 ? (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
          Joy bor
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
    <aside
      className={`shrink-0 hidden md:flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out h-full overflow-y-auto select-none ${
        isSidebarCollapsed ? 'w-20 p-2.5' : 'w-64 p-4'
      }`}
    >
      <div className="space-y-4">
        {/* Navigation items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`group relative w-full flex items-center rounded-xl text-sm font-semibold transition-all ${
                  isSidebarCollapsed
                    ? 'justify-center p-3'
                    : 'justify-between px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 dark:bg-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`}
                  />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isSidebarCollapsed && item.badge}

                {/* Badge indicator in collapsed mode */}
                {isSidebarCollapsed && item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
                )}

                {/* Floating tooltip in collapsed mode */}
                {isSidebarCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap z-50 animate-in fade-in duration-150">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-800">
        {!isSidebarCollapsed ? (
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
        ) : (
          <div
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center group relative cursor-pointer"
            onClick={toggleSidebar}
            title="Smena ochiq: 09:00 - 23:59"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1">Smena</span>

            <div className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex flex-col gap-0.5 px-3 py-2 bg-slate-900 text-white text-[11px] font-medium rounded-xl shadow-2xl whitespace-nowrap z-50">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Smena ochiq
              </span>
              <span>Kassir: Dilshod A.</span>
              <span>Kassa: 8,150,000 UZS</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

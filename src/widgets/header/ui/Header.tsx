import React from 'react';
import { useApp } from '@/app/providers/AppContext';
import { LangType } from '@/shared/types';
import {
  Moon,
  Sun,
  Volume2,
  VolumeX,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  RotateCcw,
  PanelLeft,
} from 'lucide-react';

export default function Header() {
  const {
    t,
    lang,
    setLang,
    isDarkMode,
    toggleDarkMode,
    soundEnabled,
    toggleSound,
    userRole,
    setUserRole,
    setCurrentTab,
    setIsShiftModalOpen,
    sessions,
    resetAllData,
    isSidebarCollapsed,
    toggleSidebar,
  } = useApp();

  const overtimeSessions = sessions.filter((s) => s.status === 'overtime');
  const activeSessions = sessions.filter((s) => s.status === 'active');
  const totalGuestsInside = [...overtimeSessions, ...activeSessions].reduce(
    (acc, curr) => acc + (curr.guestsCount || 0),
    0
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 lg:px-6 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Brand info & live alert badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isSidebarCollapsed ? "Sidebarni ochish" : "Sidebarni yopish"}
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <div
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-teal-400 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <span className="text-2xl leading-none">🐬</span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-600 via-sky-600 to-teal-500 dark:from-cyan-400 dark:to-teal-300 bg-clip-text text-transparent">
                  DELFIN
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  CRM
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
                Sauna & Basseyn
              </p>
            </div>
          </div>

          {/* Live Quick Counters */}
          <div className="hidden md:flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Users className="w-3.5 h-3.5" />
              <span>{totalGuestsInside} kishi ichkarida</span>
            </div>

            {overtimeSessions.length > 0 && (
              <div
                onClick={() => setCurrentTab('registration')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-700 cursor-pointer animate-pulse-fast hover:scale-105 transition-transform"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{overtimeSessions.length} ta vaqti o'tgan!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Quick Registration Button */}
          <button
            onClick={() => setCurrentTab('registration')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white shadow-md shadow-sky-600/25 active:scale-95 transition-all"
            title="Yangi mijoz qabul qilish"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t.newRegistrationBtn}</span>
            <span className="sm:hidden">+ Qabul</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm("Barcha ma'lumotlarni boshlang'ich demo holatiga qaytarishni xohlaysizmi?")) {
                resetAllData();
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Barcha ma'lumotlarni boshlang'ich demo holatiga qaytarish (Reset)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden xl:inline">Reset</span>
          </button>

          {/* Smena Yopish button */}
          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.closeShiftBtn}</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg text-sm border transition-colors ${
              soundEnabled
                ? 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800'
                : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
            }`}
            title={soundEnabled ? t.soundOn : t.soundOff}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            title={isDarkMode ? t.lightMode : t.darkMode}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangType)}
              className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-2.5 py-1.5 pr-6 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="uz">UZ (Lot)</option>
              <option value="uz_cyrl">ЎЗ (Кир)</option>
              <option value="ru">RU (Рус)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Role Switcher Pill */}
          <div className="flex items-center pl-1">
            <button
              onClick={() => setUserRole(userRole === 'super_admin' ? 'admin' : 'super_admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                userRole === 'super_admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              }`}
              title="Rolni o'zgartirish (Super Admin / Kassir)"
            >
              {userRole === 'super_admin' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="hidden md:inline font-semibold">Super Admin</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden md:inline font-semibold">Kassir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

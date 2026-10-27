import React, { useState } from 'react';
import { useApp } from '@/app/providers/AppContext';
import {
  Banknote,
  Users,
  Timer,
  CalendarCheck,
  TrendingUp,
  Award,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  Flame,
  CreditCard,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { peakHoursHeatmap } from '@/shared/data/mockData';

type PeriodType = 'bugun' | 'hafta' | 'oy' | 'yil';

export default function DashboardView() {
  const { t, sessions, clients, setCurrentTab } = useApp();
  const [period, setPeriod] = useState<PeriodType>('bugun');

  const activeSessions = sessions.filter((s) => s.status === 'active' || s.status === 'overtime');
  const insideGuests = activeSessions.reduce((acc, s) => acc + (s.guestsCount || 0), 0);
  const bookingsCount = sessions.filter((s) => s.status === 'booking').length;

  // Live session additions for today
  const liveSessionRevenue = sessions
    .filter((s) => s.status !== 'booking')
    .reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const liveGuestsCount = sessions
    .filter((s) => s.status !== 'booking')
    .reduce((acc, s) => acc + (s.guestsCount || 0), 0);

  // Dynamic period dataset
  const periodDataMap: Record<
    PeriodType,
    {
      label: string;
      revenue: number;
      growth: string;
      comparisonText: string;
      guestsCount: number;
      groupsCount: number;
      visitsChartType: string;
      visitsTimeline: Array<{ time: string; joriy: number; oldingi: number }>;
      currentLegend: string;
      previousLegend: string;
      revenueTimeline: Array<{ day: string; sauna: number; bar: number }>;
      revenueTimelineType: string;
      tariffsDistribution: Array<{ name: string; value: number; color: string }>;
      paymentMethods: Record<string, { label: string; percent: number; amount: number; color: string }>;
      totalTurnover: number;
    }
  > = {
    bugun: {
      label: 'Bugun',
      revenue: 3850000 + liveSessionRevenue,
      growth: '+14.8%',
      comparisonText: "kechagiga nisbatan",
      guestsCount: 34 + liveGuestsCount,
      groupsCount: 9 + sessions.filter((s) => s.status === 'active' || s.status === 'completed').length,
      visitsChartType: 'Soatbay (09:00 - 23:00)',
      currentLegend: 'Bugungi oqim',
      previousLegend: 'Kechagi oqim',
      visitsTimeline: [
        { time: '09:00', joriy: 4, oldingi: 2 },
        { time: '11:00', joriy: 9, oldingi: 6 },
        { time: '13:00', joriy: 14, oldingi: 10 },
        { time: '15:00', joriy: 18, oldingi: 16 },
        { time: '17:00', joriy: 26, oldingi: 22 },
        { time: '19:00', joriy: 34, oldingi: 28 },
        { time: '21:00', joriy: 42, oldingi: 35 },
        { time: '23:00', joriy: 28, oldingi: 24 },
      ],
      revenueTimelineType: "Soat oralig'i kesimida",
      revenueTimeline: [
        { day: '09-12', sauna: 780000, bar: 160000 },
        { day: '12-15', sauna: 950000, bar: 240000 },
        { day: '15-18', sauna: 1150000, bar: 310000 },
        { day: '18-21', sauna: 1450000, bar: 420000 },
        { day: '21-00', sauna: 1250000, bar: 290000 },
      ],
      tariffsDistribution: [
        { name: '1 soat', value: 22, color: '#0ea5e9' },
        { name: '1.5 soat', value: 35, color: '#14b8a6' },
        { name: '2 soat', value: 30, color: '#6366f1' },
        { name: 'VIP Paket', value: 13, color: '#f59e0b' },
      ],
      paymentMethods: {
        cash: { label: 'Naqd pul', percent: 45, amount: Math.round((3850000 + liveSessionRevenue) * 0.45), color: 'bg-emerald-500' },
        card: { label: 'Plastik terminal (Uzcard/Humo)', percent: 35, amount: Math.round((3850000 + liveSessionRevenue) * 0.35), color: 'bg-sky-500' },
        qr:   { label: 'P2P/QR (Click, Payme)', percent: 16, amount: Math.round((3850000 + liveSessionRevenue) * 0.16), color: 'bg-indigo-500' },
        debt: { label: 'Qarz / Nasiya', percent: 4, amount: Math.round((3850000 + liveSessionRevenue) * 0.04), color: 'bg-amber-500' },
      },
      totalTurnover: 3850000 + liveSessionRevenue,
    },
    hafta: {
      label: 'Bu hafta',
      revenue: 41260000,
      growth: '+18.4%',
      comparisonText: "o'tgan haftaga nisbatan",
      guestsCount: 256,
      groupsCount: 68,
      visitsChartType: 'Kunbay (Dush - Yak)',
      currentLegend: 'Ushbu hafta',
      previousLegend: "O'tgan hafta",
      visitsTimeline: [
        { time: 'Dush', joriy: 28, oldingi: 22 },
        { time: 'Sesh', joriy: 32, oldingi: 26 },
        { time: 'Chor', joriy: 30, oldingi: 25 },
        { time: 'Pay',  joriy: 42, oldingi: 35 },
        { time: 'Juma', joriy: 58, oldingi: 48 },
        { time: 'Shan', joriy: 66, oldingi: 55 },
        { time: 'Yak',  joriy: 54, oldingi: 46 },
      ],
      revenueTimelineType: 'Kunlik tushum',
      revenueTimeline: [
        { day: 'Dush', sauna: 2800000, bar: 650000 },
        { day: 'Sesh', sauna: 3100000, bar: 720000 },
        { day: 'Chor', sauna: 2900000, bar: 590000 },
        { day: 'Pay',  sauna: 4200000, bar: 980000 },
        { day: 'Juma', sauna: 5800000, bar: 1450000 },
        { day: 'Shan', sauna: 7400000, bar: 1950000 },
        { day: 'Yak',  sauna: 6900000, bar: 1800000 },
      ],
      tariffsDistribution: [
        { name: '1 soat', value: 18, color: '#0ea5e9' },
        { name: '1.5 soat', value: 32, color: '#14b8a6' },
        { name: '2 soat', value: 36, color: '#6366f1' },
        { name: 'VIP Paket', value: 14, color: '#f59e0b' },
      ],
      paymentMethods: {
        cash: { label: 'Naqd pul', percent: 44, amount: 18150000, color: 'bg-emerald-500' },
        card: { label: 'Plastik terminal (Uzcard/Humo)', percent: 38, amount: 15680000, color: 'bg-sky-500' },
        qr:   { label: 'P2P/QR (Click, Payme)', percent: 15, amount: 6190000, color: 'bg-indigo-500' },
        debt: { label: 'Qarz / Nasiya', percent: 3, amount: 1240000, color: 'bg-amber-500' },
      },
      totalTurnover: 41260000,
    },
    oy: {
      label: 'Bu oy',
      revenue: 168450000,
      growth: '+24.6%',
      comparisonText: "o'tgan oyga nisbatan",
      guestsCount: 1140,
      groupsCount: 285,
      visitsChartType: 'Hafta kesimida (1 - 4 hafta)',
      currentLegend: 'Ushbu oy',
      previousLegend: "O'tgan oy",
      visitsTimeline: [
        { time: '1-hafta', joriy: 245, oldingi: 210 },
        { time: '2-hafta', joriy: 270, oldingi: 225 },
        { time: '3-hafta', joriy: 315, oldingi: 250 },
        { time: '4-hafta', joriy: 310, oldingi: 260 },
      ],
      revenueTimelineType: 'Haftalik tushum',
      revenueTimeline: [
        { day: '1-hafta', sauna: 28500000, bar: 7200000 },
        { day: '2-hafta', sauna: 31200000, bar: 8100000 },
        { day: '3-hafta', sauna: 39500000, bar: 10400000 },
        { day: '4-hafta', sauna: 35500000, bar: 9200000 },
      ],
      tariffsDistribution: [
        { name: '1 soat', value: 15, color: '#0ea5e9' },
        { name: '1.5 soat', value: 30, color: '#14b8a6' },
        { name: '2 soat', value: 38, color: '#6366f1' },
        { name: 'VIP Paket', value: 17, color: '#f59e0b' },
      ],
      paymentMethods: {
        cash: { label: 'Naqd pul', percent: 42, amount: 70750000, color: 'bg-emerald-500' },
        card: { label: 'Plastik terminal (Uzcard/Humo)', percent: 40, amount: 67380000, color: 'bg-sky-500' },
        qr:   { label: 'P2P/QR (Click, Payme)', percent: 16, amount: 26950000, color: 'bg-indigo-500' },
        debt: { label: 'Qarz / Nasiya', percent: 2, amount: 3370000, color: 'bg-amber-500' },
      },
      totalTurnover: 168450000,
    },
    yil: {
      label: 'Bu yil',
      revenue: 1894000000,
      growth: '+38.2%',
      comparisonText: "o'tgan yilga nisbatan",
      guestsCount: 13420,
      groupsCount: 3410,
      visitsChartType: '12 oy kesimida (Yanvar - Dekabr)',
      currentLegend: '2026-yil',
      previousLegend: '2025-yil',
      visitsTimeline: [
        { time: 'Yan', joriy: 980, oldingi: 720 },
        { time: 'Fev', joriy: 1050, oldingi: 790 },
        { time: 'Mar', joriy: 1120, oldingi: 840 },
        { time: 'Apr', joriy: 990, oldingi: 780 },
        { time: 'May', joriy: 890, oldingi: 710 },
        { time: 'Iyun', joriy: 820, oldingi: 660 },
        { time: 'Iyul', joriy: 790, oldingi: 640 },
        { time: 'Avg', joriy: 910, oldingi: 720 },
        { time: 'Sen', joriy: 1180, oldingi: 890 },
        { time: 'Okt', joriy: 1350, oldingi: 980 },
        { time: 'Noy', joriy: 1520, oldingi: 1120 },
        { time: 'Dek', joriy: 1820, oldingi: 1350 },
      ],
      revenueTimelineType: 'Oylik tushum',
      revenueTimeline: [
        { day: 'Yan', sauna: 115000000, bar: 28000000 },
        { day: 'Fev', sauna: 122000000, bar: 31000000 },
        { day: 'Mar', sauna: 130000000, bar: 34000000 },
        { day: 'Apr', sauna: 112000000, bar: 29000000 },
        { day: 'May', sauna: 98000000, bar: 24000000 },
        { day: 'Iyun', sauna: 89000000, bar: 22000000 },
        { day: 'Iyul', sauna: 85000000, bar: 21000000 },
        { day: 'Avg', sauna: 99000000, bar: 26000000 },
        { day: 'Sen', sauna: 135000000, bar: 36000000 },
        { day: 'Okt', sauna: 158000000, bar: 42000000 },
        { day: 'Noy', sauna: 175000000, bar: 48000000 },
        { day: 'Dek', sauna: 210000000, bar: 58000000 },
      ],
      tariffsDistribution: [
        { name: '1 soat', value: 14, color: '#0ea5e9' },
        { name: '1.5 soat', value: 28, color: '#14b8a6' },
        { name: '2 soat', value: 40, color: '#6366f1' },
        { name: 'VIP Paket', value: 18, color: '#f59e0b' },
      ],
      paymentMethods: {
        cash: { label: 'Naqd pul', percent: 40, amount: 757600000, color: 'bg-emerald-500' },
        card: { label: 'Plastik terminal (Uzcard/Humo)', percent: 42, amount: 795480000, color: 'bg-sky-500' },
        qr:   { label: 'P2P/QR (Click, Payme)', percent: 16, amount: 303040000, color: 'bg-indigo-500' },
        debt: { label: 'Qarz / Nasiya', percent: 2, amount: 37880000, color: 'bg-amber-500' },
      },
      totalTurnover: 1894000000,
    },
  };

  const currentData = periodDataMap[period];

  const topVipClients = [...clients]
    .filter((c) => !c.isBlacklisted)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.dashboard}
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>
              <span>Jonli Analitika: <strong>{currentData.label}</strong></span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            "Delfin" Saunasi faoliyatining tanlangan davr bo'yicha real-vaqtdagi ko'rsatkichlari
          </p>
        </div>

        {/* Time Period Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 self-start sm:self-auto text-xs font-semibold shadow-inner">
          {[
            { id: 'bugun' as const, label: t.periodToday },
            { id: 'hafta' as const, label: t.periodWeek },
            { id: 'oy' as const, label: t.periodMonth },
            { id: 'yil' as const, label: t.periodYear },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`px-3.5 py-1.5 rounded-xl transition-all font-bold ${
                period === item.id
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenue */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.kpiRevenue} ({currentData.label})
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {currentData.revenue.toLocaleString()}{' '}
              <span className="text-xs font-medium text-slate-400">UZS</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{currentData.growth}</span>
              <span className="text-slate-400 font-normal">{currentData.comparisonText}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Visits */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.kpiVisits} ({currentData.label})
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {currentData.guestsCount.toLocaleString()} <span className="text-xs font-medium text-slate-400">{t.guestsCount}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              <span>{currentData.groupsCount.toLocaleString()} {t.groupsCount} qabul qilindi</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Inside right now */}
        <div
          onClick={() => setCurrentTab('rooms')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.kpiInside} (Hozir saunada)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight flex items-baseline gap-2">
              <span>{insideGuests}</span>
              <span className="text-xs font-medium text-slate-400">{t.peopleInside}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{activeSessions.length} {t.activeSessionsCount}</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Bookings */}
        <div
          onClick={() => setCurrentTab('registration')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.kpiBookings}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {bookingsCount}{' '}
              <span className="text-xs font-medium text-slate-400">ta bron</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              <span>Oldindan qabul qilingan zakladlar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts: Visits & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-500" />
                {t.chartVisitsTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {currentData.label} bo'yicha mijozlar oqimi dinamikasi
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              {currentData.visitsChartType}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.visitsTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="joriy" name={currentData.currentLegend} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="oldingi" name={currentData.previousLegend} fill="#64748b" radius={[4, 4, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Banknote className="w-4 h-4 text-teal-500" />
                {t.chartRevenueTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Saunalar va mini-bar tushumlari nisbati
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {currentData.revenueTimelineType}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.revenueTimeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="saunaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) =>
                    val >= 1000000000
                      ? `${(val / 1000000000).toFixed(1)}B`
                      : val >= 1000000
                      ? `${(val / 1000000).toFixed(1)}M`
                      : `${(val / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => `${Number(val).toLocaleString()} UZS`}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="sauna"
                  name={t.saunaRevenue}
                  stroke="#0284c7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#saunaColor)"
                />
                <Area
                  type="monotone"
                  dataKey="bar"
                  name={t.barRevenue}
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#barColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboard & Tariffs Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top VIP Clients Leaderboard */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                {t.leaderboardTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Eng ko'p tashrif buyurgan va eng ko'p mablag' qoldirgan doimiy mijozlar
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('crm')}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Barchasi (CRM)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">{t.leaderboardRank}</th>
                  <th className="py-2.5 px-3">{t.clientName}</th>
                  <th className="py-2.5 px-3">{t.phone}</th>
                  <th className="py-2.5 px-3 text-center">{t.visits}</th>
                  <th className="py-2.5 px-3">{t.totalSpent}</th>
                  <th className="py-2.5 px-3 rounded-r-lg">{t.statusBadge}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topVipClients.map((client, index) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-slate-400">
                      {index === 0 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                          1
                        </span>
                      ) : index === 1 ? (
                        <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center font-bold">
                          2
                        </span>
                      ) : index === 2 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-700/60 text-white flex items-center justify-center font-bold">
                          3
                        </span>
                      ) : (
                        `#${index + 1}`
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {client.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">
                      {client.phone}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-sky-600 dark:text-sky-400">
                      {client.visitsCount} marta
                    </td>
                    <td className="py-3 px-3 font-mono font-extrabold text-slate-800 dark:text-slate-100">
                      {client.totalSpent.toLocaleString()} UZS
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tariffs Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {t.chartTariffsTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {currentData.label} bo'yicha eng ko'p tanlangan paketlar ulushi
            </p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentData.tariffsDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {currentData.tariffsDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => `${val}%`}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {currentData.tariffsDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name}:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap & Payment Methods Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Heatmap */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                {t.chartPeakHoursTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Hafta kunlari va soatlar kesimida gavjumlik (Aksiya va chegirmalar rejalashtirish uchun)
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-4 text-xs">
            <div className="grid grid-cols-5 text-center font-bold text-slate-400 text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800">
              <div className="text-left">Kun</div>
              <div>10:00 - 14:00</div>
              <div>14:00 - 18:00</div>
              <div>18:00 - 22:00</div>
              <div>22:00 - 02:00</div>
            </div>

            {peakHoursHeatmap.map((item: any, idx) => (
              <div key={idx} className="grid grid-cols-5 items-center gap-2 py-1">
                <div className="font-bold text-slate-700 dark:text-slate-300">{item.day}</div>
                {['10-14', '14-18', '18-22', '22-02'].map((slot, sIdx) => {
                  const val = item[slot];
                  const bgClass =
                    val > 80
                      ? 'bg-rose-500 text-white font-bold'
                      : val > 60
                      ? 'bg-amber-500 text-white font-semibold'
                      : val > 40
                      ? 'bg-sky-500/80 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

                  return (
                    <div
                      key={sIdx}
                      className={`text-center py-1.5 rounded-lg text-xs font-mono transition-transform hover:scale-105 cursor-default ${bgClass}`}
                      title={`${item.day} ${slot} yuklama: ${val}%`}
                    >
                      {val}%
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-end gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-700"></span> Bo'sh
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-sky-500"></span> O'rtacha
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Gavjum
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Eng qizg'in (Peak)
            </span>
          </div>
        </div>

        {/* Payment Methods Split */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-500" />
              {t.chartPaymentMethodsTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {currentData.label} bo'yicha to'lov kanallari ulushi va summasi
            </p>
          </div>

          <div className="space-y-4 my-auto py-2">
            {Object.entries(currentData.paymentMethods).map(([key, data]) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {data.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {data.amount.toLocaleString()} UZS
                    </span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {data.percent}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${data.color} rounded-full transition-all duration-500`}
                    style={{ width: `${data.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Jami hisoblangan aylanma ({currentData.label}):</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
              {currentData.totalTurnover.toLocaleString()} UZS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

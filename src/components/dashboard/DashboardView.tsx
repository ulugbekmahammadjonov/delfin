import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
import {
  visitsTimelineData,
  revenueBreakdownData,
  tariffsDistributionData,
  peakHoursHeatmap,
  paymentMethodsSplit,
} from '../../data/mockData';

export default function DashboardView() {
  const { t, sessions, clients, setCurrentTab } = useApp();
  const [period, setPeriod] = useState<string>('bugun');

  const activeSessions = sessions.filter((s) => s.status === 'active' || s.status === 'overtime');
  const insideGuests = activeSessions.reduce((acc, s) => acc + (s.guestsCount || 0), 0);
  const bookingsCount = sessions.filter((s) => s.status === 'booking').length;

  const totalTodayRevenue = sessions
    .filter((s) => s.status !== 'booking')
    .reduce((acc, s) => acc + (s.totalAmount || 0), 3850000);

  const topVipClients = [...clients]
    .filter((c) => !c.isBlacklisted)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.dashboard}
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>
              Jonli Analitika
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            "Delfin" Saunasi faoliyatining real-vaqtdagi ko'rsatkichlari va moliyaviy tahlili
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 self-start sm:self-auto text-xs font-semibold">
          {[
            { id: 'bugun', label: t.periodToday },
            { id: 'hafta', label: t.periodWeek },
            { id: 'oy', label: t.periodMonth },
            { id: 'yil', label: t.periodYear },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === item.id
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.kpiRevenue}
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {totalTodayRevenue.toLocaleString()}{' '}
              <span className="text-xs font-medium text-slate-400">UZS</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.8%</span>
              <span className="text-slate-400 font-normal">{t.vsYesterday}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.kpiVisits}
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              34 <span className="text-xs font-medium text-slate-400">{t.guestsCount}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              <span>9 {t.groupsCount} qabul qilindi</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => setCurrentTab('registration')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.kpiInside}
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
              <span>Kelish vaqtlari: 13:00, 17:00</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-500" />
                {t.chartVisitsTitle}
              </h3>
              <p className="text-xs text-slate-500">{t.chartVisitsSubtitle}</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Soatbay
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitsTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="bugun" name="Bugungi oqim" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="kecha" name="Kechagi oqim" fill="#64748b" radius={[4, 4, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Banknote className="w-4 h-4 text-teal-500" />
                {t.chartRevenueTitle}
              </h3>
              <p className="text-xs text-slate-500">{t.chartRevenueSubtitle}</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Haftalik o'sish
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueBreakdownData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {t.chartTariffsTitle}
            </h3>
            <p className="text-xs text-slate-500">Mijozlar eng ko'p tanlagan paketlar ulushi</p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tariffsDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {tariffsDistributionData.map((entry, index) => (
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
            {tariffsDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name}:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-500" />
              {t.chartPaymentMethodsTitle}
            </h3>
            <p className="text-xs text-slate-500">Kassaga tushgan pullarning to'lov kanallari bo'yicha taqsimoti</p>
          </div>

          <div className="space-y-4 my-auto py-2">
            {Object.entries(paymentMethodsSplit).map(([key, data]) => (
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
            <span>Jami hisoblangan kassa aylanmasi:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
              8,470,000 UZS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

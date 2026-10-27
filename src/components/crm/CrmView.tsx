import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientVisit } from '../../types';
import { formatTime24 } from '../../utils/dateUtils';
import {
  Users,
  Award,
  ShieldAlert,
  ShieldCheck,
  Search,
  X,
  Eye,
  Calendar,
  Phone,
  AlertTriangle,
  Clock,
  CreditCard,
  UserCheck,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function CrmView() {
  const { t, clients, addToBlacklist, removeFromBlacklist } = useApp();

  // Filter tabs: 'all' | 'most_visits' | 'blacklist' | 'debtors'
  const [activeTab, setActiveTab] = useState<'all' | 'most_visits' | 'blacklist' | 'debtors'>('all');
  const [search, setSearch] = useState<string>('');

  // Modals state
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [selectedClientForBlacklist, setSelectedClientForBlacklist] = useState<Client | null>(null);
  const [blacklistReasonInput, setBlacklistReasonInput] = useState<string>('');

  // Counts for tabs
  const allCount = clients.length;
  const mostVisitsCount = clients.filter((c) => c.visitsCount >= 5 && !c.isBlacklisted).length;
  const blacklistCount = clients.filter((c) => c.isBlacklisted).length;
  const debtorsCount = clients.filter((c) => (c.debtAmount || 0) > 0).length;
  const totalDebtSum = clients.reduce((acc, c) => acc + (c.debtAmount || 0), 0);

  // Filtering and sorting
  const filteredClients = clients
    .filter((c) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        c.phone.includes(q);

      if (!matchSearch) return false;

      if (activeTab === 'most_visits') return c.visitsCount >= 5 && !c.isBlacklisted;
      if (activeTab === 'blacklist') return c.isBlacklisted;
      if (activeTab === 'debtors') return (c.debtAmount || 0) > 0;
      return true;
    })
    .sort((a, b) => {
      if (activeTab === 'most_visits') {
        return b.visitsCount - a.visitsCount;
      }
      if (activeTab === 'debtors') {
        return (b.debtAmount || 0) - (a.debtAmount || 0);
      }
      return 0;
    });

  const handleConfirmBlacklist = () => {
    if (!selectedClientForBlacklist || !blacklistReasonInput.trim()) return;
    addToBlacklist(selectedClientForBlacklist.id, blacklistReasonInput.trim());
    if (detailClient && detailClient.id === selectedClientForBlacklist.id) {
      setDetailClient({
        ...detailClient,
        isBlacklisted: true,
        blacklistReason: blacklistReasonInput.trim(),
        status: "Qora ro'yxat",
      });
    }
    setSelectedClientForBlacklist(null);
    setBlacklistReasonInput('');
  };

  const handleRemoveBlacklistDirect = (clientId: string) => {
    removeFromBlacklist(clientId);
    if (detailClient && detailClient.id === clientId) {
      setDetailClient({
        ...detailClient,
        isBlacklisted: false,
        blacklistReason: null,
        status: detailClient.visitsCount >= 10 ? 'VIP Platina' : detailClient.visitsCount >= 5 ? 'Doimiy VIP' : 'Mijoz',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-500" />
            {t.crmTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            1 yillik mijozlar hisobi, tashriflar dinamikasi, qarzlar va qora ro'yxat nazorati
          </p>
        </div>
      </div>

      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Jami mijozlar</span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
              {allCount} nafar
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">1 yillik doimiy baza</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Eng ko'p kelganlar</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {mostVisitsCount} nafar
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">5+ marta tashrif buyurganlar</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Qarzdorlar</span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
              {debtorsCount} nafar
            </span>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold font-mono">
              {totalDebtSum.toLocaleString()} UZS qarz
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Qora ro'yxat</span>
            <span className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1 block">
              {blacklistCount} nafar
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Kirishi taqiqlanganlar</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>Barchasi</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200/60 dark:bg-slate-700">
              {allCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('most_visits')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'most_visits'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Eng ko'p kelganlar</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-200/50 dark:bg-amber-900/60">
              {mostVisitsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('debtors')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'debtors'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Qarz bo'lganlar</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-200/50 dark:bg-rose-900/60">
              {debtorsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blacklist')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'blacklist'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Qora ro'yxat</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700">
              {blacklistCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism yoki tel raqam bilan qidirish..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Clients Table View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Mijoz</th>
                <th className="py-3.5 px-4">Telefon</th>
                <th className="py-3.5 px-4 text-center">1 Yillik Tashrif</th>
                <th className="py-3.5 px-4">Jami Xarid</th>
                <th className="py-3.5 px-4">Bonus</th>
                <th className="py-3.5 px-4">Qarzdorlik</th>
                <th className="py-3.5 px-4">Oxirgi Tashrif</th>
                <th className="py-3.5 px-4">Holati</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Hech qanday mijoz topilmadi.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isBlack = client.isBlacklisted;
                  const isVip = client.visitsCount >= 5 && !isBlack;
                  const hasDebt = (client.debtAmount || 0) > 0;

                  return (
                    <tr
                      key={client.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isBlack ? 'bg-rose-50/30 dark:bg-rose-950/20' : hasDebt ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                              isBlack
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : isVip
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                            }`}
                          >
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{client.name}</span>
                              {isVip && <span className="text-xs">👑</span>}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Ro'yxat: {client.registeredDate || '2025-yildan'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-300">
                        {client.phone}
                      </td>

                      {/* Visits Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                            client.visitsCount >= 10
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : client.visitsCount >= 5
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {client.visitsCount} marta
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {client.totalSpent.toLocaleString()} UZS
                      </td>

                      {/* Bonus */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{client.bonusBalance?.toLocaleString() || 0} UZS
                      </td>

                      {/* Debt */}
                      <td className="py-3.5 px-4 font-mono">
                        {hasDebt ? (
                          <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            {client.debtAmount?.toLocaleString()} UZS
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Qarzi yo'q</span>
                        )}
                      </td>

                      {/* Last Visit Date */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {client.lastVisitDate}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isBlack
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                              : hasDebt
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : isVip
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailClient(client)}
                            className="px-2.5 py-1.5 rounded-xl font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-colors flex items-center gap-1"
                            title="Batafsil ma'lumot va 1 yillik tashriflar tarixi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Batafsil</span>
                          </button>

                          {isBlack ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveBlacklistDirect(client.id)}
                              className="p-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800"
                              title="Qora ro'yxatdan chiqarish"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedClientForBlacklist(client);
                                setBlacklistReasonInput('');
                              }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-slate-200 dark:border-slate-700"
                              title="Qora ro'yxatga kiritish"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Detail Modal */}
      {detailClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-sky-500/20">
                  {detailClient.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {detailClient.name}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        detailClient.isBlacklisted
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
                          : (detailClient.debtAmount || 0) > 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                      }`}
                    >
                      {detailClient.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="font-mono font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Phone className="w-3 h-3 text-sky-500" />
                      {detailClient.phone}
                    </span>
                    <span>•</span>
                    <span>Ro'yxatdan o'tgan: {detailClient.registeredDate || '2025-yildan beri'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailClient(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Blacklist Alert if blacklisted */}
              {detailClient.isBlacklisted && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Diqqat: Mijoz Qora Ro'yxatga Kiritilgan!</span>
                  </div>
                  <p className="text-xs leading-relaxed bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-rose-200 dark:border-rose-800/80 font-medium">
                    <strong>Kiritish sababi:</strong> {detailClient.blacklistReason || "Ichki qoidalarni buzgan."}
                  </p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveBlacklistDirect(detailClient.id)}
                      className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Qora ro'yxatdan chiqarish</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Debt Alert if debtor */}
              {(detailClient.debtAmount || 0) > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Mijozning to'lanmagan qarzdorligi mavjud:</span>
                  </div>
                  <span className="font-mono font-black text-sm text-rose-600 dark:text-rose-400">
                    {detailClient.debtAmount?.toLocaleString()} UZS
                  </span>
                </div>
              )}

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">1 Yillik Tashrif</span>
                  <span className="text-base font-black text-sky-600 dark:text-sky-400 font-mono mt-0.5 block">
                    {detailClient.visitsCount} marta
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">Jami Xarid</span>
                  <span className="text-base font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5 block">
                    {detailClient.totalSpent.toLocaleString()} UZS
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">Bonus Balansi</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                    +{detailClient.bonusBalance?.toLocaleString() || 0} UZS
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">Qarz Holati</span>
                  <span
                    className={`text-base font-black font-mono mt-0.5 block ${
                      (detailClient.debtAmount || 0) > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {(detailClient.debtAmount || 0) > 0 ? `${detailClient.debtAmount?.toLocaleString()} UZS` : 'Qarzi yo\'q'}
                  </span>
                </div>
              </div>

              {/* Client Notes if any */}
              {detailClient.notes && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ℹ️ Mijoz haqida administrator eslatmasi:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">{detailClient.notes}</p>
                </div>
              )}

              {/* 1 Year Visits History Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    <span>1 Yillik Tashriflar Tarixi ({detailClient.visitsHistory?.length || 0} ta yozuv)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Oxirgi tashrif: {detailClient.lastVisitDate}</span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Sana & Vaqt</th>
                          <th className="py-2.5 px-3">Sauna</th>
                          <th className="py-2.5 px-3 text-center">Mehmon</th>
                          <th className="py-2.5 px-3">Davomiyligi</th>
                          <th className="py-2.5 px-3">Summa</th>
                          <th className="py-2.5 px-3">To'lov usuli</th>
                          <th className="py-2.5 px-3">Holat</th>
                          <th className="py-2.5 px-3">Izoh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {(!detailClient.visitsHistory || detailClient.visitsHistory.length === 0) ? (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-slate-400">
                              Tashriflar tarixi topilmadi.
                            </td>
                          </tr>
                        ) : (
                          detailClient.visitsHistory.map((visit) => (
                            <tr key={visit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                <div>{visit.date}</div>
                                <div className="text-[10px] text-slate-400 font-normal">{formatTime24(visit.time)}</div>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">{visit.roomName}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-sky-600">{visit.guestsCount} kishi</td>
                              <td className="py-2.5 px-3 whitespace-nowrap">{visit.durationHours} soat</td>
                              <td className="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                                {visit.totalAmount.toLocaleString()} UZS
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {visit.paymentMethod}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    visit.paymentStatus === 'full'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : visit.paymentStatus === 'deposit'
                                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  }`}
                                >
                                  {visit.paymentStatus === 'full'
                                    ? "To'langan"
                                    : visit.paymentStatus === 'deposit'
                                    ? 'Zalog'
                                    : 'Qarz'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 max-w-[150px] truncate" title={visit.notes || ''}>
                                {visit.notes || '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3">
              <div>
                {!detailClient.isBlacklisted ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClientForBlacklist(detailClient);
                      setBlacklistReasonInput('');
                    }}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-300 dark:border-rose-800 flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Qora ro'yxatga kiritish</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRemoveBlacklistDirect(detailClient.id)}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Qora ro'yxatdan chiqarish</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setDetailClient(null)}
                className="py-2 px-5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm transition-all"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add To Blacklist Reason Modal */}
      {selectedClientForBlacklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h2 className="font-extrabold text-base">Qora Ro'yxatga Kiritish</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClientForBlacklist(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Mijoz: <span className="font-bold text-slate-900 dark:text-white">{selectedClientForBlacklist.name}</span> ({selectedClientForBlacklist.phone})
            </p>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Qora ro'yxatga kiritish sababini batafsil yozing:
              </label>
              <textarea
                value={blacklistReasonInput}
                onChange={(e) => setBlacklistReasonInput(e.target.value)}
                placeholder="Masalan: Sauna anjomlariga zarar yetkazgan, to'lov qilishdan bosh tortgan yoki xodimlar bilan janjal qilgan..."
                rows={3}
                required
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedClientForBlacklist(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={!blacklistReasonInput.trim()}
                onClick={handleConfirmBlacklist}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 shadow-md transition-all"
              >
                Tasdiqlash va Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

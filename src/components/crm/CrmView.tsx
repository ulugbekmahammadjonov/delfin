import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import {
  Users,
  Award,
  ShieldAlert,
  ShieldCheck,
  Search,
  X,
} from 'lucide-react';

export default function CrmView() {
  const { t, clients, addToBlacklist, removeFromBlacklist } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const [selectedClientForBlacklist, setSelectedClientForBlacklist] = useState<Client | null>(null);
  const [blacklistReasonInput, setBlacklistReasonInput] = useState<string>('');

  const filteredClients = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);

    if (!matchSearch) return false;

    if (activeTab === 'vip') return c.visitsCount >= 5 && !c.isBlacklisted;
    if (activeTab === 'blacklist') return c.isBlacklisted;
    return true;
  });

  const handleConfirmBlacklist = () => {
    if (!selectedClientForBlacklist || !blacklistReasonInput.trim()) return;
    addToBlacklist(selectedClientForBlacklist.id, blacklistReasonInput.trim());
    setSelectedClientForBlacklist(null);
    setBlacklistReasonInput('');
  };

  const blacklistCount = clients.filter((c) => c.isBlacklisted).length;
  const vipCount = clients.filter((c) => c.visitsCount >= 5 && !c.isBlacklisted).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-500" />
            {t.crmTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.crmSubtitle}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-cyan-600 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl">
            🎁
          </div>
          <div>
            <h3 className="font-extrabold text-sm md:text-base flex items-center gap-2">
              <span>{t.loyaltyRule}:</span>
              <span className="text-amber-200">Har 10-tashrifda 1 soat bepul!</span>
            </h3>
            <p className="text-xs text-sky-100 mt-0.5">
              Har bir to'lovdan 5% bonus avtomatik mijoz balansida to'planib boradi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur px-3 py-2 rounded-xl text-xs self-start md:self-auto">
          <div>
            <span className="text-[10px] text-sky-200 block">Jami bonuslar:</span>
            <span className="font-mono font-bold text-sm">865,000 UZS</span>
          </div>
          <div className="h-6 w-[1px] bg-white/20"></div>
          <div>
            <span className="text-[10px] text-sky-200 block">Faol VIP mijozlar:</span>
            <span className="font-bold text-sm">{vipCount} nafar</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.allClients} ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'vip'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>VIP Mijozlar ({vipCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('blacklist')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'blacklist'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.blacklistTab} ({blacklistCount})</span>
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mijoz ismi yoki telefoni..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const isBlack = client.isBlacklisted;
          const isVip = client.visitsCount >= 5 && !isBlack;

          return (
            <div
              key={client.id}
              className={`rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                isBlack
                  ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-400 dark:border-rose-800'
                  : isVip
                  ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800/80 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {client.name}
                    </h3>
                    {isVip && <span className="text-sm">👑</span>}
                  </div>
                  <div className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {client.phone}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isBlack
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      : isVip
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {client.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tashriflar soni:</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    {client.visitsCount} marta
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jami xaridlar:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {client.totalSpent.toLocaleString()} UZS
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bonus balansi:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{client.bonusBalance?.toLocaleString() || 0} UZS
                  </span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Oxirgi kelgan sana:</span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {client.lastVisitDate}
                  </span>
                </div>
              </div>

              {isBlack && (
                <div className="p-2.5 rounded-xl bg-rose-100/70 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Qora ro'yxatga kiritilgan:</span>
                  </div>
                  <p className="text-[11px] leading-tight">{client.blacklistReason}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {isBlack ? (
                  <button
                    onClick={() => removeFromBlacklist(client.id)}
                    className="w-full py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 transition-colors flex items-center justify-center gap-1"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.removeFromBlacklist}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedClientForBlacklist(client);
                      setBlacklistReasonInput('');
                    }}
                    className="py-1 px-2.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{t.addBlacklist}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedClientForBlacklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h2 className="font-extrabold text-base">Qora Ro'yxatga Kiritish</h2>
              </div>
              <button
                onClick={() => setSelectedClientForBlacklist(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Mijoz: <span className="font-bold">{selectedClientForBlacklist.name}</span> ({selectedClientForBlacklist.phone})
            </p>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Qora ro'yxatga kiritish sababini batafsil yozing:
              </label>
              <textarea
                value={blacklistReasonInput}
                onChange={(e) => setBlacklistReasonInput(e.target.value)}
                placeholder="Masalan: Sauna anjomlariga zarar yetkazgan, to'lov qilishdan bosh tortgan yoki xodimlar bilan haqoratomuz munosabatda bo'lgan..."
                rows={3}
                required
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedClientForBlacklist(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800"
              >
                Bekor qilish
              </button>
              <button
                disabled={!blacklistReasonInput.trim()}
                onClick={handleConfirmBlacklist}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 shadow-md"
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

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Check,
  Bot,
  Smartphone,
  Sliders,
  RotateCcw,
  Database,
  HardDrive,
} from 'lucide-react';

export default function SettingsView() {
  const {
    t,
    tariffs,
    setTariffs,
    actionLogs,
    addLog,
    sessions,
    resetAllData,
    autoPersist,
    setAutoPersist,
  } = useApp();

  const [hour1, setHour1] = useState<number>(tariffs.hour1);
  const [hour1_5, setHour1_5] = useState<number>(tariffs.hour1_5);
  const [hour2, setHour2] = useState<number>(tariffs.hour2);
  const [vip, setVip] = useState<number>(tariffs.vip);
  const [extraPerson, setExtraPerson] = useState<number>(tariffs.extraPersonPerHour);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [botPrompt, setBotPrompt] = useState<string>('status');
  const [botResponse, setBotResponse] = useState<string>(
    `🐬 DELFIN SAUNA — JONLI STATUS\n\n👥 Ichkaridagi odamlar: 12 kishi\n🔥 Faol seanslar soni: 3 ta\n🚪 Band xonalar: VIP Lyuks, Standart 1, Standart 3\n\n✅ Tizim normal rejimda ishlamoqda.`
  );

  const handleSaveTariffs = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...tariffs,
      hour1: Number(hour1),
      hour1_5: Number(hour1_5),
      hour2: Number(hour2),
      vip: Number(vip),
      extraPersonPerHour: Number(extraPerson),
    };
    setTariffs(updated);
    addLog("Super Admin tomonidan standart xizmat tariflari yangilandi.");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const triggerTelegramCommand = (cmd: string) => {
    setBotPrompt(cmd);
    const nowTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    const activeS = sessions.filter((s) => s.status === 'active' || s.status === 'overtime');
    const totalInside = activeS.reduce((acc, s) => acc + (s.guestsCount || 0), 0);

    if (cmd === 'status') {
      setBotResponse(
        `🐬 *DELFIN SAUNA — JONLI STATUS* (${nowTime})\n\n👥 Ichkaridagi odamlar: ${totalInside} kishi\n🔥 Faol seanslar soni: ${activeS.length} ta\n🚪 Band xonalar: ${activeS.map((s) => s.roomName).join(', ') || "Hozircha barchasi bo'sh"}\n\n✅ Tizim normal rejimda ishlamoqda.`
      );
    } else if (cmd === 'kassa') {
      setBotResponse(
        `💰 *KASSA HOLATI* (${nowTime})\n\n💵 Naqd pul: 4,120,000 UZS\n💳 Plastik karta: 2,950,000 UZS\n📱 Click/Payme: 1,400,000 UZS\n\n📊 Jami tushum: 8,470,000 UZS\n📉 Kunlik chiqimlar: 380,000 UZS\n🏆 SOF FOYDA: 8,090,000 UZS`
      );
    } else if (cmd === 'summary') {
      setBotResponse(
        `🌙 *KUNLIK YAKUNIY HISOBOT (23:59)*\n\nSmena mas'uli: Dilshod A.\nJami qabul qilingan mijozlar: 34 ta\nJami guruhlar: 9 ta\nSauna xizmati: 6,850,000 UZS\nMini-bar savdosi: 1,620,000 UZS\n\n📌 Kassada naqd topshirilishi kerak: 4,120,000 UZS.\nSmena muvaffaqiyatli yopildi!`
      );
    }
  };

  const handleExport = (type: string) => {
    alert(`Delfin Sauna ${type.toUpperCase()} formati yuklab olish uchun tayyorlandi!`);
    addLog(`Super Admin hisobotlarni ${type.toUpperCase()} formatida eksport qildi.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-sky-500" />
            {t.settingsTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.settingsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('Excel')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>PDF Hisobot</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-500" />
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t.tariffsSection}
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              Super Admin huquqi
            </span>
          </div>

          <form onSubmit={handleSaveTariffs} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">1 soatlik seans narxi:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={hour1}
                    onChange={(e) => setHour1(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-mono text-[10px]">UZS</span>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">1.5 soatlik seans narxi:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={hour1_5}
                    onChange={(e) => setHour1_5(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-mono text-[10px]">UZS</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">2 soatlik seans narxi:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={hour2}
                    onChange={(e) => setHour2(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-mono text-[10px]">UZS</span>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">VIP Paket narxi:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={vip}
                    onChange={(e) => setVip(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold text-amber-500"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-mono text-[10px]">UZS</span>
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">
                {t.extraPersonRate} (4 kishidan ortiq bo'lsa):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={extraPerson}
                  onChange={(e) => setExtraPerson(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 font-mono text-[10px]">UZS / soat</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                  <Check className="w-4 h-4" />
                  Tariflar yangilandi!
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  O'zgarishlar barcha yangi seanslarga darhol tatbiq etiladi
                </span>
              )}

              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md transition-all active:scale-95"
              >
                {t.saveChanges}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-sky-500" />
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t.telegramBotSection}
              </h2>
            </div>
            <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded">
              @DelfinSaunaBot
            </span>
          </div>

          <p className="text-xs text-slate-500">
            {t.tgBotHint}. Sauna egasi xohlagan vaqtda botga yozib zudlik bilan jonli ma'lumot oladi.
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs space-y-3 min-h-[160px] border border-slate-800">
            <div className="flex items-center gap-2 text-sky-400 text-[11px] pb-1 border-b border-slate-800">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Delfin Sauna Rahbar Boti — Jonli Xabarnoma</span>
            </div>

            <div className="whitespace-pre-line text-[11px] leading-relaxed text-slate-200">
              {botResponse}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => triggerTelegramCommand('status')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                botPrompt === 'status'
                  ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              👥 "Nechta odam bor?"
            </button>
            <button
              onClick={() => triggerTelegramCommand('kassa')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                botPrompt === 'kassa'
                  ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              💰 "Kassada qancha?"
            </button>
            <button
              onClick={() => triggerTelegramCommand('summary')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                botPrompt === 'summary'
                  ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              🌙 "Kunlik 23:59 hisobot"
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Data Storage & Persistence Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-500" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Ma'lumotlar Saqlanishi va Demo Rejimi (Data Persistence)
            </h3>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LocalStorage Faol
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-sky-500" />
                Avtomatik saqlash (LocalStorage)
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPersist}
                  onChange={(e) => setAutoPersist(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Yoqilgan bo'lsa: yangi kiritilgan seanslar, xarajatlar va narxlar brauzeringizda saqlanadi. O'chirilsa: sahifa yangilanganda (refresh) toza holatga qaytadi.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-2">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                Dastlabki Demo Holatiga Qaytarish (Reset)
              </span>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-1">
                Barcha taymerlarni joriy vaqtga moslab, demo seanslar (42 daqiqa qolgan, overtime, bronlar)ni yangidan tiklaydi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Barcha ma'lumotlarni boshlang'ich toza demo holatiga qaytarishni xohlaysizmi?")) {
                  resetAllData();
                  alert("Ma'lumotlar boshlang'ich holatga muvaffaqiyatli qaytarildi!");
                }
              }}
              className="py-2 px-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Boshlang'ich holatga qaytarish (Reset)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-500" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.actionLogsSection}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Firibgarlik va xatoliklarning oldini olish uchun yozib boriladigan audit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Vaqt</th>
                <th className="py-2.5 px-3">Xodim (Muallif)</th>
                <th className="py-2.5 px-3 rounded-r-lg">Amal (Hodisa mazmuni)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {actionLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono text-slate-400">{log.time}</td>
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                    {log.author}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {log.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

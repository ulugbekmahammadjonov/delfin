import React, { useState, useEffect } from 'react';
import { useApp } from '@/app/providers/AppContext';
import { formatTime24, formatSum } from '@/shared/utils/dateUtils';
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
  Clock,
  Moon,
  DollarSign,
  Lock,
  ShieldAlert,
  Users,
  CheckCircle2,
  Sparkles,
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
    userRole,
    defaultStaffHourlyRate,
    setDefaultStaffHourlyRate,
    staffBonusConfig,
    setStaffBonusConfig,
    staffMembers,
    updateStaffMember,
  } = useApp();

  const [hour1, setHour1] = useState<number>(tariffs.hour1);
  const [hour1_5, setHour1_5] = useState<number>(tariffs.hour1_5);
  const [hour2, setHour2] = useState<number>(tariffs.hour2);
  const [vip, setVip] = useState<number>(tariffs.vip);
  const [extraPerson, setExtraPerson] = useState<number>(tariffs.extraPersonPerHour);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [botPrompt, setBotPrompt] = useState<string>('status');
  const [botResponse, setBotResponse] = useState<string>(
    `🐬 DELFIN SAUNA — JONLI STATUS\n\n👥 Ichkaridagi odamlar: 12 kishi\n🔥 Faol seanslar soni: 3 ta\n🚪 Band saunalar: Kichik sauna, Katta sauna\n\n✅ Tizim normal rejimda ishlamoqda.`
  );

  // Staff rates & bonus configuration (Super Admin only)
  const [standardStaffRate, setStandardStaffRate] = useState<number>(defaultStaffHourlyRate || 20000);
  const [bonusEnabled, setBonusEnabled] = useState<boolean>(staffBonusConfig?.enabled ?? true);
  const [bonusStartTime, setBonusStartTime] = useState<string>(staffBonusConfig?.startTime || '20:00');
  const [bonusEndTime, setBonusEndTime] = useState<string>(staffBonusConfig?.endTime || '06:00');
  const [bonusHourlyRate, setBonusHourlyRate] = useState<number>(staffBonusConfig?.bonusHourlyRate || 25000);
  const [individualStaffRates, setIndividualStaffRates] = useState<Record<string, number>>({});
  const [staffSettingsSaved, setStaffSettingsSaved] = useState<boolean>(false);

  useEffect(() => {
    setStandardStaffRate(defaultStaffHourlyRate || 20000);
  }, [defaultStaffHourlyRate]);

  useEffect(() => {
    if (staffBonusConfig) {
      setBonusEnabled(staffBonusConfig.enabled);
      setBonusStartTime(staffBonusConfig.startTime || '20:00');
      setBonusEndTime(staffBonusConfig.endTime || '06:00');
      setBonusHourlyRate(staffBonusConfig.bonusHourlyRate || 25000);
    }
  }, [staffBonusConfig]);

  useEffect(() => {
    const ratesMap: Record<string, number> = {};
    staffMembers.forEach((m) => {
      ratesMap[m.id] = m.hourlyRate || defaultStaffHourlyRate || 20000;
    });
    setIndividualStaffRates(ratesMap);
  }, [staffMembers, defaultStaffHourlyRate]);

  const handleSaveStaffSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'super_admin') {
      alert("Kechirasiz, xodimlar tariflari va bonus stavkalarini o'zgartirish huquqi faqat Super Adminga tegishli!");
      return;
    }

    // 1. Save standard rate
    setDefaultStaffHourlyRate(Number(standardStaffRate) || 20000);

    // 2. Save bonus config
    setStaffBonusConfig({
      enabled: bonusEnabled,
      startTime: bonusStartTime,
      endTime: bonusEndTime,
      bonusHourlyRate: Number(bonusHourlyRate) || 25000,
    });

    // 3. Save individual staff rates
    staffMembers.forEach((m) => {
      const updatedRate = individualStaffRates[m.id];
      if (updatedRate && updatedRate !== m.hourlyRate) {
        updateStaffMember(m.id, { hourlyRate: Number(updatedRate) });
      }
    });

    setStaffSettingsSaved(true);
    setTimeout(() => setStaffSettingsSaved(false), 3500);
  };

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
    const nowTime = formatTime24(new Date());
    const activeS = sessions.filter((s) => s.status === 'active' || s.status === 'overtime');
    const totalInside = activeS.reduce((acc, s) => acc + (s.guestsCount || 0), 0);

    if (cmd === 'status') {
      setBotResponse(
        `🐬 *DELFIN SAUNA — JONLI STATUS* (${nowTime})\n\n👥 Ichkaridagi odamlar: ${totalInside} kishi\n🔥 Faol seanslar soni: ${activeS.length} ta\n🚪 Band saunalar: ${activeS.map((s) => s.roomName).join(', ') || "Hozircha barchasi bo'sh"}\n\n✅ Tizim normal rejimda ishlamoqda.`
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

      {/* Super Admin Exclusive: Xodimlarning Soatbay Ish Haqi va Bonus Sozlamalari */}
      <div className={`p-5 rounded-2xl border shadow-sm space-y-5 transition-all ${
        userRole === 'super_admin'
          ? 'bg-white dark:bg-slate-900 border-purple-500/30 dark:border-purple-500/20 shadow-purple-500/5'
          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                Xodimlar Soatbay Ish Haqi va Bonus Sozlamalari
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Standart stavka, tungi/bonus vaqtlari va xodimlar kesimida individual to'lovlar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'super_admin' ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Faqat Super Admin Huquqi (Ochiq)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shadow-sm">
                <Lock className="w-4 h-4 text-amber-600" />
                Qulflangan (Faqat Super Admin o'zgartira oladi)
              </span>
            )}
          </div>
        </div>

        {userRole !== 'super_admin' && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Diqqat:</strong> Siz hozir <em>Administrator (Kassir)</em> rolidasiz. Xodimlarning soatbay ish haqi stavkalari va bonus vaqtlarini o'zgartirish faqat <strong>Super Admin</strong> tomonidan amalga oshiriladi.
            </span>
          </div>
        )}

        <form onSubmit={handleSaveStaffSettings} className="space-y-6">
          <fieldset disabled={userRole !== 'super_admin'} className="space-y-6">
            {/* 1. Standart Soatlik Ish Haqi va Bonus Oralig'i */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Standart Kunduzgi Stavka */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>Standart Soatlik Ish Haqi (Kunduzgi)</span>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Asosiy stavka miqdori (so'm/soat)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1000"
                      min="5000"
                      value={standardStaffRate}
                      onChange={(e) => setStandardStaffRate(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                      UZS / soat
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    Yangi xodimlar yoki individual stavkasi yo'q ishchilar uchun standart to'lov (hozirda {formatSum(standardStaffRate)} so'm).
                  </p>
                </div>
              </div>

              {/* Bonus / Tungi Stavka Sozlamalari */}
              <div className="lg:col-span-7 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-300">
                    <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Bonus Vaqti va To'lovi (Tungi smena)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bonusEnabled}
                      onChange={(e) => setBonusEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Boshlanish vaqti
                    </label>
                    <input
                      type="time"
                      value={bonusStartTime}
                      onChange={(e) => setBonusStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Masalan: 20:00</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Tugash vaqti
                    </label>
                    <input
                      type="time"
                      value={bonusEndTime}
                      onChange={(e) => setBonusEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Masalan: 06:00</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 block mb-1">
                      Bonus stavkasi
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1000"
                        min="5000"
                        value={bonusHourlyRate}
                        onChange={(e) => setBonusHourlyRate(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded-xl text-xs font-black text-purple-700 dark:text-purple-300 font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-2 text-[10px] text-purple-500 font-bold">
                        UZS/h
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Masalan: 25 000</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-purple-100/60 dark:bg-purple-900/30 text-[11px] text-purple-800 dark:text-purple-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>
                    Qoida: <strong>{bonusStartTime}</strong> dan ertalabki <strong>{bonusEndTime}</strong> gacha ishlangan soatlarga <strong>{formatSum(bonusHourlyRate)} so'm/soat</strong>, qolgan kunduzgi vaqtga esa <strong>{formatSum(standardStaffRate)} so'm/soat</strong> hisoblanadi.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Xodimlar Kesimida Individual Soatlik Stavkalar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-purple-500" />
                  Qaysi Xodimga Soatiga Qanchadan Hisoblanishi (Individual Stavkalar)
                </h3>
                <span className="text-[11px] text-slate-400">
                  Har bir xodimga o'ziga xos soatlik to'lov stavkasi
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {staffMembers.map((member) => {
                  const currentRate = individualStaffRates[member.id] ?? (member.hourlyRate || standardStaffRate);
                  return (
                    <div
                      key={member.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {member.name}
                          </span>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            {member.role.split('/')[0]}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {member.phone}
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                          Soatlik to'lov stavkasi:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <input
                              type="number"
                              step="1000"
                              min="5000"
                              value={currentRate}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setIndividualStaffRates((prev) => ({
                                  ...prev,
                                  [member.id]: val,
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                            <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-mono">
                              so'm
                            </span>
                          </div>

                          {currentRate !== standardStaffRate && (
                            <button
                              type="button"
                              onClick={() => {
                                setIndividualStaffRates((prev) => ({
                                  ...prev,
                                  [member.id]: standardStaffRate,
                                }));
                              }}
                              className="p-1.5 text-[10px] text-slate-400 hover:text-purple-600 rounded"
                              title="Standart stavkaga tenglashtirish"
                            >
                              ↺
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </fieldset>

          {/* Footer Save Button */}
          {userRole === 'super_admin' && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {staffSettingsSaved ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  Xodimlar stavkalari va bonus vaqti muvaffaqiyatli saqlandi!
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  O'zgarishlar barcha keyingi kunlik hisob-kitoblar va vedomostlarga to'liq tatbiq etiladi
                </span>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 active:scale-95 shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Xodimlar Sozlamalarini Saqlash
              </button>
            </div>
          )}
        </form>
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
                  <td className="py-3 px-3 font-mono text-slate-400">{formatTime24(log.time)}</td>
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

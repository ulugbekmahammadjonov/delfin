import React, { useState, useEffect } from 'react';
import { useApp } from '@/app/providers/AppContext';
import { calculateShiftHours, calculateShiftBreakdown, formatSum, getCurrentDateString } from '@/shared/utils/dateUtils';
import {
  X,
  Clock,
  Calendar,
  User,
  Coffee,
  DollarSign,
  Wallet,
  FileText,
  AlertCircle,
  CheckCircle2,
  Moon,
  Sparkles,
} from 'lucide-react';

interface AddShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedEmployeeId?: string;
  preselectedDate?: string;
}

export default function AddShiftModal({
  isOpen,
  onClose,
  preselectedEmployeeId,
  preselectedDate,
}: AddShiftModalProps) {
  const {
    staffMembers,
    defaultStaffHourlyRate,
    staffBonusConfig,
    addStaffShift,
    userRole,
  } = useApp();

  const [employeeId, setEmployeeId] = useState<string>('');
  const [date, setDate] = useState<string>(preselectedDate || getCurrentDateString());
  const [checkInTime, setCheckInTime] = useState<string>('06:00');
  const [checkOutTime, setCheckOutTime] = useState<string>('19:00');
  const [breakHours, setBreakHours] = useState<string>('1.5');
  const [breakReason, setBreakReason] = useState<string>('Uyga borib keldi (shaxsiy ish)');
  const [hourlyRate, setHourlyRate] = useState<number>(20000);
  const [cashAdvance, setCashAdvance] = useState<string>('100000');
  const [syncToCashier, setSyncToCashier] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (staffMembers.length > 0) {
      const selected = preselectedEmployeeId
        ? staffMembers.find((m) => m.id === preselectedEmployeeId) || staffMembers[0]
        : staffMembers[0];
      setEmployeeId(selected.id);
      setHourlyRate(selected.hourlyRate || defaultStaffHourlyRate || 20000);
    }
  }, [staffMembers, preselectedEmployeeId, defaultStaffHourlyRate]);

  useEffect(() => {
    if (preselectedDate) {
      setDate(preselectedDate);
    }
  }, [preselectedDate]);

  if (!isOpen) return null;

  const currentMember = staffMembers.find((m) => m.id === employeeId);

  const handleEmployeeChange = (eId: string) => {
    setEmployeeId(eId);
    const m = staffMembers.find((mem) => mem.id === eId);
    if (m) {
      setHourlyRate(m.hourlyRate || defaultStaffHourlyRate || 20000);
    }
  };

  const parsedBreak = Math.max(0, parseFloat(breakHours) || 0);
  const breakdown = calculateShiftBreakdown(
    checkInTime,
    checkOutTime,
    parsedBreak,
    hourlyRate || 20000,
    staffBonusConfig
  );
  const grossHours = breakdown.grossHours;
  const netHours = breakdown.netHours;
  const earnedAmount = breakdown.totalEarned;
  const advanceAmount = Math.max(0, parseInt(cashAdvance.replace(/\s/g, ''), 10) || 0);
  const remainingBalance = earnedAmount - advanceAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !currentMember) {
      setError('Iltimos, ishchini tanlang!');
      return;
    }
    if (!date) {
      setError('Iltimos, sanani kiriting!');
      return;
    }
    if (!checkInTime || !checkOutTime) {
      setError('Kelish va ketish soatini kiriting!');
      return;
    }
    if (netHours <= 0) {
      setError('Sof ishlangan soat 0 dan katta bo‘lishi kerak!');
      return;
    }

    addStaffShift(
      {
        employeeId: currentMember.id,
        employeeName: currentMember.name,
        date,
        checkInTime,
        checkOutTime,
        breakHours: parsedBreak,
        breakReason: breakReason.trim(),
        hourlyRate,
        cashAdvance: advanceAmount,
        notes: notes.trim(),
        recordedBy: userRole === 'super_admin' ? 'Super Admin' : 'Admin (Kassir)',
      },
      syncToCashier
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Kunlik Smena va Davomat Kiritish
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelish/ketish vaqti, ishdan tashqari holat va kassadan olingan pul
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Ishchi va Sana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-500" />
                  Xodim (Ishchi)
                </span>
              </label>
              <select
                value={employeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {staffMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role}) - {formatSum(m.hourlyRate)} so'm/soat
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  Sana
                </span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Kelish va Ketish soatlari (24-soat) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div>
              <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                🟢 Kelish soati (24h)
              </label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Masalan: 06:00</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1.5">
                🔴 Ketish soati (24h)
              </label>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Masalan: 19:00</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                ⏱ Jami oraliq
              </label>
              <div className="h-[42px] px-3 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                <span>{grossHours} soat</span>
                <span className="text-[10px] font-normal text-slate-400">Oraliq</span>
              </div>
            </div>
          </div>

          {/* Ishdan tashqari holat (Shaxsiy ish bilan chiqib ketish) */}
          <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Coffee className="w-4 h-4" />
              <span>Ishdan tashqari holat (Shaxsiy ishlar, tanaffus)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Yo'q bo'lgan vaqti (soat)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={breakHours}
                  onChange={(e) => setBreakHours(e.target.value)}
                  placeholder="1.5"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Masalan: 1.5 soat</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Ishdan tashqari holat sababi / Izohi
                </label>
                <input
                  type="text"
                  value={breakReason}
                  onChange={(e) => setBreakReason(e.target.value)}
                  placeholder="Masalan: Uyga borib keldi, shaxsiy zarur ish bilan ketdi"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Soatlik stavka va Kassirdan olingan pul */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-sky-500" />
                  Soatlik stavka (so'm/soat)
                </label>
                {userRole === 'super_admin' ? (
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md">
                    Super Admin tahrirlashi mumkin
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Standart 20 000</span>
                )}
              </div>
              <input
                type="number"
                step="1000"
                disabled={userRole !== 'super_admin'}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-80"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                  Kassirdan olingan pul / Avans (so'm)
                </span>
              </label>
              <input
                type="number"
                step="5000"
                min="0"
                value={cashAdvance}
                onChange={(e) => setCashAdvance(e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="checkbox"
                  id="syncCashier"
                  checked={syncToCashier}
                  onChange={(e) => setSyncToCashier(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="syncCashier" className="text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer">
                  Kassa xarajatlariga ham avtomatik kiritilsin
                </label>
              </div>
            </div>
          </div>

          {/* Umumiy Izoh */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Qo'shimcha izoh
              </span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masalan: Maxsus navbatchilik, qozonxona tozalash..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Real-time Calculation Summary Badge */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-purple-500/10 border border-sky-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-500" />
                Avtomatik hisob-kitob natijasi:
              </h4>
              {breakdown.bonusHours > 0 && staffBonusConfig.enabled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <Moon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  Tungi bonus stavka qo'llandi
                </span>
              )}
            </div>

            {breakdown.bonusHours > 0 && staffBonusConfig.enabled && (
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-purple-800 dark:text-purple-200 text-[11px]">
                    ☀️ Kunduzgi soatlar ({breakdown.regularHours} soat × {formatSum(hourlyRate)}):
                  </span>
                  <span className="font-bold text-purple-900 dark:text-purple-100 font-mono">
                    {formatSum(breakdown.regularEarned)} so'm
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-800 dark:text-purple-200 text-[11px] flex items-center gap-1">
                    <Moon className="w-3 h-3 text-purple-500" />
                    Tungi bonus ({staffBonusConfig.startTime} - {staffBonusConfig.endTime}, {breakdown.bonusHours} soat × {formatSum(staffBonusConfig.bonusHourlyRate)}):
                  </span>
                  <span className="font-bold text-purple-900 dark:text-purple-100 font-mono">
                    {formatSum(breakdown.bonusEarned)} so'm
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Sof ish soati</span>
                <span className="text-sm font-black text-sky-600 dark:text-sky-400">{netHours} soat</span>
                <span className="text-[9px] text-slate-400 block">({grossHours} - {parsedBreak})</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Hisoblangan haq</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{formatSum(earnedAmount)} so'm</span>
                <span className="text-[9px] text-slate-400 block">Jami maosh</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Olingan pul (avans)</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">{formatSum(advanceAmount)} so'm</span>
                <span className="text-[9px] text-slate-400 block">Kassadan berildi</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">To'lanadigan qoldiq</span>
                <span className={`text-sm font-black ${remainingBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatSum(remainingBalance)} so'm
                </span>
                <span className="text-[9px] text-slate-400 block">Qo'lga tegishi kerak</span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 active:scale-95 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Smenani Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

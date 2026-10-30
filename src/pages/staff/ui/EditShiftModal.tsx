import React, { useState, useEffect } from 'react';
import { useApp } from '@/app/providers/AppContext';
import { StaffShiftRecord } from '@/shared/types';
import { calculateShiftHours, calculateShiftBreakdown, formatSum } from '@/shared/utils/dateUtils';
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
  Save,
  Moon,
} from 'lucide-react';

interface EditShiftModalProps {
  shift: StaffShiftRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditShiftModal({ shift, isOpen, onClose }: EditShiftModalProps) {
  const { staffMembers, updateStaffShift, userRole, staffBonusConfig } = useApp();

  const [date, setDate] = useState<string>('');
  const [checkInTime, setCheckInTime] = useState<string>('06:00');
  const [checkOutTime, setCheckOutTime] = useState<string>('19:00');
  const [breakHours, setBreakHours] = useState<string>('0');
  const [breakReason, setBreakReason] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<number>(20000);
  const [cashAdvance, setCashAdvance] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (shift) {
      setDate(shift.date);
      setCheckInTime(shift.checkInTime);
      setCheckOutTime(shift.checkOutTime);
      setBreakHours(String(shift.breakHours || 0));
      setBreakReason(shift.breakReason || '');
      setHourlyRate(shift.hourlyRate || 20000);
      setCashAdvance(String(shift.cashAdvance || 0));
      setNotes(shift.notes || '');
      setError('');
    }
  }, [shift]);

  if (!isOpen || !shift) return null;

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
    if (!date) {
      setError('Sanani kiriting!');
      return;
    }
    if (netHours <= 0) {
      setError('Sof ishlangan soat 0 dan katta bo‘lishi kerak!');
      return;
    }

    updateStaffShift(shift.id, {
      date,
      checkInTime,
      checkOutTime,
      breakHours: parsedBreak,
      breakReason: breakReason.trim(),
      hourlyRate,
      cashAdvance: advanceAmount,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Smenani Tahrirlash: {shift.employeeName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ish vaqtlari, shaxsiy ishlar tanaffusi va avans summasini o'zgartirish
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

          {/* Sana va Xodim */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Xodim
              </label>
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200">
                {shift.employeeName}
              </div>
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

          {/* Kelish va Ketish soatlari */}
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                ⏱ Oraliq vaqt
              </label>
              <div className="h-[42px] px-3 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                <span>{grossHours} soat</span>
              </div>
            </div>
          </div>

          {/* Ishdan tashqari holat */}
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
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Sababi / Izohi
                </label>
                <input
                  type="text"
                  value={breakReason}
                  onChange={(e) => setBreakReason(e.target.value)}
                  placeholder="Shaxsiy ish bilan chiqib ketdi..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Soatlik stavka va Avans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-sky-500" />
                  Soatlik stavka (so'm/soat)
                </span>
              </label>
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Qo'shimcha izoh
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Calculation summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            {breakdown.bonusHours > 0 && staffBonusConfig.enabled && (
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
                <span>
                  🌙 Tungi bonus ({staffBonusConfig.startTime}-{staffBonusConfig.endTime}): {breakdown.bonusHours}h × {formatSum(staffBonusConfig.bonusHourlyRate)}
                </span>
                <span className="font-bold font-mono">
                  +{formatSum(breakdown.bonusEarned)} so'm
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Sof ish soati:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">{netHours} soat</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Hisoblangan haq:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{formatSum(earnedAmount)} so'm</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Olingan avans:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{formatSum(advanceAmount)} so'm</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Qoldiq to'lov:</span>
                <span className={`font-bold text-sm ${remainingBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatSum(remainingBalance)} so'm
                </span>
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
            className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:scale-95 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            O'zgarishlarni Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

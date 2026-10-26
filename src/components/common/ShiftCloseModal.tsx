import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, FileText, ArrowRight, Printer } from 'lucide-react';

export default function ShiftCloseModal() {
  const { isShiftModalOpen, setIsShiftModalOpen, sessions, expenses, addLog } = useApp();
  const [shiftNotes, setShiftNotes] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isShiftModalOpen) return null;

  const cashTotal = sessions
    .filter((s) => s.paymentMethod === 'cash' && s.paymentStatus !== 'postpaid')
    .reduce((acc, s) => acc + (s.totalAmount || 0), 2450000);

  const cardTotal = sessions
    .filter((s) => s.paymentMethod === 'card' && s.paymentStatus !== 'postpaid')
    .reduce((acc, s) => acc + (s.totalAmount || 0), 1200000);

  const qrTotal = sessions
    .filter((s) => s.paymentMethod === 'qr' && s.paymentStatus !== 'postpaid')
    .reduce((acc, s) => acc + (s.totalAmount || 0), 650000);

  const totalIncome = cashTotal + cardTotal + qrTotal;
  const totalExpensesSum = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalIncome - totalExpensesSum;

  const handleCloseShift = () => {
    addLog(
      `SMENA YOPILDI: Kassada naqd: ${cashTotal.toLocaleString()} UZS, karta: ${cardTotal.toLocaleString()} UZS, Sof foyda: ${netProfit.toLocaleString()} UZS.`
    );
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Smenani Topshirish (Kun Yakuni Z-Hisobot)
              </h2>
              <p className="text-xs text-slate-500">Kassa va tushumlar balansi</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsShiftModalOpen(false);
              setIsSubmitted(false);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Smena Muvaffaqiyatli Topshirildi!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Barcha hisobot ma'lumotlari Super Admin tizimiga va Telegram Botiga yuborildi.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Z-Hisobotni Chop Etish</span>
              </button>
              <button
                onClick={() => {
                  setIsShiftModalOpen(false);
                  setIsSubmitted(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 shadow-md"
              >
                Tushunarli
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 text-xs space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Joriy administrator:</span>
                <span className="font-bold text-slate-900 dark:text-white">Dilshod A. (Smena #241)</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Ish vaqti:</span>
                <span className="font-mono">Bugun 09:00 - 23:59</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tizim hisoblagan kutilayotgan qoldiqlar:
              </h4>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400">💵 Kassada naqd pul bo'lishi kerak:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {cashTotal.toLocaleString()} UZS
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400">💳 Plastik terminal tushumi:</span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                    {cardTotal.toLocaleString()} UZS
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400">📱 Click / Payme / QR tushumi:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {qrTotal.toLocaleString()} UZS
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <span className="text-rose-500 font-semibold">📉 Kunlik xarajatlar (chiqimlar):</span>
                  <span className="font-mono font-bold text-rose-500 text-sm">
                    -{totalExpensesSum.toLocaleString()} UZS
                  </span>
                </div>
                <div className="pt-2 border-t-2 border-slate-300 dark:border-slate-600 flex justify-between items-center">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    🏆 SOF FOYDA (Sof daromad):
                  </span>
                  <span className="font-mono font-extrabold text-base text-cyan-600 dark:text-cyan-400">
                    {netProfit.toLocaleString()} UZS
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Smena bo'yicha maxsus izoh yoki tafsilotlar:
              </label>
              <textarea
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                placeholder="Kassadagi ortiqcha/kamomad, tozalash holati yoki ertangi kunga qoldirilgan eslatma..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCloseShift}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Smenani Yopish va Tasdiqlash</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

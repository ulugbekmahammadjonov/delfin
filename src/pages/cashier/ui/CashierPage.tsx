import React, { useState } from 'react';
import { useApp } from '@/app/providers/AppContext';
import { formatTime24 } from '@/shared/utils/dateUtils';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Receipt,
  FileSpreadsheet,
  Banknote,
  CreditCard,
  QrCode,
  Sparkles,
} from 'lucide-react';

export default function CashierView() {
  const { t, expenses, addExpense, setIsShiftModalOpen } = useApp();

  const [category, setCategory] = useState<string>('Xodimlar tushligi');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);

  const totalRevenue = 8470000;
  const cashRevenue = 4120000;
  const cardRevenue = 2950000;
  const qrRevenue = 1400000;

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    addExpense({
      category,
      amount: Number(amount),
      note: note.trim(),
    });

    setAmount('');
    setNote('');
    setIsExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-sky-500" />
            {t.cashierTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.cashierSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addExpense}</span>
          </button>
          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-md flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.closeShiftBtn}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Umumiy kassa tushumi:</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono font-black text-2xl text-slate-900 dark:text-white">
            {totalRevenue.toLocaleString()} <span className="text-xs font-medium text-slate-400">UZS</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Bugungi jami savdo</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Bugungi chiqimlar (Xarajatlar):</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono font-black text-2xl text-rose-500">
            -{totalExpenses.toLocaleString()} <span className="text-xs font-medium text-slate-400">UZS</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{expenses.length} ta chiqim qayd etildi</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-sky-700 text-white shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-sky-100">
            <span>SOF FOYDA (Sof daromad):</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="mt-2 font-mono font-black text-2xl">
            {netProfit.toLocaleString()} <span className="text-xs font-medium text-sky-200">UZS</span>
          </div>
          <div className="text-[11px] text-sky-100 mt-1">Tushum - Chiqimlar</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white">
          To'lov Turlari Bo'yicha Kassa Holati
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                <Banknote className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Naqd pul</span>
                <div className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                  {cashRevenue.toLocaleString()} UZS
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">48%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600">
                <CreditCard className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Plastik karta</span>
                <div className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                  {cardRevenue.toLocaleString()} UZS
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">35%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
                <QrCode className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Click / Payme / QR</span>
                <div className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                  {qrRevenue.toLocaleString()} UZS
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">17%</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-rose-500" />
            <span>Bugungi Xarajatlar Tarixi (Chiqimlar)</span>
          </h3>
          <span className="text-xs font-mono font-bold text-rose-500">
            Jami: -{totalExpenses.toLocaleString()} UZS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Vaqt</th>
                <th className="py-2.5 px-3">Xarajat Turi</th>
                <th className="py-2.5 px-3">Izoh va Maqsad</th>
                <th className="py-2.5 px-3">Kiritgan Xodim</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Summasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono text-slate-400">{formatTime24(exp.time)}</td>
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                    {exp.category}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{exp.note}</td>
                  <td className="py-3 px-3 text-slate-500">{exp.author}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-rose-500">
                    -{exp.amount.toLocaleString()} UZS
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
              Kassadan Xarajat (Chiqim) Kiritish
            </h2>

            <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Xarajat kategoriyasi:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Xodimlar tushligi">Xodimlar tushligi</option>
                  <option value="Yuvish va gigiyena">Yuvish va tozalash vositalari</option>
                  <option value="Mayda ta'mirlash">Mayda ta'mirlash va santexnika</option>
                  <option value="Kommunal to'lovlar">Kommunal va elektr to'lovlar</option>
                  <option value="Boshqa chiqimlar">Boshqa xarajatlar</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Summasi (UZS):</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100000"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Izoh (Chiqim sababi):</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Masalan: Dush shlangi va xlor xaridi..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

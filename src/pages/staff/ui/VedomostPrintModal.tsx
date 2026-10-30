import React from 'react';
import { StaffMember, StaffShiftRecord } from '@/shared/types';
import { formatSum, formatDateTime24 } from '@/shared/utils/dateUtils';
import { Printer, X, FileSpreadsheet } from 'lucide-react';

interface VedomostPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string; // e.g. "2026-10"
  staffMembers: StaffMember[];
  staffShifts: StaffShiftRecord[];
  selectedEmployeeId: string; // "all" or specific member ID
}

export default function VedomostPrintModal({
  isOpen,
  onClose,
  selectedMonth,
  staffMembers,
  staffShifts,
  selectedEmployeeId,
}: VedomostPrintModalProps) {
  if (!isOpen) return null;

  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthNames: Record<string, string> = {
    '01': 'Yanvar',
    '02': 'Fevral',
    '03': 'Mart',
    '04': 'Aprel',
    '05': 'May',
    '06': 'Iyun',
    '07': 'Iyul',
    '08': 'Avgust',
    '09': 'Sentyabr',
    '10': 'Oktyabr',
    '11': 'Noyabr',
    '12': 'Dekabr',
  };
  const monthFormatted = `${monthNames[monthStr] || monthStr} ${yearStr}`;

  // Filter shifts by selected month
  const monthlyShifts = staffShifts.filter((s) => s.date.startsWith(selectedMonth));

  // Determine which employees to display
  const targetMembers =
    selectedEmployeeId === 'all'
      ? staffMembers
      : staffMembers.filter((m) => m.id === selectedEmployeeId);

  // Calculate summaries per member
  const memberSummaries = targetMembers.map((member) => {
    const shifts = monthlyShifts.filter((s) => s.employeeId === member.id);
    const totalDays = shifts.length;
    const totalWorkHours = shifts.reduce((acc, s) => acc + (s.totalWorkHours || 0), 0);
    const totalBreakHours = shifts.reduce((acc, s) => acc + (s.breakHours || 0), 0);
    const totalEarned = shifts.reduce((acc, s) => acc + (s.earnedAmount || 0), 0);
    const totalAdvances = shifts.reduce((acc, s) => acc + (s.cashAdvance || 0), 0);
    const finalBalance = totalEarned - totalAdvances;

    return {
      member,
      shifts,
      totalDays,
      totalWorkHours: Math.round(totalWorkHours * 10) / 10,
      totalBreakHours: Math.round(totalBreakHours * 10) / 10,
      totalEarned,
      totalAdvances,
      finalBalance,
    };
  });

  const grandTotalHours = memberSummaries.reduce((acc, s) => acc + s.totalWorkHours, 0);
  const grandTotalEarned = memberSummaries.reduce((acc, s) => acc + s.totalEarned, 0);
  const grandTotalAdvances = memberSummaries.reduce((acc, s) => acc + s.totalAdvances, 0);
  const grandTotalBalance = memberSummaries.reduce((acc, s) => acc + s.finalBalance, 0);

  const handlePrint = () => {
    window.print();
  };

  const isSingleEmployee = selectedEmployeeId !== 'all' && targetMembers.length === 1;
  const singleSummary = isSingleEmployee ? memberSummaries[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none print:h-auto">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Rasmiy Oylik Ish Haqi Vedomosti: {monthFormatted}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Chop Etish (Print)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto print:overflow-visible flex-1 space-y-6 text-slate-900 bg-white">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>«DELFIN SAUNA» MCHJ</span>
              <span>Hujjat sanasi: {formatDateTime24(new Date())}</span>
            </div>
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
              XODIMLARNING SOATBAY ISH HAQI VA DAVOMAT VEDOMOSTI
            </h1>
            <p className="text-sm font-semibold text-slate-700">
              Hisobot davri: <span className="underline">{monthFormatted}</span>
              {isSingleEmployee && ` | Xodim: ${singleSummary?.member.name} (${singleSummary?.member.role})`}
            </p>
          </div>

          {/* If Single Employee: Show Day-by-Day Detailed Log + Summary */}
          {isSingleEmployee && singleSummary && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Xodim:</span>
                  <span className="font-bold text-sm text-slate-800">{singleSummary.member.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Lavozimi:</span>
                  <span className="font-bold text-slate-700">{singleSummary.member.role}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Soatlik stavka:</span>
                  <span className="font-bold text-slate-700">{formatSum(singleSummary.member.hourlyRate)} so'm/soat</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Ishlagan kunlari:</span>
                  <span className="font-bold text-sky-700 text-sm">{singleSummary.totalDays} kun</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Kunlik Ish Vaqtlari, Tanaffuslar va Berilgan Avanslar
                </h4>
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="py-2 px-3 border-r border-slate-300 w-10">№</th>
                        <th className="py-2 px-3 border-r border-slate-300">Sana</th>
                        <th className="py-2 px-3 border-r border-slate-300">Kelgan</th>
                        <th className="py-2 px-3 border-r border-slate-300">Ketgan</th>
                        <th className="py-2 px-3 border-r border-slate-300">Ishdan tashqari holat</th>
                        <th className="py-2 px-3 border-r border-slate-300 text-right">Sof soat</th>
                        <th className="py-2 px-3 border-r border-slate-300 text-right">Kunlik haq</th>
                        <th className="py-2 px-3 border-r border-slate-300 text-right">Olingan pul</th>
                        <th className="py-2 px-3 text-right">Qoldiq</th>
                      </tr>
                    </thead>
                    <tbody>
                      {singleSummary.shifts.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-6 text-center text-slate-400">
                            Ushbu oy uchun hali hech qanday smena kiritilmagan.
                          </td>
                        </tr>
                      ) : (
                        singleSummary.shifts.map((s, idx) => (
                          <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                            <td className="py-2 px-3 border-r border-slate-200 text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3 border-r border-slate-200 font-semibold">{s.date}</td>
                            <td className="py-2 px-3 border-r border-slate-200 font-mono text-emerald-700">{s.checkInTime}</td>
                            <td className="py-2 px-3 border-r border-slate-200 font-mono text-rose-700">{s.checkOutTime}</td>
                            <td className="py-2 px-3 border-r border-slate-200 text-slate-600">
                              {s.breakHours > 0 ? (
                                <span>
                                  {s.breakHours}h{' '}
                                  <span className="text-[10px] text-slate-400">({s.breakReason || 'Shaxsiy ish'})</span>
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-right font-bold text-sky-700">
                              {s.totalWorkHours}h
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-right font-semibold">
                              {formatSum(s.earnedAmount)}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-right text-amber-700 font-semibold">
                              {formatSum(s.cashAdvance)}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">
                              {formatSum(s.balance)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                      <tr>
                        <td colSpan={5} className="py-2 px-3 border-r border-slate-300 text-right">
                          JAMI:
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-right text-sky-800">
                          {singleSummary.totalWorkHours} soat
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-right">
                          {formatSum(singleSummary.totalEarned)} so'm
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-right text-amber-800">
                          {formatSum(singleSummary.totalAdvances)} so'm
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-800 font-black">
                          {formatSum(singleSummary.finalBalance)} so'm
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Multi-employee Summary Table */}
          {!isSingleEmployee && (
            <div>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <th className="py-2 px-3 border-r border-slate-300 w-10">№</th>
                      <th className="py-2 px-3 border-r border-slate-300">Xodim (F.I.O)</th>
                      <th className="py-2 px-3 border-r border-slate-300">Lavozimi</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-right">Stavka</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center">Kunlar</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-right">Sof soat</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-right">Hisoblangan haq</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-right">Olingan pullar</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-right">Qo'lga tegishi kerak</th>
                      <th className="py-2 px-3 text-center w-28">Imzo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberSummaries.map((item, idx) => (
                      <tr key={item.member.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 border-r border-slate-200 text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900">
                          {item.member.name}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600">{item.member.role}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono">
                          {formatSum(item.member.hourlyRate)}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold">
                          {item.totalDays}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-sky-800">
                          {item.totalWorkHours} h
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right font-semibold">
                          {formatSum(item.totalEarned)}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right text-amber-800 font-semibold">
                          {formatSum(item.totalAdvances)}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-slate-900">
                          {formatSum(item.finalBalance)}
                        </td>
                        <td className="py-2.5 px-3 text-center border-slate-200">
                          <span className="text-[10px] text-slate-300 block">________________</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
                    <tr>
                      <td colSpan={5} className="py-2.5 px-3 border-r border-slate-300 text-right">
                        UMUMIY JAMI:
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-300 text-right text-sky-800">
                        {Math.round(grandTotalHours * 10) / 10} h
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-300 text-right">
                        {formatSum(grandTotalEarned)} so'm
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-300 text-right text-amber-800">
                        {formatSum(grandTotalAdvances)} so'm
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-300 text-right text-emerald-800">
                        {formatSum(grandTotalBalance)} so'm
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* KPI Summary Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Jami ish soatlari:</span>
              <span className="font-black text-base text-sky-700">
                {Math.round(grandTotalHours * 10) / 10} soat
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Jami hisoblangan ish haqi:</span>
              <span className="font-black text-base text-slate-900">
                {formatSum(grandTotalEarned)} so'm
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Jami olingan avanslar:</span>
              <span className="font-black text-base text-amber-700">
                {formatSum(grandTotalAdvances)} so'm
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">To'lanishi lozim bo'lgan qoldiq:</span>
              <span className="font-black text-base text-emerald-700">
                {formatSum(grandTotalBalance)} so'm
              </span>
            </div>
          </div>

          {/* Signatures Section */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-xs text-slate-700">
            <div>
              <p className="font-bold mb-6">Boshqaruvchi (Rahbar):</p>
              <div className="border-b border-slate-400 w-full mb-1"></div>
              <p className="text-[10px] text-slate-400">Imzo va sana</p>
            </div>
            <div>
              <p className="font-bold mb-6">Kassir / Administrator:</p>
              <div className="border-b border-slate-400 w-full mb-1"></div>
              <p className="text-[10px] text-slate-400">Imzo va sana</p>
            </div>
            <div>
              <p className="font-bold mb-6">Xodim:</p>
              <div className="border-b border-slate-400 w-full mb-1"></div>
              <p className="text-[10px] text-slate-400">Imzo va sana</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

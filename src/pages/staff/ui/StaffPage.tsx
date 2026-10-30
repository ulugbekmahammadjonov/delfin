import React, { useState } from 'react';
import { useApp } from '@/app/providers/AppContext';
import { StaffMember, StaffShiftRecord } from '@/shared/types';
import {
  formatSum,
  getCurrentDateString,
  getCurrentMonthString,
} from '@/shared/utils/dateUtils';
import AddShiftModal from './AddShiftModal';
import EditShiftModal from './EditShiftModal';
import AddStaffModal from './AddStaffModal';
import VedomostPrintModal from './VedomostPrintModal';
import {
  UserCheck,
  Clock,
  Calendar,
  DollarSign,
  Wallet,
  Plus,
  Printer,
  Search,
  Filter,
  Pencil,
  Trash2,
  Users,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Moon,
} from 'lucide-react';

export default function StaffPage() {
  const {
    t,
    userRole,
    staffMembers,
    staffShifts,
    deleteStaffShift,
    deleteStaffMember,
    defaultStaffHourlyRate,
    setDefaultStaffHourlyRate,
    staffBonusConfig,
    setCurrentTab,
  } = useApp();

  // Active view tab: 'vedomost' | 'shifts' | 'staff'
  const [activeTab, setActiveTab] = useState<'vedomost' | 'shifts' | 'staff'>('vedomost');

  // Month filter for Vedomost (e.g. "2026-10")
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');

  // Daily shifts filters
  const [shiftDateFilter, setShiftDateFilter] = useState<string>(''); // empty means all or specific date
  const [shiftEmployeeFilter, setShiftEmployeeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Rate edit state for Super Admin
  const [tempRate, setTempRate] = useState<string>(String(defaultStaffHourlyRate || 20000));
  const [rateSavedNotice, setRateSavedNotice] = useState<boolean>(false);

  // Modals state
  const [isAddShiftOpen, setIsAddShiftOpen] = useState<boolean>(false);
  const [isEditShiftOpen, setIsEditShiftOpen] = useState<boolean>(false);
  const [shiftToEdit, setShiftToEdit] = useState<StaffShiftRecord | null>(null);

  const [isAddStaffOpen, setIsAddStaffOpen] = useState<boolean>(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printMemberId, setPrintMemberId] = useState<string>('all');

  // Filter shifts by selected month
  const monthlyShifts = staffShifts.filter((s) => s.date.startsWith(selectedMonth));

  // Today's stats
  const todayStr = getCurrentDateString();
  const todayShifts = staffShifts.filter((s) => s.date === todayStr);
  const todayHours = todayShifts.reduce((acc, s) => acc + (s.totalWorkHours || 0), 0);
  const todayEarned = todayShifts.reduce((acc, s) => acc + (s.earnedAmount || 0), 0);
  const todayAdvances = todayShifts.reduce((acc, s) => acc + (s.cashAdvance || 0), 0);

  // Monthly stats
  const monthlyHours = monthlyShifts.reduce((acc, s) => acc + (s.totalWorkHours || 0), 0);
  const monthlyEarned = monthlyShifts.reduce((acc, s) => acc + (s.earnedAmount || 0), 0);
  const monthlyAdvances = monthlyShifts.reduce((acc, s) => acc + (s.cashAdvance || 0), 0);
  const monthlyBalance = monthlyEarned - monthlyAdvances;

  // Filtered shifts for "Kunlik smena va Davomat" tab
  const filteredDailyShifts = staffShifts.filter((shift) => {
    if (shiftDateFilter && shift.date !== shiftDateFilter) return false;
    if (shiftEmployeeFilter !== 'all' && shift.employeeId !== shiftEmployeeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = shift.employeeName.toLowerCase().includes(q);
      const matchReason = shift.breakReason?.toLowerCase().includes(q);
      const matchNotes = shift.notes?.toLowerCase().includes(q);
      if (!matchName && !matchReason && !matchNotes) return false;
    }
    return true;
  });

  // Save standard rate
  const handleSaveStandardRate = (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = parseInt(tempRate.replace(/\s/g, ''), 10);
    if (!isNaN(rateNum) && rateNum > 0) {
      setDefaultStaffHourlyRate(rateNum);
      setRateSavedNotice(true);
      setTimeout(() => setRateSavedNotice(false), 3000);
    }
  };

  const handleOpenPrint = (empId: string = 'all') => {
    setPrintMemberId(empId);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-sky-500" />
            {t.staffTitle || 'Xodimlar va Soatbay Ish Haqi'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.staffSubtitle || 'Kunlik davomat, ishdan tashqari tanaffuslar, kassadan olingan avanslar va oylik vedomost'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenPrint('all')}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-sky-500" />
            Vedomostni Chop Etish
          </button>

          <button
            onClick={() => {
              setStaffToEdit(null);
              setIsAddStaffOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-purple-500" />
            + Yangi Xodim
          </button>

          <button
            onClick={() => setIsAddShiftOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 active:scale-95 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Smena Kiritish
          </button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Faol Xodimlar</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100">
            {staffMembers.filter((m) => m.status === 'active').length}{' '}
            <span className="text-xs font-semibold text-slate-400">kishi</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Saunada ishlovchilar</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Bugungi Sof Soat</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-black text-sky-600 dark:text-sky-400">
            {Math.round(todayHours * 10) / 10}{' '}
            <span className="text-xs font-semibold text-slate-400">soat</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {todayShifts.length} ta navbatchilik smenasi
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Oylik Ish Haqi</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            {formatSum(monthlyEarned)}{' '}
            <span className="text-xs font-semibold text-slate-400">so'm</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Jami {Math.round(monthlyHours * 10) / 10} soat hisobiga
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Berilgan Avanslar</span>
            <Wallet className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">
            {formatSum(monthlyAdvances)}{' '}
            <span className="text-xs font-semibold text-slate-400">so'm</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Kassadan olingan pullar</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>To'lanadigan Qoldiq</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-xl font-black ${monthlyBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatSum(monthlyBalance)}{' '}
            <span className="text-xs font-semibold text-slate-400">so'm</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Oy oxirida qo'lga tegadigan</span>
        </div>
      </div>

      {/* Main Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('vedomost')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'vedomost'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Oylik Vedomost (Hisob-kitob)
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'shifts'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Kunlik Smena va Davomat ({staffShifts.length})
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'staff'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Xodimlar Ro'yxati & Stavka
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OYLIK VEDOMOST (PAYROLL SHEET)                     */}
      {/* ========================================================= */}
      {activeTab === 'vedomost' && (
        <div className="space-y-4">
          {/* Filters Bar for Vedomost */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Hisobot Oyi
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Xodim bo'yicha filter
                </label>
                <select
                  value={selectedEmployeeFilter}
                  onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">Barcha xodimlar</option>
                  {staffMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenPrint(selectedEmployeeFilter)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" />
                Vedomostni Ko'rish / Chop Etish
              </button>
            </div>
          </div>

          {/* Vedomost Cards by Employee */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(selectedEmployeeFilter === 'all'
              ? staffMembers
              : staffMembers.filter((m) => m.id === selectedEmployeeFilter)
            ).map((member) => {
              const mShifts = monthlyShifts.filter((s) => s.employeeId === member.id);
              const mHours = mShifts.reduce((acc, s) => acc + (s.totalWorkHours || 0), 0);
              const mEarned = mShifts.reduce((acc, s) => acc + (s.earnedAmount || 0), 0);
              const mAdvances = mShifts.reduce((acc, s) => acc + (s.cashAdvance || 0), 0);
              const mBalance = mEarned - mAdvances;

              return (
                <div
                  key={member.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-sky-500/50 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        {member.role}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        {formatSum(member.hourlyRate)} so'm/h
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white mb-0.5">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">{member.phone}</p>

                    <div className="space-y-2 py-2 border-t border-b border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Ishlagan kunlari:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {mShifts.length} kun
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Jami sof soati:</span>
                        <span className="font-bold text-sky-600 dark:text-sky-400">
                          {Math.round(mHours * 10) / 10} soat
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Hisoblangan haq:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {formatSum(mEarned)} so'm
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Kassadan olingan (avans):</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {formatSum(mAdvances)} so'm
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Qo'lga tegishi kerak:
                      </span>
                      <span
                        className={`text-base font-black ${
                          mBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatSum(mBalance)} so'm
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPrint(member.id)}
                        className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-sky-500" />
                        Chop Etish
                      </button>
                      <button
                        onClick={() => {
                          setShiftEmployeeFilter(member.id);
                          setActiveTab('shifts');
                        }}
                        className="p-1.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 rounded-xl"
                        title="Kunbay smenalarini ko'rish"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Master Vedomost Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-sky-500" />
                Oylik Yig'ma Vedomost Jadvali ({selectedMonth})
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Jami {staffMembers.length} ta xodim
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Xodim</th>
                    <th className="py-3 px-4">Lavozimi</th>
                    <th className="py-3 px-4 text-right">Stavka</th>
                    <th className="py-3 px-4 text-center">Ishlagan kunlar</th>
                    <th className="py-3 px-4 text-right">Sof ish soati</th>
                    <th className="py-3 px-4 text-right">Hisoblangan haq</th>
                    <th className="py-3 px-4 text-right">Olingan pul (avans)</th>
                    <th className="py-3 px-4 text-right">To'lanadigan qoldiq</th>
                    <th className="py-3 px-4 text-center">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {staffMembers.map((member) => {
                    const mShifts = monthlyShifts.filter((s) => s.employeeId === member.id);
                    const mHours = mShifts.reduce((acc, s) => acc + (s.totalWorkHours || 0), 0);
                    const mEarned = mShifts.reduce((acc, s) => acc + (s.earnedAmount || 0), 0);
                    const mAdvances = mShifts.reduce((acc, s) => acc + (s.cashAdvance || 0), 0);
                    const mBalance = mEarned - mAdvances;

                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-100">
                            {member.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{member.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {member.role}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                          {formatSum(member.hourlyRate)} so'm
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                            {mShifts.length} kun
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-sky-600 dark:text-sky-400">
                          {Math.round(mHours * 10) / 10} soat
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                          {formatSum(mEarned)} so'm
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-amber-600 dark:text-amber-400">
                          {formatSum(mAdvances)} so'm
                        </td>
                        <td className="py-3 px-4 text-right font-black">
                          <span
                            className={
                              mBalance >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }
                          >
                            {formatSum(mBalance)} so'm
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleOpenPrint(member.id)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Xodim vedomostini chop etish"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right uppercase text-[11px]">
                      Umumiy Jami:
                    </td>
                    <td className="py-3 px-4 text-right text-sky-600 dark:text-sky-400">
                      {Math.round(monthlyHours * 10) / 10} soat
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      {formatSum(monthlyEarned)} so'm
                    </td>
                    <td className="py-3 px-4 text-right text-amber-600 dark:text-amber-400 font-bold">
                      {formatSum(monthlyAdvances)} so'm
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-black">
                      {formatSum(monthlyBalance)} so'm
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: KUNLIK SMENA VA DAVOMAT                            */}
      {/* ========================================================= */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          {/* Filters Bar for Daily Shifts */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Xodim ismi, sababi yoki izoh bo'yicha qidirish..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Date Filter */}
              <div>
                <input
                  type="date"
                  value={shiftDateFilter}
                  onChange={(e) => setShiftDateFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {shiftDateFilter && (
                <button
                  onClick={() => setShiftDateFilter('')}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Sanani tozalash
                </button>
              )}

              {/* Employee Filter */}
              <div>
                <select
                  value={shiftEmployeeFilter}
                  onChange={(e) => setShiftEmployeeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">Barcha xodimlar</option>
                  {staffMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                onClick={() => setIsAddShiftOpen(true)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                + Yangi Smena Kiritish
              </button>
            </div>
          </div>

          {/* Shifts Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-500" />
                Kunlik Smenalar Tarixi ({filteredDailyShifts.length})
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {shiftDateFilter ? `Tanlangan sana: ${shiftDateFilter}` : 'Barcha kunlar'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Sana & Xodim</th>
                    <th className="py-3 px-4">Kelish / Ketish (24h)</th>
                    <th className="py-3 px-4">Ishdan tashqari holat</th>
                    <th className="py-3 px-4 text-right">Sof ish soati</th>
                    <th className="py-3 px-4 text-right">Stavka</th>
                    <th className="py-3 px-4 text-right">Kunlik haq</th>
                    <th className="py-3 px-4 text-right">Olingan pul (avans)</th>
                    <th className="py-3 px-4 text-right">Qoldiq</th>
                    <th className="py-3 px-4">Izoh</th>
                    <th className="py-3 px-4 text-center">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDailyShifts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        Hech qanday smena yozuvi topilmadi.
                      </td>
                    </tr>
                  ) : (
                    filteredDailyShifts.map((shift) => (
                      <tr
                        key={shift.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {shift.employeeName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-sky-500" />
                            {shift.date}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {shift.checkInTime}
                            </span>
                            <span className="text-slate-400">—</span>
                            <span className="text-rose-600 dark:text-rose-400">
                              {shift.checkOutTime}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Oraliq vaqt
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {shift.breakHours > 0 ? (
                            <div className="inline-flex flex-col">
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[11px] inline-flex items-center gap-1">
                                <Coffee className="w-3 h-3" />
                                {shift.breakHours} soat
                              </span>
                              {shift.breakReason && (
                                <span className="text-[10px] text-slate-400 mt-0.5 max-w-[140px] truncate">
                                  {shift.breakReason}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">To'liq ishladi</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                            {shift.totalWorkHours}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">soat</span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                          {formatSum(shift.hourlyRate)}
                        </td>

                        <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-100">
                          {formatSum(shift.earnedAmount)} so'm
                        </td>

                        <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                          {shift.cashAdvance > 0 ? `${formatSum(shift.cashAdvance)} so'm` : '—'}
                        </td>

                        <td className="py-3 px-4 text-right font-black">
                          <span
                            className={
                              shift.balance >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }
                          >
                            {formatSum(shift.balance)} so'm
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[160px] truncate">
                          {shift.notes || '—'}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setShiftToEdit(shift);
                                setIsEditShiftOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Tahrirlash"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `${shift.employeeName} ning ${shift.date} kungi smenasini o'chirmoqchimisiz?`
                                  )
                                ) {
                                  deleteStaffShift(shift.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: XODIMLAR RO'YXATI VA STAVKA SOZLAMALARI             */}
      {/* ========================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Global Rate Config (For Super Admin) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-sky-500/10 to-indigo-500/10 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Standart Soatbay Ish Haqi Stavkasi
                </h3>
                {userRole === 'super_admin' ? (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold text-[10px]">
                    Super Admin boshqaruvi
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold text-[10px]">
                    Faqat o'qish rejimi
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                Yangi smena kiritilayotganda avtomatik hisoblanadigan stavka summasi (hozirda soatiga{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {formatSum(defaultStaffHourlyRate)} so'm
                </strong>
                ).
              </p>
            </div>

            <form
              onSubmit={handleSaveStandardRate}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              <div className="relative">
                <input
                  type="number"
                  step="1000"
                  min="5000"
                  disabled={userRole !== 'super_admin'}
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="w-36 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-75"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  so'm
                </span>
              </div>

              {userRole === 'super_admin' && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Stavkani Saqlash
                </button>
              )}
            </form>
          </div>

          {rateSavedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Standart soatbay stavka muvaffaqiyatli saqlandi!</span>
            </div>
          )}

          {/* Tungi Bonus Stavka Ma'lumoti va Sozlamalarga O'tish */}
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Tungi Bonus Stavka: {staffBonusConfig?.startTime || '20:00'} dan {staffBonusConfig?.endTime || '06:00'} gacha {formatSum(staffBonusConfig?.bonusHourlyRate || 25000)} so'm/soat
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {staffBonusConfig?.enabled
                    ? "Faol: belgilangan soatlarda tizim avtomatik bonus stavkani qo'llaydi"
                    : 'Nofaol'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('settings')}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto transition-all shadow-sm active:scale-95"
            >
              <Settings className="w-3.5 h-3.5" />
              Sozlamalardan Boshqarish (Super Admin)
            </button>
          </div>

          {/* Staff Members List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {staffMembers.map((member) => (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-base">
                      {member.name.charAt(0)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        member.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {member.status === 'active' ? 'Faol ishchi' : 'Nofaol'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-0.5">
                    {member.name}
                  </h3>
                  <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mb-2">
                    {member.role}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{member.phone}</p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Soatlik stavkasi:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {formatSum(member.hourlyRate)} so'm/h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Ishga kirgan:</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {member.hireDate || '—'}
                      </span>
                    </div>
                  </div>

                  {member.notes && (
                    <p className="text-[11px] text-slate-400 italic mb-3">"{member.notes}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setStaffToEdit(member);
                      setIsAddStaffOpen(true);
                    }}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-amber-500" />
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Rostdan ham «${member.name}» xodimini tizimdan o'chirmoqchimisiz?`
                        )
                      ) {
                        deleteStaffMember(member.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="Xodimni o'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddShiftModal
        isOpen={isAddShiftOpen}
        onClose={() => setIsAddShiftOpen(false)}
        preselectedDate={shiftDateFilter || todayStr}
        preselectedEmployeeId={shiftEmployeeFilter !== 'all' ? shiftEmployeeFilter : undefined}
      />

      <EditShiftModal
        isOpen={isEditShiftOpen}
        shift={shiftToEdit}
        onClose={() => {
          setIsEditShiftOpen(false);
          setShiftToEdit(null);
        }}
      />

      <AddStaffModal
        isOpen={isAddStaffOpen}
        staffToEdit={staffToEdit}
        onClose={() => {
          setIsAddStaffOpen(false);
          setStaffToEdit(null);
        }}
      />

      <VedomostPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        selectedMonth={selectedMonth}
        staffMembers={staffMembers}
        staffShifts={staffShifts}
        selectedEmployeeId={printMemberId}
      />
    </div>
  );
}

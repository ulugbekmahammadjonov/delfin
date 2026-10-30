import React, { useState, useEffect } from 'react';
import { useApp } from '@/app/providers/AppContext';
import { StaffMember } from '@/shared/types';
import { formatSum } from '@/shared/utils/dateUtils';
import {
  X,
  User,
  Briefcase,
  Phone,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffToEdit?: StaffMember | null;
}

export default function AddStaffModal({ isOpen, onClose, staffToEdit }: AddStaffModalProps) {
  const { addStaffMember, updateStaffMember, defaultStaffHourlyRate } = useApp();

  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('Sauna operatori / Texnik');
  const [phone, setPhone] = useState<string>('+998 ');
  const [hourlyRate, setHourlyRate] = useState<number>(20000);
  const [hireDate, setHireDate] = useState<string>('2026-10-01');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState<string>('');

  const commonRoles = [
    'Sauna operatori / Texnik',
    'Farrosh / Tozalovchi',
    'Massajchi / Bannik',
    'Oshpaz / Choyxona',
    'Administrator yordamchisi',
    'Qorovul / Nazoratchi',
  ];

  useEffect(() => {
    if (staffToEdit) {
      setName(staffToEdit.name);
      setRole(staffToEdit.role);
      setPhone(staffToEdit.phone);
      setHourlyRate(staffToEdit.hourlyRate || defaultStaffHourlyRate || 20000);
      setHireDate(staffToEdit.hireDate || '2026-10-01');
      setNotes(staffToEdit.notes || '');
      setStatus(staffToEdit.status || 'active');
    } else {
      setName('');
      setRole('Sauna operatori / Texnik');
      setPhone('+998 ');
      setHourlyRate(defaultStaffHourlyRate || 20000);
      setHireDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      setStatus('active');
    }
    setError('');
  }, [staffToEdit, defaultStaffHourlyRate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Iltimos, xodim ismini kiriting!');
      return;
    }

    if (staffToEdit) {
      updateStaffMember(staffToEdit.id, {
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim(),
        hourlyRate: Number(hourlyRate) || 20000,
        hireDate,
        notes: notes.trim(),
        status,
      });
    } else {
      addStaffMember({
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim(),
        hourlyRate: Number(hourlyRate) || 20000,
        hireDate,
        notes: notes.trim(),
        status,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {staffToEdit ? "Xodim Ma'lumotlarini Tahrirlash" : "Yangi Xodim Qo'shish"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ism, lavozim, soatbay stavka va aloqa ma'lumotlari
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Xodimning to'liq ismi (F.I.O) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Sardor Rahimov"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                  Lavozimi
                </span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {commonRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-500" />
                  Telefon raqami
                </span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  Soatlik stavkasi (so'm)
                </span>
              </label>
              <input
                type="number"
                step="1000"
                min="5000"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standart: {formatSum(defaultStaffHourlyRate)} so'm/soat
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  Ishga qabul sanasi
                </span>
              </label>
              <input
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Qo'shimcha eslatma / Manzili
              </span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masalan: 1-smena mas'uli, qozonxona bo'yicha usta..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {staffToEdit ? "O'zgarishlarni Saqlash" : "Xodimni Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

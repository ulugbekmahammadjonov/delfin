import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, Session, PaymentStatus, PaymentMethod, SessionType } from '../../types';
import {
  Timer,
  Phone,
  Users,
  AlertTriangle,
  Calendar,
  Plus,
  Minus,
  ShoppingBag,
  Printer,
  Search,
  BellRing,
  Zap,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react';

export default function RegistrationView() {
  const {
    t,
    tariffs,
    rooms,
    sessions,
    currentTime,
    addSession,
    extendSessionTime,
    finishSession,
    startBookingSession,
    cancelBooking,
    findClientByPhone,
    setActiveReceiptSession,
    setActiveBarOrderSession,
  } = useApp();

  const [phone, setPhone] = useState<string>('+998 ');
  const [clientName, setClientName] = useState<string>('');
  const [matchedClient, setMatchedClient] = useState<Client | null>(null);
  const [guestsCount, setGuestsCount] = useState<number>(4);
  const [acceptMaxGuestsException, setAcceptMaxGuestsException] = useState<boolean>(false);
  const [visitType, setVisitType] = useState<SessionType>('instant');
  const [bookingDate, setBookingDate] = useState<string>('Bugun');
  const [bookingTime, setBookingTime] = useState<string>('14:30');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [durationOption, setDurationOption] = useState<string>('1.5');
  const [customHours, setCustomHours] = useState<string>('3');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('full');
  const [depositAmount, setDepositAmount] = useState<string>('100000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState<string>('');

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (!selectedRoomId && rooms.length > 0) {
      const freeRoom = rooms.find((r) => r.status === 'free') || rooms[0];
      setSelectedRoomId(freeRoom.id);
    }
  }, [rooms, selectedRoomId]);

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    const clean = val.replace(/\D/g, '');
    if (clean.length >= 7) {
      const found = findClientByPhone(val);
      if (found) {
        setMatchedClient(found);
        setClientName(found.name);
      } else {
        setMatchedClient(null);
      }
    } else {
      setMatchedClient(null);
    }
  };

  const effectiveHours =
    durationOption === 'vip'
      ? 3
      : durationOption === 'custom'
      ? parseFloat(customHours) || 1
      : parseFloat(durationOption);

  const baseTariffPrice =
    durationOption === '1'
      ? tariffs.hour1
      : durationOption === '1.5'
      ? tariffs.hour1_5
      : durationOption === '2'
      ? tariffs.hour2
      : durationOption === 'vip'
      ? tariffs.vip
      : Math.round(tariffs.hour1 * effectiveHours);

  const extraGuests = Math.max(0, guestsCount - tariffs.includedGuestsStandard);
  const extraGuestPrice = extraGuests * tariffs.extraPersonPerHour * Math.ceil(effectiveHours);

  const calculatedTotal = Math.max(0, baseTariffPrice + extraGuestPrice - Number(discountAmount || 0));
  const finalPrice = customPrice !== '' ? Number(customPrice) : calculatedTotal;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert("Iltimos, mijoz ismini kiriting!");
      return;
    }

    if (guestsCount > 7 && !acceptMaxGuestsException) {
      alert("Xonada 7 kishidan ortiq me'yordan ortiq! Iltimos, istisno tasdig'ini belgilang.");
      return;
    }

    const room = rooms.find((r) => r.id === selectedRoomId);

    addSession({
      clientName: clientName.trim(),
      phone: phone.trim(),
      guestsCount: Number(guestsCount),
      roomId: selectedRoomId,
      roomName: room ? room.name : 'Standart Xona',
      type: visitType,
      durationHours: effectiveHours,
      baseAmount: baseTariffPrice,
      extraAmount: extraGuestPrice,
      totalAmount: finalPrice,
      paymentStatus: paymentStatus,
      depositAmount: paymentStatus === 'deposit' ? Number(depositAmount) : 0,
      paymentMethod: paymentMethod,
      notes: notes.trim(),
      bookingDate: visitType === 'booking' ? bookingDate : null,
      bookingTime: visitType === 'booking' ? bookingTime : null,
    });

    setPhone('+998 ');
    setClientName('');
    setMatchedClient(null);
    setNotes('');
    setCustomPrice('');
    setDiscountAmount(0);
  };

  const getTimerDetails = (session: Session) => {
    if (session.status === 'completed') {
      return { label: 'Yakunlangan', statusClass: 'text-slate-400', isOvertime: false, isWarning: false };
    }

    if (session.status === 'booking') {
      return {
        label: `${session.bookingDate} ${session.bookingTime}`,
        statusClass: 'text-sky-500 font-bold',
        isBooking: true,
        isOvertime: false,
        isWarning: false,
      };
    }

    const endMs = session.endTime ? new Date(session.endTime).getTime() : Date.now();
    const diffMs = endMs - currentTime;

    if (diffMs <= 0) {
      const overSec = Math.abs(Math.floor(diffMs / 1000));
      const m = Math.floor(overSec / 60);
      const s = overSec % 60;
      return {
        label: `+${m} daq ${s < 10 ? '0' : ''}${s} sek o'tdi`,
        statusClass: 'text-rose-600 dark:text-rose-400 font-black animate-pulse',
        isOvertime: true,
        minutesOver: m,
        isWarning: false,
      };
    } else {
      const remSec = Math.floor(diffMs / 1000);
      const h = Math.floor(remSec / 3600);
      const m = Math.floor((remSec % 3600) / 60);
      const s = remSec % 60;
      const formatted = `${h > 0 ? `${h}:` : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      const isWarning = remSec <= 600;

      return {
        label: `${formatted} qoldi`,
        statusClass: isWarning
          ? 'text-amber-500 dark:text-amber-400 font-extrabold animate-pulse'
          : 'text-emerald-600 dark:text-emerald-400 font-bold',
        isWarning,
        isOvertime: false,
      };
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchSearch =
      s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      s.roomName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'active') return s.status === 'active';
    if (activeTab === 'overtime') return s.status === 'overtime';
    if (activeTab === 'booking') return s.status === 'booking';
    if (activeTab === 'completed') return s.status === 'completed';
    return true;
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const order: Record<string, number> = { overtime: 0, active: 1, booking: 2, completed: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });

  const countAll = sessions.length;
  const countActive = sessions.filter((s) => s.status === 'active').length;
  const countOvertime = sessions.filter((s) => s.status === 'overtime').length;
  const countBooking = sessions.filter((s) => s.status === 'booking').length;
  const countCompleted = sessions.filter((s) => s.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Timer className="w-6 h-6 text-sky-500" />
            {t.regTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.regSubtitle} — jonli taymerlar, ogohlantirishlar va qabul boshqaruvi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                ⚡
              </span>
              <h2 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white">
                Tezkor Qabul Formasi
              </h2>
            </div>
            <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
              ~ 15 soniya
            </span>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-500" />
                  {t.searchClientPhone}
                </label>
                {matchedClient && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                    ✓ {t.clientFound}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+998 90 123 45 67"
                required
                className="w-full px-3 py-2.5 rounded-xl font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              {matchedClient && (
                <div className="mt-2 animate-in fade-in duration-200">
                  {matchedClient.isBlacklisted ? (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-500 text-rose-800 dark:text-rose-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-rose-600 dark:text-rose-400">
                        <ShieldAlert className="w-4 h-4 animate-bounce-subtle" />
                        <span>{t.blacklistAlert}</span>
                      </div>
                      <p className="text-[11px] font-medium leading-relaxed">
                        {t.blacklistReason}: {matchedClient.blacklistReason}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{matchedClient.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-200 dark:bg-sky-800 text-sky-800 dark:text-sky-200 font-semibold">
                            {matchedClient.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {matchedClient.visitsCount}-tashrif • Bonus: {matchedClient.bonusBalance?.toLocaleString()} so'm
                        </div>
                      </div>
                      <span className="text-xl">🌟</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.clientNameLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Masalan: Rustam Karimov"
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-sky-500" />
                  {t.guestsCountLabel}:
                </label>
                <span className="text-[11px] text-slate-400">
                  (Standart tarifda 4 kishi kiritilgan)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center font-mono font-extrabold text-base py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {guestsCount} {t.guests}
                </div>
                <button
                  type="button"
                  onClick={() => setGuestsCount(guestsCount + 1)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {guestsCount > 7 && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1 font-bold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.maxGuestsWarn}</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={acceptMaxGuestsException}
                      onChange={(e) => setAcceptMaxGuestsException(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="font-semibold">{t.acceptException}</span>
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.visitType}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisitType('instant')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    visitType === 'instant'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Hozir kirish</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisitType('booking')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    visitType === 'booking'
                      ? 'bg-sky-600 text-white border-sky-700 shadow-md shadow-sky-600/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Bron qilish</span>
                </button>
              </div>

              {visitType === 'booking' && (
                <div className="grid grid-cols-2 gap-2 mt-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">{t.bookingDate}</span>
                    <input
                      type="text"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      placeholder="Bugun / 2026-10-27"
                      className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">{t.bookingTime}</span>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.roomLabel}
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} — ({room.status === 'free' ? "Bo'sh (Tayyor)" : room.status === 'cleaning' ? "Tozalanmoqda" : "Band"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.durationLabel}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: '1', label: '1 soat' },
                  { id: '1.5', label: '1.5 soat' },
                  { id: '2', label: '2 soat' },
                  { id: 'vip', label: 'VIP Paket' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDurationOption(opt.id)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                      durationOption === opt.id
                        ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {t.autoCalculated}:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {(baseTariffPrice + extraGuestPrice).toLocaleString()} UZS
                </span>
              </div>

              {extraGuests > 0 && (
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>+{extraGuests} qo'shimcha kishi ustamasi:</span>
                  <span className="font-mono">+{extraGuestPrice.toLocaleString()} UZS</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Qo'lda summa (agar kerak bo'lsa):</span>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Standart narx"
                    className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Chegirma (UZS):</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">{t.paymentStatus}:</span>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-semibold cursor-pointer"
                  >
                    <option value="full">{t.statusPaidFull}</option>
                    <option value="deposit">{t.statusDeposit}</option>
                    <option value="postpaid">{t.statusPostPaid}</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">{t.paymentMethod}:</span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-semibold cursor-pointer"
                  >
                    <option value="cash">Naqd pul</option>
                    <option value="card">Plastik karta</option>
                    <option value="qr">Click / Payme</option>
                    <option value="mixed">Aralash to'lov</option>
                  </select>
                </div>
              </div>

              {paymentStatus === 'deposit' && (
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Olingan zalog summasi (UZS):</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="100000"
                    className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono font-bold text-sky-600"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                  {t.finalTotal}:
                </span>
                <span className="font-mono font-extrabold text-base text-cyan-600 dark:text-cyan-400">
                  {finalPrice.toLocaleString()} UZS
                </span>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-black text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                visitType === 'instant'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-sky-500/25'
              }`}
            >
              {visitType === 'instant' ? (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{t.submitInstant}</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>{t.submitBooking}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t.liveSessionsTitle}
                </h2>
                <p className="text-xs text-slate-500">
                  Rangli statuslar, jonli teskari taymerlar va tezkor boshqaruv
                </p>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {t.tabAll} ({countAll})
              </button>

              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'active'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{t.tabActive} ({countActive})</span>
              </button>

              <button
                onClick={() => setActiveTab('overtime')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'overtime'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>{t.tabOvertime} ({countOvertime})</span>
              </button>

              <button
                onClick={() => setActiveTab('booking')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'booking'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.tabBookings} ({countBooking})</span>
              </button>

              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'completed'
                    ? 'bg-slate-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.tabCompleted} ({countCompleted})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {sortedSessions.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Bu filtr bo'yicha hech qanday seans topilmadi.
              </div>
            ) : (
              sortedSessions.map((session) => {
                const timer = getTimerDetails(session);

                const isOvertime = session.status === 'overtime';
                const isActive = session.status === 'active';
                const isBooking = session.status === 'booking';
                const isCompleted = session.status === 'completed';

                let cardStyle =
                  'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800';

                if (isOvertime) {
                  cardStyle =
                    'bg-rose-50/60 dark:bg-rose-950/30 border-2 border-rose-500 animate-overtime-glow';
                } else if (isActive && timer.isWarning) {
                  cardStyle =
                    'bg-amber-50/60 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-500 shadow-md';
                } else if (isActive) {
                  cardStyle =
                    'bg-white dark:bg-slate-900 border-2 border-emerald-400/80 dark:border-emerald-600/80 shadow-sm';
                } else if (isBooking) {
                  cardStyle =
                    'bg-sky-50/40 dark:bg-sky-950/20 border border-sky-300 dark:border-sky-800';
                } else if (isCompleted) {
                  cardStyle =
                    'bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 opacity-75';
                }

                return (
                  <div
                    key={session.id}
                    className={`rounded-2xl p-4 transition-all duration-200 space-y-3 ${cardStyle}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
                            {session.roomName}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {session.clientName}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {session.phone}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{session.guestsCount} kishi</span>
                          </span>
                          <span>•</span>
                          <span>{session.durationHours} soat</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {session.paymentStatus === 'full'
                              ? "To'liq to'langan"
                              : session.paymentStatus === 'deposit'
                              ? `Zalog: ${session.depositAmount?.toLocaleString()} UZS`
                              : "Chiqishda to'lanadi"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isOvertime && (
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                          )}
                          <span className={`text-sm md:text-base font-mono ${timer.statusClass}`}>
                            {timer.label}
                          </span>
                        </div>

                        {session.startTime && (
                          <div className="text-[10px] text-slate-400">
                            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                            {session.endTime ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    {isBooking && (
                      <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 flex items-center justify-between text-xs text-sky-900 dark:text-sky-200">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <BellRing className="w-4 h-4 text-sky-600 animate-bounce-subtle" />
                          <span>{t.callClientReminder} ({session.phone})</span>
                        </div>
                        <a
                          href={`tel:${session.phone}`}
                          className="px-2 py-0.5 rounded-lg bg-sky-600 text-white text-[11px] font-bold flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Qo'ng'iroq</span>
                        </a>
                      </div>
                    )}

                    {session.barOrders && session.barOrders.length > 0 && (
                      <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <ShoppingBag className="w-3.5 h-3.5 text-sky-500" />
                          <span className="font-semibold">Mini-bar ({session.barOrders.length} xil):</span>
                          <span className="text-slate-500">
                            {session.barOrders.map((o) => `${o.name} (${o.quantity}x)`).join(', ')}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                          +{session.barTotal.toLocaleString()} UZS
                        </span>
                      </div>
                    )}

                    {session.notes && (
                      <div className="text-[11px] text-slate-500 italic">
                        💬 "{session.notes}"
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Jami hisob:</span>
                        <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                          {session.totalAmount.toLocaleString()} UZS
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        {isOvertime && (
                          <>
                            <button
                              onClick={() => extendSessionTime(session.id, 30)}
                              className="px-2.5 py-1 rounded-lg font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                            >
                              {t.extend30m}
                            </button>
                            <button
                              onClick={() => extendSessionTime(session.id, 60)}
                              className="px-2.5 py-1 rounded-lg font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                            >
                              {t.extend1h}
                            </button>
                            <button
                              onClick={() => finishSession(session.id)}
                              className="px-3 py-1 rounded-lg font-black bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm"
                            >
                              {t.finishSession}
                            </button>
                          </>
                        )}

                        {isActive && (
                          <>
                            <button
                              onClick={() => setActiveBarOrderSession(session)}
                              className="px-2.5 py-1 rounded-lg font-semibold bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-colors flex items-center gap-1"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{t.addOrder}</span>
                            </button>
                            <button
                              onClick={() => extendSessionTime(session.id, 30)}
                              className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              +30 daq
                            </button>
                            <button
                              onClick={() => finishSession(session.id)}
                              className="px-3 py-1 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                            >
                              {t.finishSession}
                            </button>
                          </>
                        )}

                        {isBooking && (
                          <>
                            <button
                              onClick={() => cancelBooking(session.id)}
                              className="px-2.5 py-1 rounded-lg font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            >
                              {t.cancelBooking}
                            </button>
                            <button
                              onClick={() => startBookingSession(session.id)}
                              className="px-3 py-1 rounded-lg font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-sm flex items-center gap-1"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>{t.startBookingSession}</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setActiveReceiptSession(session)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          title={t.printReceipt}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

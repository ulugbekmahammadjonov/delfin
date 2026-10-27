import React, { useState, useEffect } from 'react';
import { useApp } from '@/app/providers/AppContext';
import { Client, Session, PaymentStatus, PaymentMethod, SessionType } from '@/shared/types';
import { formatTime24 } from '@/shared/utils/dateUtils';
import { EditBookingModal } from '@/features/booking';
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
  Clock,
  Lock,
  X,
  Pencil,
} from 'lucide-react';

export default function RegistrationView() {
  const {
    t,
    tariffs,
    rooms,
    sessions,
    clients,
    currentTime,
    addSession,
    extendSessionTime,
    finishSession,
    startBookingSession,
    cancelBooking,
    updateSession,
    findClientByPhone,
    setActiveReceiptSession,
    setActiveBarOrderSession,
    addLog,
  } = useApp();

  const [phone, setPhone] = useState<string>('+998 ');
  const [clientName, setClientName] = useState<string>('');
  const [matchedClient, setMatchedClient] = useState<Client | null>(null);
  const [phoneSuggestions, setPhoneSuggestions] = useState<Client[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState<boolean>(false);
  const [guestsCount, setGuestsCount] = useState<number>(4);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Session | null>(null);
  const [visitType, setVisitType] = useState<SessionType>('instant');
  const [bookingDate, setBookingDate] = useState<string>('Bugun');
  const [bookingTime, setBookingTime] = useState<string>('14:30');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isExclusive, setIsExclusive] = useState<boolean>(false);
  const [durationOption, setDurationOption] = useState<string>('1.5');
  const [customHours, setCustomHours] = useState<string>('3');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('full');
  const [depositAmount, setDepositAmount] = useState<string>('100000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState<string>('');
  const [isBonusSession, setIsBonusSession] = useState<boolean>(false);
  const [showBonusModal, setShowBonusModal] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (!selectedRoomId && rooms.length > 0) {
      const freeRoom = rooms.find((r) => r.status === 'free') || rooms[0];
      setSelectedRoomId(freeRoom.id);
    }
  }, [rooms, selectedRoomId]);

  // Uzbek Phone Formatter: +998 XX XXX XX XX (max 9 digits after 998)
  const formatUzbekPhone = (input: string): string => {
    let digits = input.replace(/\D/g, '');
    if (digits.startsWith('998')) {
      digits = digits.slice(3);
    }
    digits = digits.slice(0, 9);

    let formatted = '+998 ';
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
    return formatted;
  };

  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('998')) {
      digits = digits.slice(3);
    }
    // Strictly max 9 national digits (cannot type extra)
    digits = digits.slice(0, 9);

    let formatted = '+998 ';
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);

    setPhone(formatted);

    // Instant real-time search from first digit entered
    if (digits.length >= 1) {
      const searchStr = digits;
      const matches = clients.filter((c) => {
        const cDigits = c.phone.replace(/\D/g, '');
        const localDigits = cDigits.startsWith('998') ? cDigits.slice(3) : cDigits;
        return localDigits.includes(searchStr) || cDigits.includes(searchStr);
      });

      setPhoneSuggestions(matches);
      setIsSuggestionsOpen(matches.length > 0);

      // Check if full 9 digits match an exact client
      if (digits.length === 9) {
        const exact = matches.find((c) => {
          const cDigits = c.phone.replace(/\D/g, '');
          const localDigits = cDigits.startsWith('998') ? cDigits.slice(3) : cDigits;
          return localDigits === digits;
        });

        if (exact) {
          setMatchedClient(exact);
          setClientName(exact.name);
          setIsSuggestionsOpen(false);
          if (exact.visitsCount % 9 === 8) {
            setShowBonusModal(true);
          }
        } else {
          setMatchedClient(null);
          setIsBonusSession(false);
        }
      } else if (matches.length === 1 && digits.length >= 7) {
        setMatchedClient(matches[0]);
        setClientName(matches[0].name);
        if (matches[0].visitsCount % 9 === 8) {
          setShowBonusModal(true);
        }
      } else {
        setMatchedClient(null);
        setIsBonusSession(false);
      }
    } else {
      setPhoneSuggestions([]);
      setIsSuggestionsOpen(false);
      setMatchedClient(null);
      setIsBonusSession(false);
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent backspace deleting '+998 '
    const target = e.currentTarget;
    const selStart = target.selectionStart;
    const selEnd = target.selectionEnd;

    if (e.key === 'Backspace') {
      if (selStart !== null && selStart <= 5 && selEnd !== null && selEnd <= 5) {
        e.preventDefault();
      }
    }
  };

  const selectMatchedClient = (client: Client) => {
    const formatted = formatUzbekPhone(client.phone);
    setPhone(formatted);
    setMatchedClient(client);
    setClientName(client.name);
    setPhoneSuggestions([]);
    setIsSuggestionsOpen(false);
    if (client.visitsCount % 9 === 8) {
      setShowBonusModal(true);
    } else {
      setIsBonusSession(false);
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

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const activeInSelectedRoom = sessions.filter(
    (s) => s.roomId === selectedRoomId && (s.status === 'active' || s.status === 'overtime')
  );
  const roomHasActiveExclusive = activeInSelectedRoom.some((s) => s.isExclusive);
  const currentOcc = roomHasActiveExclusive
    ? (selectedRoom?.capacity || 7)
    : activeInSelectedRoom.reduce((acc, s) => acc + (s.guestsCount || 0), 0);
  const remainingSpotsInRoom = selectedRoom ? Math.max(0, selectedRoom.capacity - currentOcc) : 0;
  const totalGuestsAfterAdd = currentOcc + guestsCount;
  const isExceedingCapacity = Boolean(selectedRoom && (roomHasActiveExclusive || totalGuestsAfterAdd > selectedRoom.capacity));
  const excessCount = selectedRoom ? Math.max(0, totalGuestsAfterAdd - selectedRoom.capacity) : 0;

  // Billing guests calculation: if booking and isExclusive, client pays for full room capacity!
  const isExclusiveActive = visitType === 'booking' && isExclusive;
  const billingGuests = isExclusiveActive && selectedRoom ? Math.max(guestsCount, selectedRoom.capacity) : guestsCount;
  const extraGuests = Math.max(0, billingGuests - tariffs.includedGuestsStandard);
  const extraGuestPrice = extraGuests * tariffs.extraPersonPerHour * Math.ceil(effectiveHours);

  const isNinthBonusEligible = Boolean(matchedClient && matchedClient.visitsCount % 9 === 8);
  const calculatedBase = baseTariffPrice + extraGuestPrice;
  const calculatedTotal = isBonusSession
    ? 0
    : Math.max(0, calculatedBase - Number(discountAmount || 0));
  const finalPrice = isBonusSession ? 0 : (customPrice !== '' ? Number(customPrice) : calculatedTotal);

  const executeAddSession = () => {
    const noteParts = [
      isBonusSession ? "[9-TASHRIF BONUSI - BEPUL SEANS]" : '',
      isExclusiveActive ? "[TO'LIQ BAND (EKSKLYUZIV)]" : '',
      notes.trim(),
    ].filter(Boolean);

    addSession({
      clientName: clientName.trim(),
      phone: phone.trim(),
      guestsCount: Number(guestsCount),
      isExclusive: isExclusiveActive,
      isBonus: isBonusSession,
      roomId: selectedRoomId,
      roomName: selectedRoom ? selectedRoom.name : 'Sauna',
      type: visitType,
      durationHours: effectiveHours,
      baseAmount: isBonusSession ? 0 : baseTariffPrice,
      extraAmount: isBonusSession ? 0 : extraGuestPrice,
      totalAmount: finalPrice,
      paymentStatus: isBonusSession ? 'full' : paymentStatus,
      depositAmount: paymentStatus === 'deposit' ? Number(depositAmount) : 0,
      paymentMethod: isBonusSession ? 'cash' : paymentMethod,
      notes: noteParts.join(' '),
      bookingDate: visitType === 'booking' ? bookingDate : null,
      bookingTime: visitType === 'booking' ? bookingTime : null,
    });

    if (isBonusSession) {
      addLog(`🎉 DIQQAT: ${clientName.trim()} uchun 9-tashrif BONUS seansi rasmiylashtirildi (bepul).`);
    }

    setPhone('+998 ');
    setClientName('');
    setMatchedClient(null);
    setPhoneSuggestions([]);
    setIsSuggestionsOpen(false);
    setNotes('');
    setCustomPrice('');
    setDiscountAmount(0);
    setIsCapacityModalOpen(false);
    setIsExclusive(false);
    setIsBonusSession(false);
    setShowBonusModal(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert("Iltimos, mijoz ismini kiriting!");
      return;
    }

    if (roomHasActiveExclusive) {
      alert("Diqqat: Ushbu sauna hozirda boshqa mijoz tomonidan to'liq (eksklyuziv) band qilingan! Boshqa mijoz qabul qilinmaydi.");
      return;
    }

    if (isExclusiveActive && activeInSelectedRoom.length > 0) {
      alert(`Diqqat: Ushbu saunada hozir boshqa mijozlar bor (${activeInSelectedRoom.reduce((acc, s) => acc + (s.guestsCount || 0), 0)} kishi). Saunani to'liq (eksklyuziv) band qilish uchun sauna mutlaqo bo'sh bo'lishi kerak!`);
      return;
    }

    if (isExceedingCapacity) {
      setIsCapacityModalOpen(true);
      return;
    }

    executeAddSession();
  };

  const getTimerDetails = (session: Session) => {
    if (session.status === 'completed') {
      return { label: 'Yakunlangan', statusClass: 'text-slate-400', isOvertime: false, isWarning: false };
    }

    if (session.status === 'booking') {
      return {
        label: `${session.bookingDate} ${formatTime24(session.bookingTime)}`,
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

  const isSessionToday = (s: Session) => {
    const todayDate = new Date().toISOString().split('T')[0];
    if (s.completedAt) {
      return s.completedAt.startsWith(todayDate);
    }
    if (s.endTime) {
      return s.endTime.startsWith(todayDate);
    }
    if (s.startTime) {
      return s.startTime.startsWith(todayDate);
    }
    return s.bookingDate === 'Bugun';
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
    if (activeTab === 'completed') return s.status === 'completed' && isSessionToday(s);
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
  const countCompleted = sessions.filter((s) => s.status === 'completed' && isSessionToday(s)).length;

  const isSmallRoom = (s: Session) =>
    s.roomId === 'r1' || s.roomName?.toLowerCase().includes('kichik') || !s.roomId;
  const isBigRoom = (s: Session) =>
    s.roomId === 'r2' || s.roomName?.toLowerCase().includes('katta');

  const smallRoomSessions = sortedSessions.filter(isSmallRoom);
  const bigRoomSessions = sortedSessions.filter(isBigRoom);

  const activeSmallSessions = sessions.filter(
    (s) => isSmallRoom(s) && (s.status === 'active' || s.status === 'overtime')
  );
  const hasSmallExclusive = activeSmallSessions.some((s) => s.isExclusive);
  const smallOcc = hasSmallExclusive
    ? 7
    : activeSmallSessions.reduce((acc, s) => acc + (s.guestsCount || 0), 0);
  const smallRem = Math.max(0, 7 - smallOcc);

  const activeBigSessions = sessions.filter(
    (s) => isBigRoom(s) && (s.status === 'active' || s.status === 'overtime')
  );
  const hasBigExclusive = activeBigSessions.some((s) => s.isExclusive);
  const bigOcc = hasBigExclusive
    ? 30
    : activeBigSessions.reduce((acc, s) => acc + (s.guestsCount || 0), 0);
  const bigRem = Math.max(0, 30 - bigOcc);

  const renderSessionCard = (session: Session) => {
    const timer = getTimerDetails(session);

    const isOvertime = session.status === 'overtime';
    const isActive = session.status === 'active';
    const isBooking = session.status === 'booking';
    const isCompleted = session.status === 'completed';
    const isSmall = isSmallRoom(session);

    let cardStyle =
      'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800';

    if (isOvertime) {
      cardStyle =
        'bg-rose-50/60 dark:bg-rose-950/30 border-2 border-rose-500 animate-overtime-glow';
    } else if (isActive && timer.isWarning) {
      cardStyle =
        'bg-amber-50/60 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-500 shadow-md';
    } else if (isActive) {
      cardStyle = isSmall
        ? 'bg-white dark:bg-slate-900 border-2 border-sky-400/80 dark:border-sky-600/80 shadow-sm'
        : 'bg-white dark:bg-slate-900 border-2 border-indigo-400/80 dark:border-indigo-600/80 shadow-sm';
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
        className={`rounded-2xl p-3.5 transition-all duration-200 space-y-3 ${cardStyle}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {session.clientName}
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {session.phone}
              </span>
              {session.isExclusive && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Eksklyuziv</span>
                </span>
              )}
              {session.isBonus && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 flex items-center gap-1 shadow-xs animate-pulse">
                  <span>🎁</span>
                  <span>9-tashrif Bonusi</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{session.guestsCount} kishi</span>
                {session.isExclusive && (
                  <span className="text-amber-600 dark:text-amber-400 font-bold ml-0.5">
                    (Yopiq sauna)
                  </span>
                )}
              </span>
              <span>•</span>
              <span>{session.durationHours} soat</span>
              <span>•</span>
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {session.paymentStatus === 'full'
                  ? "To'langan"
                  : session.paymentStatus === 'deposit'
                  ? `Zalog: ${session.depositAmount?.toLocaleString()} UZS`
                  : "Chiqishda"}
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="flex items-center justify-end gap-1.5">
              {isOvertime && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
              <span className={`text-xs md:text-sm font-mono ${timer.statusClass}`}>
                {timer.label}
              </span>
            </div>

            {session.startTime && (
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {formatTime24(session.startTime)} -{' '}
                {session.endTime ? formatTime24(session.endTime) : ''}
              </div>
            )}
          </div>
        </div>

        {isBooking && (
          <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 flex items-center justify-between text-xs text-sky-900 dark:text-sky-200">
            <div className="flex items-center gap-1.5 font-semibold text-[11px] truncate">
              <BellRing className="w-3.5 h-3.5 text-sky-600 animate-bounce-subtle flex-shrink-0" />
              <span className="truncate">{session.bookingDate} {formatTime24(session.bookingTime)}</span>
            </div>
            <a
              href={`tel:${session.phone}`}
              className="px-2 py-0.5 rounded-lg bg-sky-600 text-white text-[10px] font-bold flex items-center gap-1 flex-shrink-0"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Qo'ng'iroq</span>
            </a>
          </div>
        )}

        {session.barOrders && session.barOrders.length > 0 && (
          <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px] truncate">
              <ShoppingBag className="w-3 h-3 text-sky-500 flex-shrink-0" />
              <span className="font-semibold">Mini-bar ({session.barOrders.length}):</span>
              <span className="text-slate-500 truncate">
                {session.barOrders.map((o) => `${o.name} (${o.quantity}x)`).join(', ')}
              </span>
            </div>
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-[11px] flex-shrink-0 ml-1">
              +{session.barTotal.toLocaleString()} UZS
            </span>
          </div>
        )}

        {session.notes && (
          <div className="text-[10px] text-slate-500 italic truncate">
            💬 "{session.notes}"
          </div>
        )}

        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Jami:</span>
            <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
              {session.totalAmount.toLocaleString()} UZS
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            {isOvertime && (
              <>
                <button
                  onClick={() => extendSessionTime(session.id, 30)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                >
                  +30 daq
                </button>
                <button
                  onClick={() => extendSessionTime(session.id, 60)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                >
                  +1 soat
                </button>
                <button
                  onClick={() => finishSession(session.id)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs"
                >
                  {t.finishSession}
                </button>
              </>
            )}

            {isActive && (
              <>
                <button
                  onClick={() => setActiveBarOrderSession(session)}
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-colors flex items-center gap-1"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>+ Bar</span>
                </button>
                <button
                  onClick={() => extendSessionTime(session.id, 30)}
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  +30 daq
                </button>
                <button
                  onClick={() => finishSession(session.id)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
                >
                  {t.finishSession}
                </button>
              </>
            )}

            {isBooking && (
              <>
                <button
                  type="button"
                  onClick={() => setEditingBooking(session)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 transition-colors flex items-center gap-1"
                  title="Bron ma'lumotlarini tahrirlash"
                >
                  <Pencil className="w-2.5 h-2.5" />
                  <span>Tahrirlash</span>
                </button>
                <button
                  type="button"
                  onClick={() => cancelBooking(session.id)}
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  {t.cancelBooking}
                </button>
                <button
                  type="button"
                  onClick={() => startBookingSession(session.id)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-xs flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>{t.startBookingSession}</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveReceiptSession(session)}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title={t.printReceipt}
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Timer className="w-6 h-6 text-sky-500" />
            {t.regTitle}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 xl:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                ⚡
              </span>
              <h2 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white">
                Tezkor Qabul Formasi
              </h2>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-500" />
                  {t.searchClientPhone}
                </label>
                {matchedClient && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <span>✓</span>
                    <span>{t.clientFound}</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onKeyDown={handlePhoneKeyDown}
                  onFocus={() => {
                    if (phoneSuggestions.length > 0) setIsSuggestionsOpen(true);
                  }}
                  placeholder="+998 90 123 45 67"
                  maxLength={17}
                  required
                  className="w-full px-3 py-2.5 rounded-xl font-mono text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 tracking-wide"
                />

                {phoneSuggestions.length > 0 && isSuggestionsOpen && (
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    {phoneSuggestions.length} ta topildi
                  </span>
                )}
              </div>

              {/* Real-time Suggestions Dropdown */}
              {isSuggestionsOpen && phoneSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 animate-in fade-in duration-150">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/60 flex justify-between items-center sticky top-0 backdrop-blur">
                    <span>Mijozlar bazasidan moslar ({phoneSuggestions.length}):</span>
                    <button
                      type="button"
                      onClick={() => setIsSuggestionsOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {phoneSuggestions.map((client) => {
                    const isBlack = client.isBlacklisted;
                    const hasDebt = (client.debtAmount || 0) > 0;

                    return (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => selectMatchedClient(client)}
                        className="w-full px-3 py-2.5 text-left hover:bg-sky-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-2 group"
                      >
                        <div className="truncate">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                            <span className="group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                              {client.name}
                            </span>
                            {client.visitsCount >= 5 && !isBlack && <span>👑</span>}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{client.phone}</span>
                            <span>•</span>
                            <span>{client.visitsCount} marta kelgan</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isBlack
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
                                : hasDebt
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200'
                            }`}
                          >
                            {client.status}
                          </span>
                          {hasDebt && (
                            <span className="text-[10px] text-rose-600 font-mono font-bold">
                              Qarz: {client.debtAmount?.toLocaleString()} UZS
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Matched Client Card */}
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
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Tashriflar: {matchedClient.visitsCount} ta
                          </span>
                          <span>•</span>
                          {matchedClient.visitsCount % 9 === 8 ? (
                            <span className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700 animate-pulse">
                              <span>🎁</span>
                              <span>Navbatdagi 9-tashrif BONUS!</span>
                            </span>
                          ) : (
                            <span className="text-slate-600 dark:text-slate-300">
                              Loyallik: {matchedClient.visitsCount % 9}/8 (9-bonusga yana {8 - (matchedClient.visitsCount % 9)} ta)
                            </span>
                          )}
                          {(matchedClient.debtAmount || 0) > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-rose-600 font-bold">Qarz: {matchedClient.debtAmount?.toLocaleString()} so'm</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-xl">🌟</span>
                    </div>
                  )}

                  {/* 9th Visit Bonus Banner and Toggle */}
                  {matchedClient.visitsCount % 9 === 8 && !matchedClient.isBlacklisted && (
                    <div className="mt-2 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/20 border-2 border-amber-400 dark:border-amber-500 space-y-2 shadow-xs animate-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl animate-bounce-subtle">🎁</span>
                          <div>
                            <h4 className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                              <span>9-TASHRIF BONUSI MAVJUD!</span>
                              <span className="text-[10px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider">
                                Bepul Seans
                              </span>
                            </h4>
                            <p className="text-[11px] text-amber-800 dark:text-amber-300">
                              Mijoz 8 marta tashrif buyurgan. Ushbu 9-tashrif 100% bepul taqdim etiladi.
                            </p>
                          </div>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 pt-2 border-t border-amber-300/50 dark:border-amber-700/50 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isBonusSession}
                          onChange={(e) => setIsBonusSession(e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-amber-400 cursor-pointer"
                        />
                        <span className="text-xs font-extrabold text-amber-950 dark:text-amber-100">
                          9-tashrif bonusini faollashtirish (Seans bepul — 100% chegirma)
                        </span>
                      </label>
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

              {isExceedingCapacity && selectedRoom && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Sig'im me'yordan oshadi: {selectedRoom.name} (Sig'imi: {selectedRoom.capacity} kishi)</span>
                  </div>
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-tight">
                    Ichkarida {currentOcc} kishi bor + kiritilayotgan {guestsCount} kishi = jami {totalGuestsAfterAdd} kishi (+{excessCount} kishi me'yordan ortiq). "Qabul qilish" bosilganda tasdiq modal oynasi chiqadi.
                  </p>
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
                  onClick={() => {
                    setVisitType('instant');
                    setIsExclusive(false);
                  }}
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
                    <span className="text-[10px] text-slate-400 block mb-0.5">{t.bookingTime} (24-soatlik)</span>
                    <input
                      type="text"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      placeholder="14:30"
                      maxLength={5}
                      className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {t.roomLabel}
                </label>
              </div>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {rooms.map((room) => {
                  const active = sessions.filter(
                    (s) => s.roomId === room.id && (s.status === 'active' || s.status === 'overtime')
                  );
                  const hasExclusive = active.some((s) => s.isExclusive);
                  const occ = hasExclusive ? room.capacity : active.reduce((acc, s) => acc + (s.guestsCount || 0), 0);
                  const rem = room.capacity - occ;

                  const statusStr =
                    hasExclusive
                      ? `🔒 To'liq band (Eksklyuziv bron)`
                      : occ === 0
                      ? `🟢 Bo'sh (${room.capacity} ta joy)`
                      : rem > 0
                      ? `🟡 Joy bor (${occ}/${room.capacity} kishi • Yana ${rem} ta joy)`
                      : `🔴 To'liq band (${room.capacity}/${room.capacity})`;

                  return (
                    <option key={room.id} value={room.id}>
                      {room.name} — {statusStr}
                    </option>
                  );
                })}
              </select>
              {selectedRoom && (
                <div className="mt-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Joriy bandlik holati:</span>
                  {roomHasActiveExclusive ? (
                    <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-300 dark:border-rose-700">
                      <Lock className="w-3 h-3 text-rose-600" />
                      Eksklyuziv band (Boshqa mijoz kiritilmaydi)
                    </span>
                  ) : currentOcc === 0 ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Bo'sh ({selectedRoom.capacity} ta bo'sh joy)
                    </span>
                  ) : remainingSpotsInRoom > 0 ? (
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      Joy bor ({currentOcc}/{selectedRoom.capacity} kishi • Yana {remainingSpotsInRoom} ta joy bor)
                    </span>
                  ) : (
                    <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      To'liq band ({selectedRoom.capacity}/{selectedRoom.capacity})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Saunani to'liq band qilish (Eksklyuziv yopish) opsiyasi faqat Bron qilishda chiqadi */}
            {visitType === 'booking' && (
              <div
                className={`p-3 rounded-xl border transition-all ${
                  isExclusive
                    ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isExclusive}
                    onChange={(e) => setIsExclusive(e.target.checked)}
                    disabled={Boolean(roomHasActiveExclusive)}
                    className="w-4 h-4 mt-0.5 text-amber-600 rounded focus:ring-amber-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Saunani to'liq band qilish (Eksklyuziv bron)</span>
                      </span>
                      {isExclusive && (
                        <span className="text-[10px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Yopiq sauna
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      Boshqa hech qanday mijoz qabul qilinmaydi. Mehmonlar soni {guestsCount} kishi bo'lsa ham, to'lov butun sauna sig'imi ({selectedRoom?.capacity || 7} kishi) bo'yicha hisoblanadi.
                    </p>
                    {isExclusive && selectedRoom && (
                      <div className="mt-2 text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-900/40 p-2 rounded-lg flex items-center justify-between border border-amber-300/60 dark:border-amber-700/60">
                        <span>Keladigan mehmonlar: {guestsCount} kishi</span>
                        <span className="text-amber-700 dark:text-amber-300">Hisob: {selectedRoom.capacity} kishilik to'liq narx</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}

            {roomHasActiveExclusive && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Sauna to'liq (eksklyuziv) band qilingan!</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-snug">
                  Ushbu sauna boshqa mijoz tomonidan to'liq yopilgan. Seans tugaguncha unga yangi mijoz qabul qilib bo'lmaydi.
                </p>
              </div>
            )}

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

              {isBonusSession && (
                <div className="flex justify-between items-center text-xs text-amber-950 dark:text-amber-200 font-extrabold bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-950/70 dark:to-yellow-950/50 p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 animate-pulse">
                  <span className="flex items-center gap-1.5">
                    <span>🎁</span>
                    <span>9-tashrif Bonusi (100% BEPUL):</span>
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    -{(baseTariffPrice + extraGuestPrice).toLocaleString()} UZS
                  </span>
                </div>
              )}

              {visitType === 'booking' && isExclusive && selectedRoom && (
                <div className="flex justify-between items-center text-xs text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-300/60 dark:border-amber-700/60">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>To'liq sauna hisobi ({selectedRoom.capacity} kishilik):</span>
                  </span>
                  <span className="font-mono">{(baseTariffPrice + extraGuestPrice).toLocaleString()} UZS</span>
                </div>
              )}

              {extraGuests > 0 && !(visitType === 'booking' && isExclusive) && (
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
                {isBonusSession ? (
                  <span className="font-mono font-black text-base text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <span>0 UZS</span>
                    <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-md font-black uppercase">
                      BEPUL
                    </span>
                  </span>
                ) : (
                  <span className="font-mono font-extrabold text-base text-cyan-600 dark:text-cyan-400">
                    {finalPrice.toLocaleString()} UZS
                  </span>
                )}
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
              disabled={Boolean(roomHasActiveExclusive)}
              className={`w-full py-3 rounded-xl font-black text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                roomHasActiveExclusive
                  ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60 shadow-none'
                  : visitType === 'instant'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-sky-500/25'
              }`}
            >
              {roomHasActiveExclusive ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sauna to'liq band (Eksklyuziv yopilgan)</span>
                </>
              ) : visitType === 'instant' ? (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{t.submitInstant}</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>{isExclusive ? "Eksklyuziv bronni saqlash (Sauna yopiladi)" : t.submitBooking}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t.liveSessionsTitle}
                </h2>
                <p className="text-xs text-slate-500">
                  Kichik sauna va Katta sauna parallel ustunlari, rangli statuslar va jonli taymerlar
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

          <div className="space-y-4">
            {activeTab === 'completed' && (
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <span className="flex items-center gap-2 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Bugungi yakunlangan seanslar ro'yxati (Har kuni yangilanadi)
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{countCompleted} ta seans</span>
              </div>
            )}

            {/* 2 Ta Ustunli Saunalar Ko'rinishi (Kichik sauna va Katta sauna) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* 1-Ustun: Kichik sauna (7 kishilik) */}
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                      🧖‍♂️
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                        <span>Kichik sauna</span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-normal">(7 kishilik)</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        Ixcham guruhlar davrasi
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {hasSmallExclusive ? (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                        <Lock className="w-2.5 h-2.5" />
                        Eksklyuziv
                      </span>
                    ) : smallOcc === 0 ? (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Bo'sh (0/7)
                      </span>
                    ) : smallRem > 0 ? (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                        {smallOcc}/7 (Yana {smallRem} ta)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        To'liq (7/7)
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {smallRoomSessions.length === 0 ? (
                    <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs space-y-1">
                      <span className="text-xl block">🧖‍♂️</span>
                      <p className="font-semibold text-slate-600 dark:text-slate-400">Kichik saunada seans yo'q</p>
                      <p className="text-[10px] text-slate-400">Bu filtr bo'yicha mijoz topilmadi</p>
                    </div>
                  ) : (
                    smallRoomSessions.map(renderSessionCard)
                  )}
                </div>
              </div>

              {/* 2-Ustun: Katta sauna (30 kishilik) */}
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                      🏊‍♂️
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                        <span>Katta sauna</span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-normal">(30 kishilik)</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        Katta jamoalar va guruhlar
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {hasBigExclusive ? (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                        <Lock className="w-2.5 h-2.5" />
                        Eksklyuziv
                      </span>
                    ) : bigOcc === 0 ? (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Bo'sh (0/30)
                      </span>
                    ) : bigRem > 0 ? (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                        {bigOcc}/30 (Yana {bigRem} ta)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        To'liq (30/30)
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {bigRoomSessions.length === 0 ? (
                    <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs space-y-1">
                      <span className="text-xl block">🏊‍♂️</span>
                      <p className="font-semibold text-slate-600 dark:text-slate-400">Katta saunada seans yo'q</p>
                      <p className="text-[10px] text-slate-400">Bu filtr bo'yicha mijoz topilmadi</p>
                    </div>
                  ) : (
                    bigRoomSessions.map(renderSessionCard)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exceeding Capacity Warning Modal */}
      {isCapacityModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-amber-300 dark:border-amber-700/80 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl flex-shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Sauna sig'imi me'yordan oshdi!
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                  Admin tasdig'i talab etiladi
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Tanlangan sauna:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedRoom.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Belgilangan sauna sig'imi:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{selectedRoom.capacity} kishi</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Hozir saunada bor mijozlar:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentOcc} kishi (Bo'sh joy: {remainingSpotsInRoom > 0 ? remainingSpotsInRoom : 0} ta)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Yangi kiritilayotgan mehmonlar:</span>
                <span className="font-black text-rose-600 dark:text-rose-400">{guestsCount} kishi</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Jami kutilayotgan mijozlar soni:</span>
                <span className="font-bold text-slate-900 dark:text-white">{totalGuestsAfterAdd} kishi</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-amber-200 dark:border-amber-800/60 font-bold">
                <span className="text-amber-800 dark:text-amber-300">Sig'imdan ortiqcha:</span>
                <span className="text-rose-600 dark:text-rose-400 font-black text-sm">+{excessCount} kishi</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Mijozlar soni sauna imkoniyatidan ortiq ({guestsCount} kishi). Agar xizmat ko'rsatishga rozi bo'lsangiz, admin sifatida tasdiqlab qabul qilishingiz mumkin.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCapacityModalOpen(false)}
                className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={executeAddSession}
                className="py-2.5 px-3 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin tasdig'i (Qabul qilish)</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 9th Visit Bonus Alert Modal */}
      {showBonusModal && matchedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border-2 border-amber-400 dark:border-amber-500 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 flex-shrink-0 animate-bounce">
                🎁
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                  Sodiqlik Bonusi
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  9-Tashrif — BONUS SEANSI!
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Mijoz:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{matchedClient.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Telefon:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{matchedClient.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Bajarilgan tashriflar:</span>
                <span className="font-black text-amber-600 dark:text-amber-400">8 / 8 ta tashrif (To'liq)</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-amber-200 dark:border-amber-800/60 font-bold">
                <span className="text-slate-800 dark:text-slate-200">Navbatdagi tashrif:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">9-tashrif (100% BEPUL)</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mijoz belgilangan <strong>8 ta tashrifni</strong> to'liq amalga oshirgan. Delfin Saunasi qoidasiga ko'ra ushbu <strong>9-tashrif bepul</strong> taqdim etiladi. Seansni bonus sifatida kiritasizmi?
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsBonusSession(true);
                  setShowBonusModal(false);
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>🎁 Ha, 9-tashrif bonusini qo'llash (100% Bepul)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBonusSession(false);
                  setShowBonusModal(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Oddiy to'lov sifatida davom etish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          rooms={rooms}
          onClose={() => setEditingBooking(null)}
          onSave={updateSession}
        />
      )}
    </div>
  );
}

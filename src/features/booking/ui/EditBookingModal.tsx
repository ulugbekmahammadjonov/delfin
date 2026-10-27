import React, { useState, useEffect } from 'react';
import { Session, Room, PaymentStatus, PaymentMethod } from '@/shared/types';
import {
  Calendar,
  Clock,
  Users,
  Lock,
  X,
  Save,
  DoorClosed,
  Phone,
  User,
  FileText,
  DollarSign,
} from 'lucide-react';

interface EditBookingModalProps {
  booking: Session | null;
  rooms: Room[];
  onClose: () => void;
  onSave: (sessionId: string, updates: Partial<Session>) => void;
}

export default function EditBookingModal({
  booking,
  rooms,
  onClose,
  onSave,
}: EditBookingModalProps) {
  if (!booking) return null;

  const [clientName, setClientName] = useState<string>(booking.clientName || '');
  const [phone, setPhone] = useState<string>(booking.phone || '+998 ');
  const [roomId, setRoomId] = useState<string>(booking.roomId || (rooms[0]?.id ?? 'r1'));
  const [bookingDate, setBookingDate] = useState<string>(booking.bookingDate || 'Bugun');
  const [bookingTime, setBookingTime] = useState<string>(booking.bookingTime || '14:30');
  const [durationHours, setDurationHours] = useState<number>(booking.durationHours || 2);
  const [guestsCount, setGuestsCount] = useState<number>(booking.guestsCount || 4);
  const [isExclusive, setIsExclusive] = useState<boolean>(Boolean(booking.isExclusive));
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(booking.paymentStatus || 'deposit');
  const [depositAmount, setDepositAmount] = useState<number>(booking.depositAmount || 0);
  const [totalAmount, setTotalAmount] = useState<number>(booking.totalAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(booking.paymentMethod || 'cash');
  const [notes, setNotes] = useState<string>(booking.notes || '');

  useEffect(() => {
    if (booking) {
      setClientName(booking.clientName || '');
      setPhone(booking.phone || '+998 ');
      setRoomId(booking.roomId || (rooms[0]?.id ?? 'r1'));
      setBookingDate(booking.bookingDate || 'Bugun');
      setBookingTime(booking.bookingTime || '14:30');
      setDurationHours(booking.durationHours || 2);
      setGuestsCount(booking.guestsCount || 4);
      setIsExclusive(Boolean(booking.isExclusive));
      setPaymentStatus(booking.paymentStatus || 'deposit');
      setDepositAmount(booking.depositAmount || 0);
      setTotalAmount(booking.totalAmount || 0);
      setPaymentMethod(booking.paymentMethod || 'cash');
      setNotes(booking.notes || '');
    }
  }, [booking, rooms]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert("Iltimos, mijoz ismini kiriting!");
      return;
    }

    if (!bookingTime.trim()) {
      alert("Iltimos, kelish vaqtini kiriting!");
      return;
    }

    const selectedRoom = rooms.find((r) => r.id === roomId);
    const roomName = selectedRoom ? selectedRoom.name : booking.roomName;

    onSave(booking.id, {
      clientName: clientName.trim(),
      phone: phone.trim(),
      roomId,
      roomName,
      bookingDate: bookingDate.trim() || 'Bugun',
      bookingTime: bookingTime.trim(),
      durationHours: Number(durationHours),
      guestsCount: Number(guestsCount),
      isExclusive,
      paymentStatus,
      depositAmount: paymentStatus === 'deposit' ? Number(depositAmount) : 0,
      totalAmount: Number(totalAmount),
      paymentMethod,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-500/10 via-slate-50 to-indigo-500/10 dark:from-slate-800/80 dark:to-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Bron ma'lumotlarini tahrirlash
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mijoz: <span className="font-bold text-slate-700 dark:text-slate-300">{booking.clientName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Mijoz Ismi va Telefoni */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-500" />
                <span>Mijoz ismi</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-500" />
                <span>Telefon raqami</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Sauna Tanlash */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <DoorClosed className="w-3.5 h-3.5 text-sky-500" />
              <span>Saunani tanlang</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {rooms.map((r) => {
                const isSelected = roomId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoomId(r.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-sky-50/80 dark:bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 dark:text-white text-xs">
                        {r.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Sig'im: {r.capacity} kishi
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Eksklyuziv bron checkbox */}
            <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 dark:border-amber-600/40">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isExclusive}
                  onChange={(e) => setIsExclusive(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-amber-300 cursor-pointer"
                />
                <div>
                  <span className="font-black text-amber-950 dark:text-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span>Saunani to'liq band qilish (Eksklyuziv yopish)</span>
                  </span>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">
                    Boshqa mijoz kiritilmaydi, butun zal faqat shu mijozga beriladi.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Sana, Vaqt va Davomiylik */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span>Kelish sanasi</span>
              </label>
              <input
                type="text"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                placeholder="Bugun, Ertaga..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>Kelish soati (24s)</span>
              </label>
              <input
                type="text"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                placeholder="14:30"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>Davomiyligi</span>
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
              >
                <option value={1}>1 soat</option>
                <option value={1.5}>1.5 soat</option>
                <option value={2}>2 soat</option>
                <option value={2.5}>2.5 soat</option>
                <option value={3}>3 soat</option>
                <option value={4}>4 soat</option>
              </select>
            </div>
          </div>

          {/* Odam soni */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-500" />
              <span>Mehmonlar soni</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-base flex items-center justify-center transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={guestsCount}
                onChange={(e) => setGuestsCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 text-center py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-black text-sm text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setGuestsCount(guestsCount + 1)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-base flex items-center justify-center transition-colors"
              >
                +
              </button>
              <span className="text-slate-500 text-xs ml-1">kishi</span>
            </div>
          </div>

          {/* To'lov ma'lumotlari */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>To'lov va Zalog ma'lumotlari</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">To'lov holati:</span>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-semibold cursor-pointer"
                >
                  <option value="deposit">Oldindan to'lov (Zalog)</option>
                  <option value="full">To'liq to'langan</option>
                  <option value="postpaid">Chiqishda to'lanadi</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">To'lov usuli:</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-semibold cursor-pointer"
                >
                  <option value="cash">Naqd pul</option>
                  <option value="card">Plastik karta</option>
                  <option value="qr">Click / Payme</option>
                  <option value="mixed">Aralash to'lov</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {paymentStatus === 'deposit' && (
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Olingan zalog summasi (UZS):</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono font-black text-sky-600 dark:text-sky-400"
                  />
                </div>
              )}

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Jami hisoblangan to'lov (UZS):</span>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono font-black text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Izoh / Eslatmalar */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-500" />
              <span>Izoh / Maxsus iltimoslar</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masalan: Choy, 2 ta eman venik tayyorlansin..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-black text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/25 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>O'zgarishlarni saqlash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

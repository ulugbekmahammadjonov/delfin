import React from 'react';
import { useApp } from '../../context/AppContext';
import { DoorClosed, UserPlus, ArrowRight, Users, AlertCircle } from 'lucide-react';

export default function RoomsView() {
  const { t, rooms, sessions, setCurrentTab } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <DoorClosed className="w-6 h-6 text-sky-500" />
            {t.roomsTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.roomsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            {t.roomStatusFree}
          </span>
          <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            {t.roomStatusPartial}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            {t.roomStatusBusy}
          </span>
        </div>
      </div>

      {/* Men Only & Capacity Rules Banner */}
      <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center text-xl font-bold shadow-sm flex-shrink-0">
            🚹
          </div>
          <div>
            <h2 className="font-black text-sm text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
              <span>Delfin Saunasi — Faqat erkaklar bo'limi</span>
              <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                Oilaviy (er-xotin) qabul qilinmaydi
              </span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Mavjud zallar: <strong>Kichik zal (7 kishi)</strong> va <strong>Katta zal (30 kishi)</strong>. Bo'sh joylar bo'lsa yangi mijozlar qabul qilinishi mumkin.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
            Jami: 2 ta zal
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => {
          const activeSessions = sessions.filter(
            (s) => s.roomId === room.id && (s.status === 'active' || s.status === 'overtime')
          );
          const occupiedCount = activeSessions.reduce((acc, s) => acc + (s.guestsCount || 0), 0);
          const remainingSpots = room.capacity - occupiedCount;

          const isFree = occupiedCount === 0;
          const isPartial = occupiedCount > 0 && occupiedCount < room.capacity;
          const isFull = occupiedCount === room.capacity;
          const isOverCapacity = occupiedCount > room.capacity;

          const hasOvertime = activeSessions.some((s) => s.status === 'overtime');

          return (
            <div
              key={room.id}
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm ${
                isFree
                  ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-500'
                  : isPartial
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 ring-1 ring-amber-400/20'
                  : isOverCapacity
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-400 dark:border-rose-700 animate-pulse'
                  : 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🧖‍♂️</span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      {room.name}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      🚹 Faqat erkaklar
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Sig'imi: {room.capacity} kishi
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                    isFree
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : isPartial
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-400 dark:border-amber-600 animate-pulse'
                      : isOverCapacity
                      ? 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border-rose-400 animate-pulse'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  {isFree ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Bo'sh (0/{room.capacity})</span>
                    </>
                  ) : isPartial ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>Joy bor (Yana {remainingSpots} ta joy)</span>
                    </>
                  ) : isOverCapacity ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                      <span>Sig'imdan oshgan (+{occupiedCount - room.capacity})</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>To'liq band ({room.capacity}/{room.capacity})</span>
                    </>
                  )}
                </span>
              </div>

              {/* Progress & Live Occupancy Display */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Bandlik: {occupiedCount} / {room.capacity} kishi
                    </span>
                    <span
                      className={`font-black ${
                        isFree
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isPartial
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isFree
                        ? `${room.capacity} ta bo'sh joy`
                        : isPartial
                        ? `Yana ${remainingSpots} ta mijoz qabul qilish mumkin`
                        : isOverCapacity
                        ? `+${occupiedCount - room.capacity} kishi me'yordan ortiq`
                        : "Bo'sh joy yo'q (To'lgan)"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFree
                          ? 'bg-slate-300 dark:bg-slate-600'
                          : isPartial
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((occupiedCount / room.capacity) * 100))}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Sessions list inside room */}
                {activeSessions.length > 0 ? (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-700/60">
                      <span>Zaldagi faol seanslar ({activeSessions.length} ta guruh):</span>
                      <span className="font-mono text-slate-900 dark:text-white">Jami: {occupiedCount} kishi</span>
                    </div>

                    <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                      {activeSessions.map((s) => (
                        <div
                          key={s.id}
                          className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/40 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {s.clientName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                              {s.guestsCount} kishi
                            </span>
                            {s.status === 'overtime' ? (
                              <span className="text-[10px] font-black text-rose-500 animate-pulse">
                                Overtime!
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                Faol
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-center text-slate-400">
                    Zal mutlaqo bo'sh va yangi erkaklar guruhini qabul qilishga tayyor.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                {isFree ? (
                  <button
                    onClick={() => setCurrentTab('registration')}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Mijoz qabul qilish ({room.capacity} ta bo'sh joy)</span>
                  </button>
                ) : isPartial ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentTab('registration')}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black text-amber-950 dark:text-amber-100 bg-amber-400 hover:bg-amber-300 shadow-sm shadow-amber-400/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Yana mijoz qo'shish ({remainingSpots} ta joy)</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('registration')}
                      className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                    >
                      <span>Ko'rish</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentTab('registration')}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Zaldagi seanslarni ko'rish</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCurrentTab('registration')}
                      className="py-2.5 px-3 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-500 shadow-sm flex items-center gap-1"
                      title="Admin ruxsati bilan sig'imdan ortiq qabul qilish"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Istisno</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

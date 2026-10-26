import React from 'react';
import { useApp } from '../../context/AppContext';
import { DoorClosed, Sparkles, CheckCircle2, UserPlus, ArrowRight } from 'lucide-react';

export default function RoomsView() {
  const { t, rooms, sessions, setRoomStatus, setCurrentTab } = useApp();

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

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            {t.roomStatusFree}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-sky-600 dark:text-sky-400">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            {t.roomStatusBusy}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            {t.roomStatusCleaning}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => {
          const currentSession = sessions.find(
            (s) => s.roomId === room.id && (s.status === 'active' || s.status === 'overtime')
          );

          const isFree = room.status === 'free';
          const isBusy = room.status === 'busy';
          const isCleaning = room.status === 'cleaning';

          return (
            <div
              key={room.id}
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm ${
                isFree
                  ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-500'
                  : isBusy
                  ? 'bg-sky-50/40 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {room.type === 'vip' ? '👑' : room.type === 'family' ? '👨‍👩‍👧‍👦' : '🚪'}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {room.name}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <span>Sig'imi: {room.capacity} kishilik</span>
                    <span>•</span>
                    <span className="capitalize">{room.type}</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    isFree
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : isBusy
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse'
                  }`}
                >
                  {isFree
                    ? t.roomStatusFree
                    : isBusy
                    ? t.roomStatusBusy
                    : t.roomStatusCleaning}
                </span>
              </div>

              <div className="min-h-[70px] flex flex-col justify-center">
                {isBusy && currentSession ? (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Mijoz:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {currentSession.clientName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Odam soni:</span>
                      <span>{currentSession.guestsCount} kishi</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Holat:</span>
                      <span
                        className={`font-bold font-mono ${
                          currentSession.status === 'overtime'
                            ? 'text-rose-500 animate-pulse'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {currentSession.status === 'overtime' ? "Vaqti o'tgan (Overtime)!" : "Faol seans"}
                      </span>
                    </div>
                  </div>
                ) : isCleaning ? (
                  <div className="p-3 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1">
                    <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Xodim xonani tozalamoqda...</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Sochiqlar almashtirildi, bug'xona shamollatilyapti.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-center text-slate-400">
                    Xona toza va shamollatilgan. Yangi mehmonlarni qabul qilishga tayyor.
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                {isFree && (
                  <button
                    onClick={() => setCurrentTab('registration')}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Mijoz qabul qilish</span>
                  </button>
                )}

                {isBusy && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRoomStatus(room.id, 'cleaning')}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                    >
                      {t.markCleaning}
                    </button>
                    <button
                      onClick={() => setCurrentTab('registration')}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-sm flex items-center justify-center gap-1"
                    >
                      <span>Ko'rish</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {isCleaning && (
                  <button
                    onClick={() => setRoomStatus(room.id, 'free')}
                    className="w-full py-2 px-3 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-500 shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.setRoomReady}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

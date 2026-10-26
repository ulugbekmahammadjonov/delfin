import React from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, X } from 'lucide-react';

export default function ReceiptModal() {
  const { activeReceiptSession, setActiveReceiptSession } = useApp();

  if (!activeReceiptSession) return null;

  const session = activeReceiptSession;
  const receiptNo = `CHK-${session.id.slice(-6).toUpperCase()}`;
  const printDate = new Date().toLocaleString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐬</span>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Kassa Cheki / Hisob-faktura
            </span>
          </div>
          <button
            onClick={() => setActiveReceiptSession(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-3">
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
            <h2 className="font-extrabold text-base tracking-wider">DELFIN SAUNA & SPA</h2>
            <p className="text-[11px] text-slate-500">Toshkent sh., Chilonzor tumani</p>
            <p className="text-[11px] text-slate-500">Tel: +998 71 200-00-00</p>
            <div className="pt-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
              Chek №: {receiptNo}
            </div>
            <div className="text-[10px] text-slate-400">{printDate}</div>
          </div>

          <div className="space-y-1.5 py-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Mijoz:</span>
              <span className="font-bold">{session.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Telefon:</span>
              <span>{session.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Xona:</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">{session.roomName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mehmonlar:</span>
              <span>{session.guestsCount} kishi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Davomiyligi:</span>
              <span>{session.durationHours} soat</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span>Sauna xizmati:</span>
              <span>{session.baseAmount.toLocaleString()} UZS</span>
            </div>

            {session.extraAmount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Qo'shimcha odam:</span>
                <span>+{session.extraAmount.toLocaleString()} UZS</span>
              </div>
            )}

            {session.barOrders && session.barOrders.length > 0 && (
              <div className="pt-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Mini-bar va xizmatlar:</div>
                {session.barOrders.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-300 pl-1">
                    <span>
                      {item.name} ({item.quantity}x)
                    </span>
                    <span>{(item.price * item.quantity).toLocaleString()} UZS</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t-2 border-slate-400 dark:border-slate-600 pt-2 space-y-1">
            <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
              <span>JAMI TO'LOV:</span>
              <span>{session.totalAmount.toLocaleString()} UZS</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>To'lov usuli:</span>
              <span className="uppercase font-semibold">
                {session.paymentMethod === 'cash' ? 'Naqd pul' : session.paymentMethod === 'card' ? 'Plastik karta' : 'Click / Payme'}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Holat:</span>
              <span>TO'LANDI (YOPILDI)</span>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 text-[10px] text-slate-400">
            Tashrifingiz uchun rahmat! <br />
            Salomat bo'ling, yana kuting!
          </div>
        </div>

        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveReceiptSession(null)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50"
          >
            Yopish
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Chop etish</span>
          </button>
        </div>
      </div>
    </div>
  );
}

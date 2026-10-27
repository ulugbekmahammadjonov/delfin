import React, { useState } from 'react';
import { useApp } from '@/app/providers/AppContext';
import { X, Plus, Minus, ShoppingBag, Check } from 'lucide-react';

export default function MiniBarModal() {
  const {
    activeBarOrderSession,
    setActiveBarOrderSession,
    products,
    addBarOrderToSession,
  } = useApp();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [search, setSearch] = useState<string>('');

  if (!activeBarOrderSession) return null;

  const session = activeBarOrderSession;

  const handleQtyChange = (prodId: string, delta: number) => {
    const current = quantities[prodId] || 0;
    const next = Math.max(0, current + delta);
    setQuantities({ ...quantities, [prodId]: next });
  };

  const handleApplyOrder = () => {
    Object.entries(quantities).forEach(([prodId, qty]) => {
      if (qty > 0) {
        const prod = products.find((p) => p.id === prodId);
        if (prod) {
          addBarOrderToSession(session.id, {
            productId: prod.id,
            name: prod.name,
            price: prod.price,
            quantity: qty,
          });
        }
      }
    });

    setActiveBarOrderSession(null);
    setQuantities({});
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedTotal = Object.entries(quantities).reduce((acc, [prodId, qty]) => {
    const prod = products.find((p) => p.id === prodId);
    return acc + (prod ? prod.price * qty : 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-500" />
              <h2 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Mini-Bar va Qo'shimcha Buyurtma
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mijoz: <span className="font-semibold text-slate-700 dark:text-slate-200">{session.clientName}</span> ({session.roomName})
            </p>
          </div>
          <button
            onClick={() => setActiveBarOrderSession(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot nomi bo'yicha qidirish (choy, venik, suv)..."
            className="w-full text-xs md:text-sm px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredProducts.map((prod) => {
            const qty = quantities[prod.id] || 0;
            return (
              <div key={prod.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {prod.icon || '📦'}
                  </span>
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {prod.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">
                        {prod.price.toLocaleString()} UZS
                      </span>
                      <span>•</span>
                      <span className={prod.stock <= 10 ? 'text-rose-500 font-semibold' : ''}>
                        Qoldiq: {prod.stock} ta
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={qty <= 0}
                    onClick={() => handleQtyChange(prod.id, -1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {qty}
                  </span>
                  <button
                    disabled={qty >= prod.stock}
                    onClick={() => handleQtyChange(prod.id, 1)}
                    className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-slate-500">Qo'shilayotgan summa:</div>
            <div className="font-mono font-extrabold text-base text-sky-600 dark:text-sky-400">
              {selectedTotal.toLocaleString()} UZS
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveBarOrderSession(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              Bekor qilish
            </button>
            <button
              disabled={selectedTotal <= 0}
              onClick={handleApplyOrder}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-40 shadow-md flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Hisobga qo'shish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

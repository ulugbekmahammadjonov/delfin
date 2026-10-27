import React, { useState } from 'react';
import { useApp } from '@/app/providers/AppContext';
import { Product } from '@/shared/types';
import {
  ShoppingBag,
  Plus,
  AlertTriangle,
  Search,
} from 'lucide-react';

export default function MiniBarView() {
  const { t, products, setProducts, addLog } = useApp();
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Ichimliklar');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newStock, setNewStock] = useState<string>('');
  const [newIcon, setNewIcon] = useState<string>('📦');

  const categories = ['all', 'Ichimliklar', 'Sauna anjomlari', 'Gigiyena', 'Oshxona'];

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;

    const newProd: Product = {
      id: 'p_' + Date.now(),
      name: newName.trim(),
      category: newCategory,
      price: Number(newPrice),
      stock: Number(newStock) || 0,
      icon: newIcon || '📦',
    };

    setProducts((prev) => [newProd, ...prev]);
    addLog(`Yangi mahsulot omborga qo'shildi: ${newProd.name} (${newProd.stock} ta, narxi: ${newProd.price.toLocaleString()} UZS)`);
    setIsAddModalOpen(false);

    setNewName('');
    setNewPrice('');
    setNewStock('');
  };

  const handleQuickAddStock = (prodId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
    );
  };

  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-sky-500" />
            {t.miniBarTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.miniBarSubtitle} — avtomatik kamayuvchi ombor qoldig'i
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addItem}</span>
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce-subtle" />
            <span>Omborda {lowStockCount} ta mahsulot kam qoldi (10 tadan kam). Yetkazib beruvchilarga buyurtma berish tavsiya etiladi.</span>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'Barcha mahsulotlar' : cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot qidirish..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((prod) => {
          const isLowStock = prod.stock <= 10;
          return (
            <div
              key={prod.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                isLowStock
                  ? 'border-amber-300 dark:border-amber-800/80 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {prod.icon || '📦'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {prod.category}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {prod.name}
                </h3>
                <div className="mt-1 font-mono font-extrabold text-base text-sky-600 dark:text-sky-400">
                  {prod.price.toLocaleString()} UZS
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Ombor qoldig'i:</span>
                  <span
                    className={`font-mono font-bold ${
                      isLowStock ? 'text-amber-500 font-extrabold' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {prod.stock} ta {isLowStock && '⚠️'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleQuickAddStock(prod.id, 5)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Omborga +5 ta qo'shish"
                  >
                    +5 ta
                  </button>
                  <button
                    onClick={() => handleQuickAddStock(prod.id, 10)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 transition-colors"
                    title="Omborga +10 ta qo'shish"
                  >
                    +10 ta
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
              Yangi Mahsulot Qo'shish
            </h2>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Mahsulot nomi:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masalan: Maxsus asal va yalpiz choyi"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Kategoriya:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Ichimliklar">Ichimliklar</option>
                    <option value="Sauna anjomlari">Sauna anjomlari</option>
                    <option value="Gigiyena">Gigiyena</option>
                    <option value="Oshxona">Oshxona</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Belgi (Emoji):</label>
                  <input
                    type="text"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    placeholder="🍯, 🍃, 🍹"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Sotuv narxi (UZS):</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="25000"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Boshlang'ich qoldiq:</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

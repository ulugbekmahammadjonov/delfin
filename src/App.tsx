import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import ReceiptModal from './components/common/ReceiptModal';
import MiniBarModal from './components/common/MiniBarModal';
import ShiftCloseModal from './components/common/ShiftCloseModal';

import DashboardView from './components/dashboard/DashboardView';
import RegistrationView from './components/registration/RegistrationView';
import RoomsView from './components/rooms/RoomsView';
import MiniBarView from './components/minibar/MiniBarView';
import CrmView from './components/crm/CrmView';
import CashierView from './components/cashier/CashierView';
import SettingsView from './components/settings/SettingsView';

import {
  LayoutDashboard,
  Timer,
  DoorClosed,
  ShoppingBag,
  Users,
  Wallet,
  Settings,
} from 'lucide-react';

function MainLayout() {
  const { currentTab } = useApp();

  const mobileNavItems = [
    { id: 'dashboard', path: '/', label: 'Boshqaruv', icon: LayoutDashboard },
    { id: 'registration', path: '/registration', label: 'Qabul', icon: Timer },
    { id: 'rooms', path: '/rooms', label: 'Xonalar', icon: DoorClosed },
    { id: 'minibar', path: '/minibar', label: 'Mini-Bar', icon: ShoppingBag },
    { id: 'crm', path: '/crm', label: 'CRM', icon: Users },
    { id: 'cashier', path: '/cashier', label: 'Kassa', icon: Wallet },
    { id: 'settings', path: '/settings', label: 'Sozlama', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Header />

      <div className="flex-1 flex max-w-full overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/registration" element={<RegistrationView />} />
            <Route path="/rooms" element={<RoomsView />} />
            <Route path="/minibar" element={<MiniBarView />} />
            <Route path="/crm" element={<CrmView />} />
            <Route path="/cashier" element={<CashierView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex justify-around items-center py-2 px-1 text-[10px]">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <ReceiptModal />
      <MiniBarModal />
      <ShiftCloseModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AppProvider, AuthProvider, useApp, useAuth } from '@/app/providers';
import { Header, Sidebar, ReceiptModal, MiniBarModal, ShiftCloseModal } from '@/widgets';
import {
  DashboardPage,
  RegistrationPage,
  RoomsPage,
  MiniBarPage,
  CrmPage,
  CashierPage,
  StaffPage,
  SettingsPage,
  LoginPage,
} from '@/pages';

import {
  LayoutDashboard,
  Timer,
  DoorClosed,
  ShoppingBag,
  Users,
  Wallet,
  UserCheck,
  Settings,
  Loader2,
} from 'lucide-react';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <span className="text-xs font-semibold">Sessiya tekshirilmoqda...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function MainLayout() {
  const { currentTab } = useApp();

  const mobileNavItems = [
    { id: 'dashboard', path: '/', label: 'Boshqaruv', icon: LayoutDashboard },
    { id: 'registration', path: '/registration', label: 'Qabul', icon: Timer },
    { id: 'rooms', path: '/rooms', label: 'Saunalar', icon: DoorClosed },
    { id: 'minibar', path: '/minibar', label: 'Mini-Bar', icon: ShoppingBag },
    { id: 'crm', path: '/crm', label: 'CRM', icon: Users },
    { id: 'cashier', path: '/cashier', label: 'Kassa', icon: Wallet },
    { id: 'staff', path: '/staff', label: 'Xodimlar', icon: UserCheck },
    { id: 'settings', path: '/settings', label: 'Sozlama', icon: Settings },
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar on desktop - fixed in place */}
        <Sidebar />

        {/* Content Area - ONLY THIS SCROLLS */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl xl:max-w-[1600px] mx-auto w-full pb-24 md:pb-8 transition-all">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/minibar" element={<MiniBarPage />} />
            <Route path="/crm" element={<CrmPage />} />
            <Route path="/cashier" element={<CashierPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/settings" element={<SettingsPage />} />
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
    <AuthProvider>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }
          />
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
}

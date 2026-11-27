import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useApp } from '@/app/providers';
import { ApiError } from '@/shared/api';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const { isAuthenticated, isAuthLoading, login } = useAuth();
  const { isDarkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

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

  if (isAuthenticated) {
    return <Navigate to={fromPath} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setError('Iltimos, login va parolni kiriting!');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(trimmedUser, password);
      navigate(fromPath, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 400) {
          setError(err.message || "Login yoki parol noto'g'ri!");
        } else {
          setError(err.message || "Server bilan bog'lanishda xatolik yuz berdi.");
        }
      } else if (err instanceof TypeError) {
        setError("Serverga ulanib bo'lmadi. Internet yoki API manzilini tekshiring.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Kirishda noma'lum xatolik yuz berdi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-br from-slate-100 via-sky-50 to-cyan-100 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950/40 transition-colors relative overflow-hidden">
      {/* Subtle decorative background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-400/20 dark:bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sky-500/20 dark:bg-sky-600/10 blur-3xl" />

      {/* Top-right Dark/Light Mode toggle */}
      <button
        type="button"
        onClick={toggleDarkMode}
        className="absolute top-5 right-5 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 transition-all"
        title={isDarkMode ? 'Kunduzgi rejim' : 'Tungi rejim'}
      >
        {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
      </button>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl shadow-sky-900/10 dark:shadow-black/50 p-7 sm:p-9 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/30 mb-4">
            <span className="text-4xl leading-none">🐬</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-600 via-sky-600 to-teal-500 dark:from-cyan-400 dark:to-teal-300 bg-clip-text text-transparent">
              DELFIN SAUNA
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              CRM
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Tizimga kirish uchun hisob ma'lumotlaringizni kiriting
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-username"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Foydalanuvchi nomi (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                autoFocus
                disabled={isSubmitting}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Parol
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-60"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-600 via-sky-600 to-teal-500 hover:from-cyan-500 hover:via-sky-500 hover:to-teal-400 shadow-lg shadow-sky-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Tizimga kirish</span>
              </>
            )}
          </button>
        </form>

        {/* Footer note */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
          <span>JWT xavfsizlik protokoli bilan himoyalangan</span>
        </div>
      </div>
    </div>
  );
}

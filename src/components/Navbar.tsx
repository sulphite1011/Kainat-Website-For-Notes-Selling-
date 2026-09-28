import React from 'react';
import { ShoppingBag, Lock, BookOpen, Sun, Moon, User, UserCheck } from 'lucide-react';
import { KainatLogo } from './KainatLogo';
import { StudentUser } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  openCart: () => void;
  openAdmin: () => void;
  unlockedCount: number;
  logoUrl?: string;
  isAdminAuthenticated?: boolean;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  currentStudent?: StudentUser | null;
  openStudentAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  openCart,
  openAdmin,
  unlockedCount,
  logoUrl,
  isAdminAuthenticated,
  theme = 'dark',
  onToggleTheme,
  currentStudent,
  openStudentAuth,
}) => {
  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors ${
      isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-zinc-950/90 border-zinc-800/80 text-zinc-100'
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Zone 1: Kainat Brand Logo (Changeable by Admin) */}
        <button
          onClick={() => setActiveTab('catalog')}
          className="text-left transition-opacity hover:opacity-90"
        >
          <KainatLogo customLogoUrl={logoUrl} size="md" theme={theme} />
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className={`hidden md:flex items-center gap-6 text-sm font-medium ${
          isLight ? 'text-slate-600' : 'text-zinc-400'
        }`}>
          <button
            onClick={() => setActiveTab('matric')}
            className={`transition-colors whitespace-nowrap ${
              isLight ? 'hover:text-slate-900' : 'hover:text-white'
            } ${
              activeTab === 'matric' ? (isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-semibold') : ''
            }`}
          >
            Matric (9th & 10th)
          </button>

          <button
            onClick={() => setActiveTab('fsc')}
            className={`transition-colors whitespace-nowrap ${
              isLight ? 'hover:text-slate-900' : 'hover:text-white'
            } ${
              activeTab === 'fsc' ? (isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-semibold') : ''
            }`}
          >
            FSc (Part 1 & 2)
          </button>

          <button
            onClick={() => setActiveTab('bsc')}
            className={`transition-colors whitespace-nowrap ${
              isLight ? 'hover:text-slate-900' : 'hover:text-white'
            } ${
              activeTab === 'bsc' ? (isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-semibold') : ''
            }`}
          >
            BSc Sciences
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              isLight ? 'hover:text-slate-900' : 'hover:text-white'
            } ${
              activeTab === 'library' ? (isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-semibold') : ''
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>My Reading Library</span>
            {unlockedCount > 0 && (
              <span className={`text-xs font-mono tabular-nums ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                ({unlockedCount})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`transition-colors whitespace-nowrap ${
              isLight ? 'hover:text-slate-900' : 'hover:text-white'
            } ${
              activeTab === 'track' ? (isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-semibold') : ''
            }`}
          >
            Track Payment
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* White / Dark Theme Switcher in Navbar */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg border transition-colors ${
                isLight
                  ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-amber-400'
              }`}
              title={isLight ? 'Switch to Dark Theme' : 'Switch to White Theme'}
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          )}

          {/* Student Login / Multi-Device Sync Button */}
          {openStudentAuth && (
            <button
              onClick={openStudentAuth}
              className={`flex items-center gap-1.5 text-xs transition-colors px-2.5 py-2 rounded-lg border ${
                currentStudent
                  ? isLight
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-emerald-800 bg-emerald-950/40 text-emerald-300 font-medium'
                  : isLight
                    ? 'border-slate-300 hover:border-slate-400 bg-white text-slate-700'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
              title={currentStudent ? `Student Account: ${currentStudent.email} (Synced)` : 'Sign in with Gmail for Multi-Device Access'}
            >
              {currentStudent ? (
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <User className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span className="hidden sm:inline">
                {currentStudent ? currentStudent.name.split(' ')[0] : 'Student Login'}
              </span>
            </button>
          )}

          <button
            onClick={openAdmin}
            className={`flex items-center gap-1.5 text-xs transition-colors px-2.5 py-2 rounded-lg border ${
              isAdminAuthenticated
                ? isLight
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold'
                  : 'border-emerald-600 bg-emerald-950/60 text-emerald-300'
                : isLight
                  ? 'border-slate-300 hover:border-slate-400 bg-white text-slate-700'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Kainat Admin Portal (Protected: Username: Kainat, Password: HamadJani)"
          >
            <Lock className={`w-3.5 h-3.5 ${isAdminAuthenticated ? 'text-emerald-600' : 'text-amber-500'}`} />
            <span className="hidden sm:inline">
              {isAdminAuthenticated ? 'Kainat (Admin)' : 'Admin'}
            </span>
          </button>

          <button
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Checkout</span>
            {cartCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-emerald-950 font-mono tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

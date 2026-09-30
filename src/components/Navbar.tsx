import React from 'react';
import { ShoppingCart, ShieldCheck, Sun, Moon, BookOpen, User, Search } from 'lucide-react';
import { KainatLogo } from './KainatLogo';
import { StudentUser } from '../types';

interface NavbarProps {
  cartCount: number;
  unlockedCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  activeTab: 'catalog' | 'library' | 'track' | 'matric' | 'fsc' | 'bsc';
  setActiveTab: (tab: 'catalog' | 'library' | 'track' | 'matric' | 'fsc' | 'bsc') => void;
  logoUrl?: string;
  isLight?: boolean;
  onToggleTheme?: () => void;
  currentStudent?: StudentUser | null;
  openStudentAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  unlockedCount,
  onOpenCart,
  onOpenAdmin,
  activeTab,
  setActiveTab,
  logoUrl,
  isLight = false,
  onToggleTheme,
  currentStudent,
  openStudentAuth,
}) => {
  return (
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 ${
      isLight ? 'bg-white/90 border-slate-200 text-slate-800' : 'bg-zinc-950/90 border-zinc-800/80 text-zinc-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => setActiveTab('catalog')}
          className="flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <KainatLogo customLogoUrl={logoUrl} size="md" isLight={isLight} />
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'catalog'
                ? isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Courses
          </button>

          <button
            onClick={() => setActiveTab('matric')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'matric'
                ? isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Matric (9th & 10th)
          </button>

          <button
            onClick={() => setActiveTab('fsc')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'fsc'
                ? isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            FSc (Part 1 & 2)
          </button>

          <button
            onClick={() => setActiveTab('bsc')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'bsc'
                ? isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            BSc Sciences
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'library'
                ? isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>My Library</span>
            {unlockedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                {unlockedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'track'
                ? isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Track Order
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isLight
                  ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-amber-400'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          )}

          {/* Student Auth Button */}
          {openStudentAuth && (
            <button
              onClick={openStudentAuth}
              className={`flex items-center gap-1.5 text-xs transition-colors px-3 py-1.5 rounded-xl border cursor-pointer ${
                currentStudent
                  ? isLight
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                    : 'border-emerald-500/50 bg-emerald-950/60 text-emerald-300 font-bold shadow-sm'
                  : isLight
                    ? 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                    : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 font-medium'
              }`}
              title={currentStudent ? `Signed in as ${currentStudent.name} (${currentStudent.email})` : 'Student Login'}
            >
              {currentStudent ? (
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="inline-block max-w-[110px] sm:max-w-[160px] truncate">
                {currentStudent ? currentStudent.name : 'Student Login'}
              </span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-950/40 cursor-pointer active:scale-95"
            title="Open Checkout Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-emerald-800 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-emerald-700 shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Portal Button */}
          <button
            onClick={onOpenAdmin}
            className={`p-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-300 hover:bg-slate-100 text-slate-600'
                : 'border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
            }`}
            title="Owner Portal"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

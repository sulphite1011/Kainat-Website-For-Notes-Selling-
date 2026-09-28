import React, { useState } from 'react';
import { StudentUser } from '../types';
import { X, ShieldCheck, CheckCircle2, LogOut, KeyRound, ExternalLink, Sparkles, AlertCircle, BookOpen } from 'lucide-react';
import { useClerkConfig } from '../context/ClerkContext';
import { useUser, useClerk, SignInButton, SignOutButton } from '@clerk/clerk-react';

interface StudentAuthModalProps {
  isOpen: boolean;
  currentStudent: StudentUser | null;
  onClose: () => void;
  onStudentAuthenticated: (student: StudentUser) => void;
  onStudentLoggedOut: () => void;
  title?: string;
  subtitle?: string;
}

// Inner view when Clerk key is configured and ClerkProvider is active
const ClerkActiveAuthView: React.FC<{
  currentStudent: StudentUser | null;
  onClose: () => void;
  onStudentAuthenticated: (student: StudentUser) => void;
  onStudentLoggedOut: () => void;
  title?: string;
  subtitle?: string;
}> = ({ currentStudent, onClose, onStudentAuthenticated, onStudentLoggedOut, title, subtitle }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();

  const handleSignOut = async () => {
    try {
      await clerk.signOut();
    } catch {
      // ignore
    }
    onStudentLoggedOut();
  };

  return (
    <div className="space-y-6">
      {isSignedIn && user ? (
        // Student is signed in with Clerk / Google
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
            <div className="relative inline-block">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'Student'}
                  className="w-16 h-16 rounded-full mx-auto border-2 border-emerald-400 shadow-md object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full mx-auto bg-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                  {(user.firstName || user.fullName || 'S')[0].toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                {user.fullName || user.firstName || 'Student'}
              </h3>
              <p className="text-xs text-emerald-300 font-mono mt-0.5">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified via Google (Clerk)</span>
            </div>
          </div>

          <div className="text-xs text-zinc-400 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 space-y-1">
            <p className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Multi-Device Access Active
            </p>
            <p>
              All purchased notes linked to this Gmail are instantly unlocked on your current browser and across all your devices.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Continue to Notes
            </button>
            <button
              onClick={handleSignOut}
              className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl border border-zinc-700 transition-all flex items-center justify-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        // Student is NOT signed in - show 1-click Google Sign In via Clerk
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <p className="text-xs text-zinc-400">
              {subtitle || 'Sign in with your Google account to access and sync your purchased courses across your phone, tablet, and laptop.'}
            </p>
          </div>

          {/* 1-Click Google Sign In Button */}
          <div className="space-y-3 pt-1">
            <SignInButton mode="modal">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
              >
                {/* Official Google G SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.39 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 10.02 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.61 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>Continue with Google / Gmail</span>
              </button>
            </SignInButton>
          </div>

          {/* Benefits list */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-2 text-left">
            <p className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Seamless & Secure Access
            </p>
            <ul className="text-[11px] text-zinc-400 space-y-1.5 pl-5 list-disc marker:text-emerald-500">
              <li>Instant 1-click login without waiting for email OTP codes</li>
              <li>Read all notes and PDFs securely on any phone or laptop</li>
              <li>Official Google verification protected by Clerk security</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Setup view when Clerk publishable key has not yet been saved in Admin
const ClerkPendingSetupView: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveKey } = useClerkConfig();

  const handleQuickKeySave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (!trimmed.startsWith('pk_test_') && !trimmed.startsWith('pk_live_')) {
      setError('Key must start with "pk_test_" or "pk_live_"');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await saveKey(trimmed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 text-center">
      <div className="space-y-2">
        <p className="text-xs text-zinc-400">
          Sign in with your Google or Gmail account to instantly read and sync all your purchased notes and books on any device.
        </p>
      </div>

      {/* Student 1-Click Google Button */}
      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={() => setShowAdminInput(true)}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
        >
          {/* Official Google G SVG */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.39 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 10.02 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.61 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span>Continue with Google / Gmail</span>
        </button>
      </div>

      {/* Benefits */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-2 text-left">
        <p className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Seamless Google Authentication
        </p>
        <ul className="text-[11px] text-zinc-400 space-y-1.5 pl-5 list-disc marker:text-emerald-500">
          <li>1-Click login without passwords or email OTP delays</li>
          <li>Instant unlock on Android, iPhone, Windows, iPad & Mac</li>
          <li>Protected by official Google & Clerk security protocols</li>
        </ul>
      </div>

      {/* Admin configuration drawer (discreet, only if clicked) */}
      {showAdminInput ? (
        <form onSubmit={handleQuickKeySave} className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-left space-y-2 animate-in fade-in duration-200">
          <p className="text-[11px] text-purple-300 font-medium">
            Store Owner: Paste your Clerk Publishable Key (`pk_test_...` or `pk_live_...` from <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="underline text-white">dashboard.clerk.com</a>) to activate:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                setError('');
              }}
              placeholder="pk_test_xxxxxxxxxxxxxxxxxxxxxxxx"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Activate'}
            </button>
          </div>
          {error && <p className="text-[11px] text-rose-400">{error}</p>}
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdminInput(true)}
          className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
        >
          Administrator? Connect Clerk Publishable Key
        </button>
      )}
    </div>
  );
};

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  currentStudent,
  onClose,
  onStudentAuthenticated,
  onStudentLoggedOut,
  title,
  subtitle,
}) => {
  const { isConfigured } = useClerkConfig();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {title || (currentStudent ? 'Student Account' : 'Sign in with Google')}
              </h2>
              <span className="text-[11px] text-purple-400 font-medium">
                1-Click Google Access
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isConfigured ? (
          <ClerkActiveAuthView
            currentStudent={currentStudent}
            onClose={onClose}
            onStudentAuthenticated={onStudentAuthenticated}
            onStudentLoggedOut={onStudentLoggedOut}
            title={title}
            subtitle={subtitle}
          />
        ) : (
          <ClerkPendingSetupView onClose={onClose} />
        )}
      </div>
    </div>
  );
};

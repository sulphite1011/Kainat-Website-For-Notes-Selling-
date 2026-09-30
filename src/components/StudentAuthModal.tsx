import React from 'react';
import { StudentUser } from '../types';
import { X, ShieldCheck, CheckCircle2, LogOut, BookOpen } from 'lucide-react';
import { useClerkConfig } from '../context/ClerkContext';
import { useUser, useClerk, SignInButton } from '@clerk/clerk-react';

interface StudentAuthModalProps {
  isOpen: boolean;
  currentStudent: StudentUser | null;
  onClose: () => void;
  onGoToLibrary: () => void;
  onStudentAuthenticated: (student: StudentUser) => void;
  onStudentLoggedOut: () => void;
  title?: string;
  subtitle?: string;
}

// Active view when ClerkProvider is loaded and configured
const ClerkActiveAuthView: React.FC<{
  currentStudent: StudentUser | null;
  onClose: () => void;
  onGoToLibrary: () => void;
  onStudentAuthenticated: (student: StudentUser) => void;
  onStudentLoggedOut: () => void;
  title?: string;
  subtitle?: string;
}> = ({ currentStudent, onClose, onGoToLibrary, onStudentAuthenticated, onStudentLoggedOut, title, subtitle }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const clerk = useClerk();

  // Immediately synchronize student profile when signed in via Clerk
  React.useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      if (email) {
        const studentObj: StudentUser = {
          id: user.id || `usr_${Date.now()}`,
          name: user.fullName || user.firstName || 'Student',
          email: email.toLowerCase().trim(),
          avatarUrl: user.imageUrl || '',
          phone: user.primaryPhoneNumber?.phoneNumber || '',
          verifiedAt: new Date().toISOString(),
        };
        onStudentAuthenticated(studentObj);
      }
    }
  }, [isLoaded, isSignedIn, user, onStudentAuthenticated]);

  // If user signed in because they clicked "Add to Cart", close automatically
  React.useEffect(() => {
    if (isLoaded && isSignedIn && user && title?.includes('Add to Cart')) {
      const timer = setTimeout(() => {
        onClose();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, user, title, onClose]);

  const handleSignOut = async () => {
    try {
      await clerk.signOut();
    } catch (err) {
      console.warn('Clerk signOut error:', err);
    }
    onStudentLoggedOut();
    onClose();
  };

  const studentAvatar = user?.imageUrl || currentStudent?.avatarUrl;
  const studentDisplayName = user?.fullName || user?.firstName || currentStudent?.name || 'Student';
  const studentEmail = user?.primaryEmailAddress?.emailAddress || currentStudent?.email || '';

  return (
    <div className="space-y-5">
      {isSignedIn && user ? (
        // Student is signed in via Clerk
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2.5">
            <div className="relative inline-block">
              {studentAvatar ? (
                <img
                  src={studentAvatar}
                  alt={studentDisplayName}
                  className="w-16 h-16 rounded-full mx-auto border-2 border-emerald-400 object-cover shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-full mx-auto bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {studentDisplayName[0].toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">
                {studentDisplayName}
              </h3>
              <p className="text-xs text-emerald-300 font-mono">
                {studentEmail}
              </p>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified via Google
            </span>
          </div>

          <p className="text-xs text-zinc-400 text-center leading-relaxed">
            Your purchased courses are permanently linked to this Gmail and accessible on any mobile, tablet, or laptop.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onGoToLibrary}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to My Notes</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="py-2.5 px-3 bg-zinc-800 hover:bg-rose-950 hover:border-rose-700/50 hover:text-rose-300 text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              title="Sign out of student account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        // Student is NOT signed in: 1-click Google Sign In with Clerk
        <div className="space-y-4">
          <p className="text-xs text-zinc-400 text-center leading-relaxed">
            {subtitle || 'Sign in with your Google account to access all your purchased notes and books on any mobile, tablet, or laptop.'}
          </p>

          <SignInButton mode="modal">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
            >
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
              <span>Continue with Google</span>
            </button>
          </SignInButton>

          <p className="text-[11px] text-zinc-500 text-center">
            Instant 1-click access · No password required · Synced on mobile & laptop
          </p>
        </div>
      )}
    </div>
  );
};

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  currentStudent,
  onClose,
  onGoToLibrary,
  onStudentAuthenticated,
  onStudentLoggedOut,
  title,
  subtitle,
}) => {
  const { isConfigured } = useClerkConfig();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {title || (currentStudent ? 'Student Account' : 'Student Sign In')}
              </h2>
              <span className="text-[11px] text-emerald-400 font-medium">
                Kainat Notes Hub Access
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

        {/* Content: Clerk 1-Click Google Authentication */}
        {isConfigured ? (
          <ClerkActiveAuthView
            currentStudent={currentStudent}
            onClose={onClose}
            onGoToLibrary={onGoToLibrary}
            onStudentAuthenticated={onStudentAuthenticated}
            onStudentLoggedOut={onStudentLoggedOut}
            title={title}
            subtitle={subtitle}
          />
        ) : (
          <div className="space-y-4 py-2 text-center">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <p className="text-xs text-amber-200 font-semibold">
                Google Login is ready to connect.
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Please set <code className="text-amber-400 font-mono">CLERK_PUBLISHABLE_KEY</code> in your Cloudflare Pages or host environment variables to enable 1-click Google Sign In.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

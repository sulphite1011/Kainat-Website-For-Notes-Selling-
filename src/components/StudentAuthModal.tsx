import React, { useState, useEffect } from 'react';
import { StudentUser } from '../types';
import { X, Mail, ShieldCheck, CheckCircle2, ArrowRight, UserCheck, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import { apiStudentRequestCode, apiStudentVerifyLogin, apiStudentGoogleLogin, saveStoredStudent, getStoredSettings } from '../services/apiClient';

interface StudentAuthModalProps {
  isOpen: boolean;
  currentStudent: StudentUser | null;
  onClose: () => void;
  onStudentAuthenticated: (student: StudentUser) => void;
  onStudentLoggedOut: () => void;
  title?: string;
  subtitle?: string;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  currentStudent,
  onClose,
  onStudentAuthenticated,
  onStudentLoggedOut,
  title,
  subtitle,
}) => {
  const [email, setEmail] = useState(currentStudent?.email || '');
  const [name, setName] = useState(currentStudent?.name || '');
  const [phone, setPhone] = useState(currentStudent?.phone || '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Load Google Identity Services script if configured
  useEffect(() => {
    if (!isOpen) return;
    const settings = getStoredSettings();
    const googleClientId = settings.googleClientId || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

    if (googleClientId && !window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
          });
          const buttonDiv = document.getElementById('googleSignInBtn');
          if (buttonDiv) {
            window.google.accounts.id.renderButton(buttonDiv, {
              theme: 'filled_blue',
              size: 'large',
              width: '100%',
              text: 'continue_with',
              shape: 'rectangular',
            });
          }
        } catch (e) {
          console.warn('Google Identity initialization fallback:', e);
        }
      };
      document.body.appendChild(script);
    }
  }, [isOpen]);

  // Handle countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const result = await apiStudentGoogleLogin(response.credential);
      if (result.success && result.student) {
        onStudentAuthenticated(result.student);
        onClose();
      } else {
        setStatusMessage({ type: 'error', text: result.message || 'Google Sign-In failed.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Error connecting with Google Sign-In.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOneClickGooglePrompt = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@gmail.com')) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your @gmail.com address above to sign in with Google.',
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const result = await apiStudentGoogleLogin(undefined, {
        email: cleanEmail,
        name: name.trim() || cleanEmail.split('@')[0],
      });
      if (result.success && result.student) {
        onStudentAuthenticated(result.student);
        onClose();
      } else {
        setStatusMessage({ type: 'error', text: result.message || 'Google authentication failed.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Error connecting Google account.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Gmail address.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await apiStudentRequestCode(cleanEmail, name.trim(), phone.trim());
      if (res.success) {
        setStep('verify');
        setResendCooldown(30);
        setCode(''); // MUST BE EMPTY: student reads the code from their Gmail inbox!
        if (res.smtpNotConfigured) {
          setStatusMessage({
            type: 'warning',
            text: res.message || `Code generated for ${cleanEmail}. Please configure your Gmail SMTP in Admin Portal > Settings to deliver emails directly.`,
          });
        } else {
          setStatusMessage({
            type: 'success',
            text: `A 6-digit verification code has been sent directly to ${cleanEmail}. Please check your Inbox and Spam folder.`,
          });
        }
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Failed to dispatch verification code.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error communicating with server.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanCode || cleanCode.length < 4) {
      setStatusMessage({ type: 'error', text: 'Please enter the 6-digit verification code from your Gmail inbox.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await apiStudentVerifyLogin(cleanEmail, cleanCode, name.trim(), phone.trim());
      if (res.success && res.student) {
        onStudentAuthenticated(res.student);
        onClose();
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message || 'Incorrect verification code. Please check your Gmail inbox and enter the 6-digit code.',
        });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Verification service error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    saveStoredStudent(null);
    onStudentLoggedOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* If already logged in */}
        {currentStudent ? (
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <UserCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Student Account Active
              </span>
              <h3 className="text-lg font-bold text-white">Signed in with Gmail</h3>
              <p className="text-xs text-zinc-400">
                Your purchased courses are synced to this Gmail and available across all your devices.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-left space-y-1 text-xs font-mono">
              <div className="text-zinc-400">
                Name: <span className="text-white font-semibold">{currentStudent.name}</span>
              </div>
              <div className="text-zinc-400">
                Gmail: <span className="text-emerald-400 font-semibold">{currentStudent.email}</span>
              </div>
              {currentStudent.phone && (
                <div className="text-zinc-400">
                  Phone: <span className="text-zinc-300">{currentStudent.phone}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/40"
              >
                Continue Learning
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2.5 border border-zinc-800 hover:border-red-900/60 bg-zinc-950 hover:bg-red-950/30 text-zinc-400 hover:text-red-400 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                title="Sign out of this device"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>{title || 'Cross-Device Student Login'}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Sign In to Kainat Notes Hub</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {subtitle ||
                  'Your courses are bound to your Gmail. Log in from your phone, laptop, or tablet anytime to access your notes.'}
              </p>
            </div>

            {/* Official Google Sign-In container / button */}
            <div className="space-y-2 pt-1">
              <div id="googleSignInBtn" className="w-full"></div>

              <button
                type="button"
                onClick={handleOneClickGooglePrompt}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.665-5.18 3.665-9.12z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.44 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.43l4.03-3.14z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.28 2.56 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>Continue with Google Account</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                  Or use Gmail Verification Code
                </span>
                <div className="flex-grow border-t border-zinc-800"></div>
              </div>
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/70 border border-emerald-800/80 text-emerald-300'
                    : statusMessage.type === 'warning'
                    ? 'bg-amber-950/70 border border-amber-800/80 text-amber-300'
                    : 'bg-red-950/70 border border-red-800/80 text-red-300'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : statusMessage.type === 'warning' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                ) : (
                  <X className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                )}
                <span className="leading-relaxed">{statusMessage.text}</span>
              </div>
            )}

            {step === 'input' ? (
              <form onSubmit={handleRequestCode} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Student Gmail Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@gmail.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Student Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ali Raza"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">WhatsApp / Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300 1234567"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5"
                  >
                    <span>{isLoading ? 'Dispatching Email...' : 'Send Verification Code to My Gmail'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Verification code sent to:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('input');
                        setStatusMessage(null);
                      }}
                      className="text-emerald-400 hover:underline text-[11px]"
                    >
                      Change Email
                    </button>
                  </div>
                  <div className="text-emerald-400 font-mono font-bold text-sm truncate">{email}</div>
                  <p className="text-[11px] text-zinc-400 pt-1">
                    Please open your Gmail app or mail.google.com, copy the 6-digit code, and enter it below.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                    <span>Enter 6-Digit Verification Code</span>
                    <span className="text-[11px] text-zinc-500">From Gmail Inbox</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-center text-lg font-mono font-bold tracking-[0.4em] text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={() => handleRequestCode()}
                    className="text-emerald-400 hover:text-emerald-300 disabled:text-zinc-600 font-medium flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                  </button>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('input');
                      setStatusMessage(null);
                    }}
                    className="px-4 py-2.5 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || code.trim().length < 4}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5"
                  >
                    <span>{isLoading ? 'Verifying...' : 'Verify Code & Log In'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

declare global {
  interface Window {
    google?: any;
  }
}

import React from 'react';
import { Mail, Phone, MessageSquare, ShieldCheck, Lock } from 'lucide-react';
import { KainatLogo } from './KainatLogo';

interface FooterProps {
  onOpenAdmin: () => void;
  onSelectTab: (tab: string) => void;
  logoUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onSelectTab, logoUrl }) => {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <KainatLogo customLogoUrl={logoUrl} size="md" />
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mt-2">
              Curated chapter-by-chapter source notes, derivations, formulas, and past paper solutions for Matric (9th & 10th), FSc (Part 1 & 2), and BSc university students by Kainat.
            </p>
            <div className="text-xs text-zinc-500 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Protected Read-Only Document Reader with Dynamic Watermarks</span>
            </div>
          </div>

          {/* Quick Academic Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Academic Levels</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('matric')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Matric (9th & 10th Class)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('fsc')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  FSc (Part 1 & 2 Pre-Eng/Pre-Med)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('bsc')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  BSc Higher Sciences
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('library')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  My Reading Library
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Seller Contact Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Kainat's Contact & Payment</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-zinc-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>EasyPaisa: <strong className="text-white font-mono">03415892099</strong></span>
              </li>
              <li className="flex items-center gap-2 text-zinc-300">
                <MessageSquare className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>WhatsApp: <strong className="text-white font-mono">0324 9059918</strong></span>
              </li>
              <li className="flex items-center gap-2 text-zinc-300">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Email: <a href="mailto:ka8984510@gmail.com" className="text-zinc-200 hover:underline">ka8984510@gmail.com</a></span>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 transition-colors"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Kainat Admin Login</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div>
            © {new Date().getFullYear()} Kainat Notes Hub. All intellectual rights reserved.
          </div>
          <div>
            Only readable online · Non-downloadable protected files
          </div>
        </div>
      </div>
    </footer>
  );
};

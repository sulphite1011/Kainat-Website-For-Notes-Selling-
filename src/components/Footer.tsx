import React from 'react';
import { Smartphone, CheckCircle2, ShieldCheck, Mail, Heart } from 'lucide-react';
import { KainatLogo } from './KainatLogo';

interface FooterProps {
  easyPaisaNumber?: string;
  whatsAppNumber?: string;
  ownerEmail?: string;
  logoUrl?: string;
  onOpenTrack?: () => void;
  onOpenAdmin?: () => void;
  onSelectCategory?: (cat: string) => void;
  isLight?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  easyPaisaNumber = '03415892099',
  whatsAppNumber = '0324 9059918',
  ownerEmail = 'ka8984510@gmail.com',
  logoUrl,
  onOpenTrack,
  onOpenAdmin,
  onSelectCategory,
  isLight = false,
}) => {
  return (
    <footer className={`border-t transition-colors ${
      isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <KainatLogo customLogoUrl={logoUrl} size="md" isLight={isLight} />
            <p className="text-xs leading-relaxed max-w-md">
              Verified board and university source notes, solved papers, and derivations by Kainat. Protected digital document reader with instant multi-device access.
            </p>
            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-1">
              <span>FBISE & Punjab Board Syllabus 2026</span>
              <span>·</span>
              <span>Updated Regularly</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
              Classes
            </h4>
            <ul className="text-xs space-y-2">
              <li>
                <button
                  onClick={() => onSelectCategory && onSelectCategory('Matric-9th')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Matric 9th Notes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory && onSelectCategory('Matric-10th')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Matric 10th Notes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory && onSelectCategory('FSc-Part1')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  FSc Part-1 (11th)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory && onSelectCategory('FSc-Part2')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  FSc Part-2 (12th)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory && onSelectCategory('BSc-Year1')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  BSc Higher Sciences
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Contacts */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
              Student Support
            </h4>
            <ul className="text-xs space-y-2.5">
              <li className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>EasyPaisa: <strong className="text-zinc-200 font-mono">{easyPaisaNumber}</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <a
                  href={`https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-emerald-400"
                >
                  WhatsApp: <strong className="text-zinc-200 font-mono">{whatsAppNumber}</strong>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">{ownerEmail}</span>
              </li>
              {onOpenTrack && (
                <li className="pt-1">
                  <button
                    onClick={onOpenTrack}
                    className="text-xs text-emerald-400 hover:underline cursor-pointer font-semibold"
                  >
                    Track Order Status &rarr;
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} Kainat Notes Hub. All academic rights reserved.</p>
          <div className="flex items-center gap-4">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hover:text-zinc-400 transition-colors cursor-pointer"
              >
                Owner Portal
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';

interface KainatLogoProps {
  customLogoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
}

export const KainatLogo: React.FC<KainatLogoProps> = ({
  customLogoUrl,
  size = 'md',
  showSubtitle = true,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  // If Kainat uploaded a custom picture for the logo, show it
  if (customLogoUrl && customLogoUrl.trim() !== '') {
    const sizeClasses = {
      sm: 'h-7 w-auto object-contain rounded',
      md: 'h-9 w-auto max-w-[170px] object-contain rounded-md',
      lg: 'h-14 w-auto max-w-[240px] object-contain rounded-lg',
    }[size];

    return (
      <div className="flex items-center gap-2.5">
        <img
          src={customLogoUrl}
          alt="Kainat Notes Logo"
          referrerPolicy="no-referrer"
          className={`${sizeClasses} ${isLight ? 'border border-slate-200' : 'border border-zinc-700/60'} shadow-sm`}
        />
        {showSubtitle && (
          <div className="hidden sm:block">
            <span className={`text-xs font-bold block leading-tight ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>
              Kainat Notes
            </span>
            <span className={`text-[10px] block font-mono font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
              Official Store
            </span>
          </div>
        )}
      </div>
    );
  }

  // Stylish Demo Logo with "Kainat" branding
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
  }[size];

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }[size];

  return (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      {/* Calligraphic Emblem Icon */}
      <div
        className={`${iconSizes} rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 p-[1.5px] shadow-lg shadow-emerald-950/20 group-hover:scale-105 transition-transform duration-200`}
      >
        <div className={`w-full h-full ${isLight ? 'bg-slate-900' : 'bg-zinc-950'} rounded-[10px] flex items-center justify-center relative overflow-hidden`}>
          <span className="font-extrabold font-serif bg-gradient-to-r from-emerald-300 to-teal-100 bg-clip-text text-transparent">
            K
          </span>
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400/30 rounded-full blur-[2px]" />
        </div>
      </div>

      {/* Wordmark */}
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={`${titleSizes} font-black tracking-tight ${
              isLight
                ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-white via-zinc-100 to-emerald-300 bg-clip-text text-transparent'
            }`}
          >
            Kainat
          </span>
          <span className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded font-mono ${
            isLight
              ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
              : 'bg-emerald-950 border border-emerald-800/80 text-emerald-400'
          }`}>
            Notes
          </span>
        </div>
        {showSubtitle && (
          <span className={`text-[10px] font-medium block ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Matric · FSc · BSc Curriculum
          </span>
        )}
      </div>
    </div>
  );
};
